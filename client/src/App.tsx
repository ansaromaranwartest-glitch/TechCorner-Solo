import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import SubmitCV from "./pages/SubmitCV";
import PostJob from "./pages/PostJob";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateShortlist from "./pages/CandidateShortlist";
import MyProfile from "./pages/MyProfile";
import Privacy from "./pages/Privacy";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/submit-cv" component={SubmitCV} />
      <Route path="/post-job" component={PostJob} />
      <Route path="/recruiter" component={RecruiterDashboard} />
      <Route path="/recruiter/job/:jobId/candidates" component={CandidateShortlist} />
      <Route path="/my-profile" component={MyProfile} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
