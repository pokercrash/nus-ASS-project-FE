import { ShieldCheck, Users, Wrench } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Admin portal"
        title="Platform administration"
        description="Use this portal to manage resources and monitor operational access."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-lift">
          <CardHeader className="pb-3">
            <CardDescription>Role</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Admin
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="card-lift">
          <CardHeader className="pb-3">
            <CardDescription>Primary task</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Resource control
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="card-lift">
          <CardHeader className="pb-3">
            <CardDescription>Audience</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Internal operators
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next step</CardTitle>
          <CardDescription>Open Resource Management to create and maintain bookable resources.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This admin area is separated from the user booking area by route and role guard.
        </CardContent>
      </Card>
    </div>
  );
}
