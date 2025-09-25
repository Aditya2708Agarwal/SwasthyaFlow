import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Pill, Stethoscope, Clock, Plus, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi, type ScheduleItem } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function PatientDashboard() {
  const { request } = useApi();
  const queryClient = useQueryClient();
  const [openBook, setOpenBook] = useState(false);
  const [openRecords, setOpenRecords] = useState(false);
  const [form, setForm] = useState({ therapistId: "", startTime: "", endTime: "", notes: "" });

  const schedules = useQuery<{ items: ScheduleItem[] }>({
    queryKey: ["schedules"],
    queryFn: () => request("/api/schedules"),
  });

  const createSchedule = useMutation({
    mutationFn: async () =>
      request<{ item: ScheduleItem }>("/api/schedules", {
        method: "POST",
        body: JSON.stringify(form),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setOpenBook(false);
      setForm({ therapistId: "", startTime: "", endTime: "", notes: "" });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 grid gap-8">
        {/* Hero */}
        <div className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-muted-foreground mt-1">Manage your care, appointments, and records from one place.</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={openBook} onOpenChange={setOpenBook}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" />Book appointment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book appointment</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="therapistId">Doctor ID</Label>
                      <Input id="therapistId" value={form.therapistId} onChange={(e) => setForm({ ...form, therapistId: e.target.value })} />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="startTime">Start</Label>
                        <Input id="startTime" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endTime">End</Label>
                        <Input id="endTime" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setOpenBook(false)}>Cancel</Button>
                      <Button onClick={() => createSchedule.mutate()} disabled={createSchedule.isPending}>Confirm</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={openRecords} onOpenChange={setOpenRecords}>
                <DialogTrigger asChild>
                  <Button variant="outline"><FileText className="mr-2 h-4 w-4" />View records</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Your records</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm text-muted-foreground">Records module placeholder. We can integrate real records next.</div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-2xl font-bold">
              <Calendar className="h-5 w-5 text-primary" /> 2
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Active prescriptions</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-2xl font-bold">
              <Pill className="h-5 w-5 text-primary" /> 5
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Assigned doctor</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-2xl font-bold">
              <Stethoscope className="h-5 w-5 text-primary" /> Dr. Mehta
            </CardContent>
          </Card>
        </div>

        {/* Upcoming appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : schedules.data?.items?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules.data.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                    <div>
                      <div className="font-medium">With {item.therapistId}</div>
                      <div className="text-sm text-muted-foreground">{new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleTimeString()}</div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground"><Clock className="h-4 w-4 mr-1" /> {item.status || "scheduled"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No upcoming appointments.</div>
            )}
            <div className="mt-4">
              <Button variant="outline">View all</Button>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Atorvastatin", "Metformin", "Amlodipine"].map((name) => (
                <div key={name} className="rounded-lg border border-border p-4 bg-card/50">
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-muted-foreground">Dosage as prescribed</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


