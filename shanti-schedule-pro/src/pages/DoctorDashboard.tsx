import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi, type ScheduleItem } from "@/lib/api";
import { Clock, Check, X } from "lucide-react";

export default function DoctorDashboard() {
  const { request } = useApi();
  const queryClient = useQueryClient();

  const schedules = useQuery<{ items: ScheduleItem[] }>({
    queryKey: ["doctor-schedules"],
    queryFn: () => request("/api/schedules/for-doctor"),
  });

  const complete = useMutation({
    mutationFn: (id: string) => request(`/api/schedules/${id}/complete`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor-schedules"] }),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => request(`/api/schedules/${id}/cancel`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctor-schedules"] }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : schedules.data?.items?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules.data.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4">
                    <div>
                      <div className="font-medium">Patient {item.userId}</div>
                      <div className="text-sm text-muted-foreground">{new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleTimeString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center text-sm text-muted-foreground"><Clock className="h-4 w-4 mr-1" /> {item.status}</span>
                      <Button size="sm" variant="outline" onClick={() => cancel.mutate(item._id)} disabled={cancel.isPending}> <X className="h-4 w-4 mr-1" /> Cancel</Button>
                      <Button size="sm" onClick={() => complete.mutate(item._id)} disabled={complete.isPending}> <Check className="h-4 w-4 mr-1" /> Complete</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No appointments today.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Records module placeholder. We can integrate EHR or notes here.</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


