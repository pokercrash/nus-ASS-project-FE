const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const DEFAULT_RESOURCE_API_BASE_URL =
  "http://resource-service-alb-443948422.ap-southeast-1.elb.amazonaws.com";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function getResourceApiBaseUrl() {
  return DEFAULT_RESOURCE_API_BASE_URL;
}

function getProxyPath(request) {
  const incomingUrl = new URL(request.url ?? "/", "http://vercel.local");
  const prefixes = ["/api/resource-proxy", "/resource-api"];
  const matchingPrefix = prefixes.find((prefix) => incomingUrl.pathname.startsWith(prefix));

  if (matchingPrefix) {
    return incomingUrl.pathname.slice(matchingPrefix.length) || "/";
  }

  const pathParts = request.query?.path;
  if (Array.isArray(pathParts) && pathParts.length > 0) {
    return `/${pathParts.map((part) => encodeURIComponent(part)).join("/")}`;
  }

  if (typeof pathParts === "string" && pathParts) {
    return `/${encodeURIComponent(pathParts)}`;
  }

  return "/";
}

function getTargetUrl(request) {
  const incomingUrl = new URL(request.url ?? "/", "http://vercel.local");
  const targetUrl = new URL(`${getResourceApiBaseUrl()}${getProxyPath(request)}`);

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  return targetUrl;
}

function buildForwardHeaders(requestHeaders) {
  const headers = new Headers();

  Object.entries(requestHeaders).forEach(([key, value]) => {
    if (HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase()) || value === undefined) {
      return;
    }

    headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
  });

  headers.set("x-forwarded-by", "vercel-resource-proxy");

  return headers;
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(chunks.length > 0 ? Buffer.concat(chunks) : undefined));
    request.on("error", reject);
  });
}

function copyResponseHeaders(upstreamResponse, response) {
  upstreamResponse.headers.forEach((value, key) => {
    if (key === "set-cookie" || HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      return;
    }

    response.setHeader(key, value);
  });

  const cookies =
    typeof upstreamResponse.headers.getSetCookie === "function"
      ? upstreamResponse.headers.getSetCookie()
      : upstreamResponse.headers.get("set-cookie")
        ? [upstreamResponse.headers.get("set-cookie")]
        : [];

  if (cookies.length > 0) {
    response.setHeader("set-cookie", cookies);
  }
}

export default async function handler(request, response) {
  let targetUrl;

  try {
    targetUrl = getTargetUrl(request);
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Proxy is not configured.",
    });
    return;
  }

  try {
    const method = request.method ?? "GET";
    const body = method === "GET" || method === "HEAD" ? undefined : await readRequestBody(request);
    const upstreamResponse = await fetch(targetUrl, {
      body,
      cache: "no-store",
      headers: buildForwardHeaders(request.headers),
      method,
      redirect: "manual",
    });

    const responseBody = Buffer.from(await upstreamResponse.arrayBuffer());

    response.statusCode = upstreamResponse.status;
    copyResponseHeaders(upstreamResponse, response);
    response.end(responseBody);
  } catch (error) {
    sendJson(response, 502, {
      error: "Resource service proxy request failed.",
      detail: error instanceof Error ? error.message : "Unknown upstream error.",
    });
  }
}
