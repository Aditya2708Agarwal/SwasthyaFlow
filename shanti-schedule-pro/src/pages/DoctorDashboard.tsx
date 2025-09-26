import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi, type ScheduleItem } from "@/lib/api";
import { Clock, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const therapyTypes = [
  'Abhyanga',
  'Shirodhara',
  'Nasya',
  'Basti',
  'Swedana',
  'Panchakarma'
];

export default function DoctorDashboard() {
  const { request } = useApi();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    patientId: '',
    therapyType: '',
    startTime: '',
    duration: 60,
    notes: ''
  });

  const schedules = useQuery<{ items: ScheduleItem[] }>({
    queryKey: ["doctor-schedules", format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => request(`/api/schedules/for-doctor?date=${format(selectedDate, 'yyyy-MM-dd')}`),
  });

  const patients = useQuery<{ items: Array<{ _id: string; name: string; email: string }> }>({
    queryKey: ["patients"],
    queryFn: () => request("/api/users/patients"),
  });

  const createSession = useMutation({
    mutationFn: (data: typeof newSession) => request("/api/schedules", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        startTime: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${data.startTime}`).toISOString()
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setIsBookingOpen(false);
      setNewSession({
        patientId: '',
        therapyType: '',
        startTime: '',
        duration: 60,
        notes: ''
      });
    }
  });

  const complete = useMutation({
    mutationFn: (id: string) => request(`/api/schedules/${id}/complete`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const cancel = useMutation({
    mutationFn: (id: string) => request(`/api/schedules/${id}/cancel`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 grid gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
            <DialogTrigger asChild>
              <Button>Schedule New Session</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule Therapy Session</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Patient</Label>
                    <Select
                      onValueChange={(value) => setNewSession({ ...newSession, patientId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.data?.items?.map((patient: any) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Therapy Type</Label>
                    <Select
                      onValueChange={(value) => setNewSession({ ...newSession, therapyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select therapy" />
                      </SelectTrigger>
                      <SelectContent>
                        {therapyTypes.map((therapy) => (
                          <SelectItem key={therapy} value={therapy}>
                            {therapy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={newSession.notes}
                    onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                    placeholder="Add session notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => createSession.mutate(newSession)} disabled={createSession.isPending}>
                  Book Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {schedules.isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : schedules.data?.items?.length ? (
                <div className="grid grid-cols-1 gap-4">
                  {schedules.data.items.map((item) => (
                    <div key={item._id} className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4">
                      <div>
                        <div className="font-medium">Patient {item.patientId}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(item.startTime), 'h:mm a')} - {format(new Date(item.endTime), 'h:mm a')}
                        </div>
                        <div className="text-sm text-muted-foreground">{item.therapyType}</div>
                        {item.notes && <div className="text-sm text-muted-foreground mt-1">{item.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status}
                        </span>
                        {item.status === 'scheduled' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => cancel.mutate(item._id)} 
                              disabled={cancel.isPending}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              size="sm"
                              variant="default" 
                              onClick={() => complete.mutate(item._id)} 
                              disabled={complete.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" /> Complete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No appointments for the selected date.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date || new Date())}
                className="rounded-md border"
              />
              <div className="mt-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


