import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Stethoscope, UserRound, Activity } from "lucide-react";

export default function SelectRole() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  async function setRole(role: "patient" | "doctor") {
    if (!user) return;
    try {
      setIsSaving(true);
      // Fallback to unsafeMetadata for simpler typing in this demo
      await user.update({ unsafeMetadata: { ...(user.unsafeMetadata || {}), role } as any });
      // Ensure the latest metadata is in the session
      await user.reload();
      navigate(role === "doctor" ? "/doctor" : "/patient", { replace: true });
    } catch (err) {
      toast({ title: "Could not set role", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground flex items-center justify-center px-4">
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-700 mb-3">
            <Activity className="h-10 w-10 text-primary-foreground text-green-700" />
            </div>
            <div className="text-sm text-muted-foreground">SwasthyaFlow</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Who are you?</h1>
            <p className="text-sm text-muted-foreground mt-1">Select your role to continue</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor card */}
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="space-y-1 pb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600/10 text-emerald-700">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Access practice dashboard, patient list, analytics and scheduling.</p>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                  onClick={() => setRole("doctor")}
                  disabled={isSaving}
                >
                  I'm a Doctor
                </Button>
              </CardContent>
            </Card>

            {/* Patient card */}
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="space-y-1 pb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-600/10 text-sky-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Schedule therapy appointments and manage your medical records.</p>
                <Button
                  className="w-full"
                  variant="outline"
                  size="lg"
                  onClick={() => setRole("patient")}
                  disabled={isSaving}
                >
                  I'm a Patient
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}


