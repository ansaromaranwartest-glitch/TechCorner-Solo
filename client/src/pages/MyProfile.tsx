import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { toast } from "sonner";
import { User, MapPin, GraduationCap, Briefcase, Globe, DollarSign, FileText, Trash2, Edit, Shield, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export default function MyProfile() {
  const { isAuthenticated, user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: profile, isLoading } = trpc.cv.myProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.cv.requestDeletion.useMutation({
    onSuccess: () => {
      toast.success("Deletion request submitted. Your data will be removed within 30 days.");
      setDeleteDialogOpen(false);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to submit deletion request");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to view your profile.
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No CV Found</h2>
              <p className="text-muted-foreground mb-6">
                You haven't submitted your CV yet. Submit your CV to get matched with job opportunities.
              </p>
              <Button asChild>
                <Link href="/submit-cv">Submit Your CV</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your CV and privacy settings
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/submit-cv">
                  <Edit className="h-4 w-4 mr-2" />
                  Update CV
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Profile */}
            <div className="md:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{profile.fullName}</h2>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        {profile.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.city}
                          </span>
                        )}
                        {profile.nationality && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {profile.nationality}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{profile.highestDegree || "Not specified"}</p>
                  {profile.fieldOfStudy && (
                    <p className="text-muted-foreground">{profile.fieldOfStudy}</p>
                  )}
                  {profile.graduationYear && (
                    <p className="text-sm text-muted-foreground">Graduated {profile.graduationYear}</p>
                  )}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <p className="font-medium">{profile.fieldOfWork || "Not specified"}</p>
                      <p className="text-muted-foreground">
                        {profile.yearsOfExperience !== null ? `${profile.yearsOfExperience} years of experience` : "Experience not specified"}
                      </p>
                    </div>
                  </div>

                  {profile.workHistory && profile.workHistory.length > 0 && (
                    <div className="space-y-4 mt-4 pt-4 border-t">
                      <h4 className="font-medium">Work History</h4>
                      {profile.workHistory.map((work: { title: string; employer: string; location: string; startDate: string; endDate: string | null; isCurrent: boolean }, i: number) => (
                        <div key={i} className="border-l-2 border-primary/30 pl-4">
                          <p className="font-medium">{work.title}</p>
                          <p className="text-sm text-muted-foreground">{work.employer}</p>
                          <p className="text-xs text-muted-foreground">
                            {work.startDate} - {work.isCurrent ? "Present" : work.endDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.certifications && profile.certifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((cert: string, i: number) => (
                          <Badge key={i} variant="outline">{cert}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {profile.languages.map((lang: { language: string; proficiency: string }, i: number) => (
                        <div key={i}>
                          <span className="font-medium">{lang.language}</span>
                          <span className="text-muted-foreground ml-2">({lang.proficiency})</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Min. Salary</p>
                      <p className="font-medium">
                        {profile.minSalaryExpectation
                          ? `${profile.salaryCurrency} ${Number(profile.minSalaryExpectation).toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Relocation</p>
                    <p className="font-medium">
                      {profile.willingToRelocate ? "Open to relocation" : "Not open to relocation"}
                    </p>
                    {profile.relocationPreference && (
                      <p className="text-sm text-muted-foreground">{profile.relocationPreference}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* CV File */}
              {profile.cvFileUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      CV Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{profile.cvFileName}</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.cvFileUrl} target="_blank" rel="noopener noreferrer">
                        View CV
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Privacy & Data */}
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your data is protected and only shared with recruiters when you match their job requirements.
                  </p>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Request Data Deletion
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Request Data Deletion
                        </DialogTitle>
                        <DialogDescription>
                          This will submit a request to delete all your personal data from our system.
                          This action cannot be undone and will be processed within 30 days as per GDPR requirements.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => deleteMutation.mutate()}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? "Submitting..." : "Confirm Deletion Request"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
