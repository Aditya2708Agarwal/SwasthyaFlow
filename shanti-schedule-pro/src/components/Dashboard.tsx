import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  Activity, 
  Clock, 
  TrendingUp, 
  Bell,
  MoreHorizontal,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import RecoveryChart from './RecoveryChart';

const Dashboard = () => {
  const upcomingSessions = [
    { patient: "Priya Sharma", therapy: "Abhyanga", time: "10:00 AM", status: "confirmed" },
    { patient: "Raj Patel", therapy: "Shirodhara", time: "11:30 AM", status: "pending" },
    { patient: "Maya Singh", therapy: "Swedana", time: "2:00 PM", status: "confirmed" },
    { patient: "Arjun Kumar", therapy: "Nasya", time: "3:30 PM", status: "confirmed" }
  ];

  const recentNotifications = [
    { message: "Pre-procedure notification sent to Priya Sharma", time: "5 min ago", type: "info" },
    { message: "Session completed for Raj Patel", time: "1 hour ago", type: "success" },
    { message: "Feedback received from Maya Singh", time: "2 hours ago", type: "info" }
  ];

  return (
    <section id="dashboard" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Practitioner Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get a comprehensive view of your practice with real-time insights, 
            patient management, and therapy tracking all in one place.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Active Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">247</div>
                  <p className="text-xs text-success">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Today's Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">18</div>
                  <p className="text-xs text-primary">4 completed</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">94.2%</div>
                  <p className="text-xs text-success">+2.1% improvement</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">₹84.5K</div>
                  <p className="text-xs text-success">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Today's Schedule</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Manage your therapy sessions and patient appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{session.patient}</p>
                          <p className="text-sm text-muted-foreground">{session.therapy}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-foreground">{session.time}</p>
                          <div className="flex items-center">
                            {session.status === 'confirmed' ? (
                              <CheckCircle className="h-4 w-4 text-success mr-1" />
                            ) : (
                              <Clock className="h-4 w-4 text-warning mr-1" />
                            )}
                            <span className={`text-xs capitalize ${
                              session.status === 'confirmed' ? 'text-success' : 'text-warning'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Width Analytics & Insights */}
          <div className="col-span-full mt-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground text-2xl">Analytics & Insights</CardTitle>
                <CardDescription className="text-lg">
                  Real-time therapy tracking and patient progress visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Weekly Progress Chart */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Weekly Progress Overview</h4>
                    <div className="h-[400px]">
                      <RecoveryChart />
                    </div>
                  </div>
                  {/* Treatment Success Rate */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Treatment Success Metrics</h4>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-base mb-2">
                          <span>Abhyanga Success Rate</span>
                          <span className="text-success font-semibold">92%</span>
                        </div>
                        <Progress value={92} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-base mb-2">
                          <span>Shirodhara Success Rate</span>
                          <span className="text-success font-semibold">88%</span>
                        </div>
                        <Progress value={88} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-base mb-2">
                          <span>Swedana Success Rate</span>
                          <span className="text-success font-semibold">95%</span>
                        </div>
                        <Progress value={95} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-base mb-2">
                          <span>Overall Recovery Rate</span>
                          <span className="text-success font-semibold">91.6%</span>
                        </div>
                        <Progress value={91.6} className="h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions and Activity Row */}
          <div className="col-span-full grid grid-cols-3 gap-6 mb-6">
            {/* Quick Actions */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button className="bg-gradient-primary justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
                <Button variant="outline" className="justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
                <Button variant="outline" className="justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentNotifications.map((notification, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-success' : 'bg-primary'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Patient Progress */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground">Patient Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Priya Sharma</span>
                    <span className="text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Raj Patel</span>
                    <span className="text-muted-foreground">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">Maya Singh</span>
                    <span className="text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;