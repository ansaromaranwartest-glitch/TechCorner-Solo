import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, Link } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Brain, User, MapPin, GraduationCap, Briefcase, DollarSign, CheckCircle, AlertTriangle, RefreshCw, Mail, Eye } from "lucide-react";

export default function CandidateShortlist() {
  const { jobId } = useParams<{ jobId: string }>();
  const { isAuthenticated } = useAuth();

  const { data: job } = trpc.jobs.getById.useQuery({ id: Number(jobId) }, { enabled: !!jobId });
  const { data: matches, isLoading, refetch } = trpc.matching.getMatches.useQuery(
    { jobId: Number(jobId) },
    { enabled: !!jobId && isAuthenticated }
  );

  const runMatchingMutation = trpc.matching.runMatching.useMutation({
    onSuccess: () => {
      toast.success("Matching completed! Candidates have been ranked.");
      refetch();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to run matching");
    },
  });

  const updateStatusMutation = trpc.matching.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetch();
    },
  });

  const handleRunMatching = () => {
    runMatchingMutation.mutate({ jobId: Number(jobId) });
  };

  const handleUpdateStatus = (matchId: number, status: "shortlisted" | "contacted" | "rejected") => {
    updateStatusMutation.mutate({ matchId, status });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Please sign in to view candidates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/recruiter">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Job Header */}
        {job && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Candidates for: {job.jobTitle}</h1>
            <p className="text-muted-foreground">{job.companyName} • {job.location}</p>
          </div>
        )}

        {/* AI Matching Controls */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Powered Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Run the matching algorithm to find and rank candidates based on job requirements
                  </p>
                </div>
              </div>
              <Button onClick={handleRunMatching} disabled={runMatchingMutation.isPending}>
                <RefreshCw className={`h-4 w-4 mr-2 ${runMatchingMutation.isPending ? "animate-spin" : ""}`} />
                {runMatchingMutation.isPending ? "Matching..." : "Run Matching"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Candidates ({matches?.length || 0})</TabsTrigger>
            <TabsTrigger value="shortlisted">
              Shortlisted ({matches?.filter((m) => m.recruiterStatus === "shortlisted").length || 0})
            </TabsTrigger>
            <TabsTrigger value="contacted">
              Contacted ({matches?.filter((m) => m.recruiterStatus === "contacted").length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <CandidateList
              matches={matches || []}
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
          <TabsContent value="shortlisted">
            <CandidateList
              matches={matches?.filter((m) => m.recruiterStatus === "shortlisted") || []}
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
          <TabsContent value="contacted">
            <CandidateList
              matches={matches?.filter((m) => m.recruiterStatus === "contacted") || []}
              isLoading={isLoading}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface Match {
  id: number;
  overallScore: string | null;
  educationScore: string | null;
  experienceScore: string | null;
  skillsScore: string | null;
  locationScore: string | null;
  salaryScore: string | null;
  industryScore: string | null;
  scoreExplanation: {
    education: string;
    experience: string;
    skills: string;
    location: string;
    salary: string;
    industry: string;
    overall: string;
  } | null;
  qualificationSummary: string | null;
  keyHighlights: string[] | null;
  gapAnalysis: string[] | null;
  recruiterStatus: string | null;
  candidate: {
    id: number;
    fullName: string;
    city: string | null;
    highestDegree: string | null;
    fieldOfStudy: string | null;
    fieldOfWork: string | null;
    yearsOfExperience: number | null;
    skills: string[] | null;
    willingToRelocate: boolean | null;
    minSalaryExpectation: string | null;
    salaryCurrency: string | null;
  };
}

interface CandidateListProps {
  matches: Match[];
  isLoading: boolean;
  onUpdateStatus: (matchId: number, status: "shortlisted" | "contacted" | "rejected") => void;
}

function CandidateList({ matches, isLoading, onUpdateStatus }: CandidateListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-1/3 mb-4" />
              <div className="h-4 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
          <p className="text-muted-foreground">
            Run the AI matching algorithm to find suitable candidates for this position.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <CandidateCard key={match.id} match={match} onUpdateStatus={onUpdateStatus} />
      ))}
    </div>
  );
}

