import { useState } from "react";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/use-auth";

export function AccountPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.username ?? "");
  const [phone, setPhone] = useState("+");

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Account"
        title="Profile and preferences"
        description="Update your personal details and security preferences."
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Personal information
            </CardTitle>
            <CardDescription>Keep your profile details current.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+65..." />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value="you@example.com" disabled />
            </div>

            <Button className="card-lift">Save changes</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="animate-slide-up animate-delay-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Protect your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="success">Signed in as: {user?.username ?? "guest"}</Badge>
              <p className="text-sm text-muted-foreground">Session management is active with secure token refresh.</p>
              <Button variant="outline" className="w-full card-lift">
                Manage active sessions
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-slide-up animate-delay-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-5 w-5 text-primary" />
                Password
              </CardTitle>
              <CardDescription>Update your password regularly.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full card-lift">
                Change password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
