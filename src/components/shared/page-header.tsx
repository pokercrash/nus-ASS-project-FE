import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  title: string;
  description: string;
  badge?: string;
};

export function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="space-y-3">
      {badge ? <Badge variant="success">{badge}</Badge> : null}
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}
