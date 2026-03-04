import { useState } from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reminderFeed = [
  {
    title: "General Consultation",
    detail: "Reminder set for today, 1 hour before",
    time: "2:30 PM",
  },
  {
    title: "Physiotherapy Session",
    detail: "Reminder set for tomorrow morning",
    time: "8:00 AM",
  },
  {
    title: "Dental Cleaning",
    detail: "Follow-up reminder scheduled",
    time: "Mon, 9:00 AM",
  },
];

export function NotificationsPage() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Reminders"
        title="Notification center"
        description="Choose how and when you want to be reminded about upcoming appointments."
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Upcoming reminder feed</CardTitle>
            <CardDescription>Notifications queued for your booked sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminderFeed.map((item, index) => (
              <div
                key={`${item.title}-${item.time}`}
                className="animate-slide-up rounded-lg border border-border bg-background/70 p-3 card-lift"
                style={{ animationDelay: `${80 + index * 70}ms` }}
              >
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <Badge variant="success">{item.time}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-slide-up animate-delay-1">
          <CardHeader>
            <CardTitle>Delivery preferences</CardTitle>
            <CardDescription>Control channels for appointment updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between rounded-lg border border-border bg-background/70 px-3 py-2 text-sm card-lift">
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email reminders
              </span>
              <input type="checkbox" checked={email} onChange={(event) => setEmail(event.target.checked)} />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-border bg-background/70 px-3 py-2 text-sm card-lift">
              <span className="inline-flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Push notifications
              </span>
              <input type="checkbox" checked={push} onChange={(event) => setPush(event.target.checked)} />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-border bg-background/70 px-3 py-2 text-sm card-lift">
              <span className="inline-flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                SMS alerts
              </span>
              <input type="checkbox" checked={sms} onChange={(event) => setSms(event.target.checked)} />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
