import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Briefcase, Users, Brain, Plus, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";

export default function RecruiterDashboard() {
  const { isAuthenticated, user } = useAuth();
  const { data: myJobs, isLoading } = trpc.jobs.myJobs.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access the recruiter dashboard.
              </p>
              <Button asChild>
                <a href={getLoginUrl()}>Sign In to Continue</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeJobs = myJobs?.filter((j) => j.status === "active") || [];
  const draftJobs = myJobs?.filter((j) => j.status === "draft") || [];
  const closedJobs = myJobs?.filter((j) => j.status === "closed" || j.status === "filled") || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your job postings and find matching candidates
            </p>
          </div>
          <Button asChild>
            <Link href="/post-job">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{myJobs?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{draftJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-muted">
                  <XCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{closedJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Matching Info */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Candidate Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI system analyzes candidate profiles and matches them to your job requirements.
                  Click "Find Candidates" on any active job to run the matching algorithm and see
                  ranked candidates with transparent scoring explanations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-6">
          {/* Active Jobs */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Active Jobs</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No active jobs yet</p>
                  <Button asChild>
                    <Link href="/post-job">Post Your First Job</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>

          {/* Draft Jobs */}
          {draftJobs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Drafts</h2>
              <div className="space-y-4">
                {draftJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* Closed Jobs */}
          {closedJobs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Closed Jobs</h2>
              <div className="space-y-4">
                {closedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface JobCardProps {
  job: {
    id: number;
    jobTitle: string;
    companyName: string;
    location: string | null;
    status: string | null;
    createdAt: Date;
    matchCount?: number;
  };
}

function JobCard({ job }: JobCardProps) {
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    draft: "bg-amber-100 text-amber-700",
    closed: "bg-gray-100 text-gray-700",
    filled: "bg-blue-100 text-blue-700",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[job.status || "draft"]}`}>
                {job.status?.charAt(0).toUpperCase() + (job.status?.slice(1) || "")}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {job.companyName} • {job.location || "Remote"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {job.status === "active" && (
              <Button variant="outline" asChild>
                <Link href={`/recruiter/job/${job.id}/candidates`}>
                  <Users className="h-4 w-4 mr-2" />
                  Find Candidates
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/jobs/${job.id}`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