interface CandidateCardProps {
  match: Match;
  onUpdateStatus: (matchId: number, status: "shortlisted" | "contacted" | "rejected") => void;
}

function CandidateCard({ match, onUpdateStatus }: CandidateCardProps) {
  const overallScore = parseFloat(match.overallScore || "0");
  const candidate = match.candidate;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Score Section */}
          <div className="w-32 flex-shrink-0 text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(0)}%
            </div>
            <p className="text-sm text-muted-foreground">Match Score</p>
            <Progress value={overallScore} className={`mt-2 h-2 ${getProgressColor(overallScore)}`} />
          </div>

          {/* Candidate Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{candidate.fullName}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                  {candidate.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {candidate.city}
                    </span>
                  )}
                  {candidate.highestDegree && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {candidate.highestDegree} in {candidate.fieldOfStudy}
                    </span>
                  )}
                  {candidate.yearsOfExperience !== null && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {candidate.yearsOfExperience} years exp.
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {match.recruiterStatus === "pending" && (
                  <>
                    <Button size="sm" onClick={() => onUpdateStatus(match.id, "shortlisted")}>
                      Shortlist
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onUpdateStatus(match.id, "rejected")}>
                      Reject
                    </Button>
                  </>
                )}
                {match.recruiterStatus === "shortlisted" && (
                  <Button size="sm" onClick={() => onUpdateStatus(match.id, "contacted")}>
                    <Mail className="h-4 w-4 mr-1" />
                    Contact
                  </Button>
                )}
                {match.recruiterStatus === "contacted" && (
                  <Badge variant="secondary">Contacted</Badge>
                )}
              </div>
            </div>

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {candidate.skills.slice(0, 6).map((skill, i) => (
                  <Badge key={i} variant="outline">{skill}</Badge>
                ))}
                {candidate.skills.length > 6 && (
                  <Badge variant="outline">+{candidate.skills.length - 6} more</Badge>
                )}
              </div>
            )}

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
              <ScoreItem label="Education" score={parseFloat(match.educationScore || "0")} />
              <ScoreItem label="Experience" score={parseFloat(match.experienceScore || "0")} />
              <ScoreItem label="Skills" score={parseFloat(match.skillsScore || "0")} />
              <ScoreItem label="Location" score={parseFloat(match.locationScore || "0")} />
              <ScoreItem label="Salary" score={parseFloat(match.salaryScore || "0")} />
              <ScoreItem label="Industry" score={parseFloat(match.industryScore || "0")} />
            </div>

            {/* Qualification Summary */}
            {match.qualificationSummary && (
              <p className="text-sm text-muted-foreground mb-4">{match.qualificationSummary}</p>
            )}

            {/* Key Highlights & Gaps */}
            <div className="grid md:grid-cols-2 gap-4">
              {match.keyHighlights && match.keyHighlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Key Highlights
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {match.keyHighlights.map((highlight, i) => (
                      <li key={i}>• {highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
              {match.gapAnalysis && match.gapAnalysis.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Areas to Consider
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {match.gapAnalysis.map((gap, i) => (
                      <li key={i}>• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Score Explanations (Expandable) */}
            {match.scoreExplanation && (
              <details className="mt-4">
                <summary className="text-sm font-medium cursor-pointer text-primary">
                  View detailed scoring explanation
                </summary>
                <div className="mt-2 p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                  <p><strong>Overall:</strong> {match.scoreExplanation.overall}</p>
                  <p><strong>Education:</strong> {match.scoreExplanation.education}</p>
                  <p><strong>Experience:</strong> {match.scoreExplanation.experience}</p>
                  <p><strong>Skills:</strong> {match.scoreExplanation.skills}</p>
                  <p><strong>Location:</strong> {match.scoreExplanation.location}</p>
                  <p><strong>Salary:</strong> {match.scoreExplanation.salary}</p>
                  <p><strong>Industry:</strong> {match.scoreExplanation.industry}</p>
                </div>
              </details>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${getColor(score)}`}>{score.toFixed(0)}%</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
