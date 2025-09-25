import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, SignIn, SignUp, RedirectToSignIn } from "@clerk/clerk-react";
import Index from "./pages/Index";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import SelectRole from "./pages/SelectRole";
import RoleRoute from "./components/RoleRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/sign-in"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
                <SignIn routing="path" path="/sign-in" afterSignInUrl="/select-role" />
              </div>
            }
          />
          <Route
            path="/sign-up"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
                <SignUp routing="path" path="/sign-up" />
              </div>
            }
          />
          <Route path="/select-role" element={<SelectRole />} />
          {/* Example protected route wrapper */}
          <Route element={<RoleRoute allow={["patient", "doctor"]} />}>
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
