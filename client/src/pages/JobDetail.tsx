import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { MapPin, Clock, Building2, Calendar, DollarSign, GraduationCap, Briefcase, ArrowLeft, CheckCircle } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = trpc.jobs.getById.useQuery({ id: Number(id) });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <Button asChild>
            <Link href="/jobs">Back to Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return "Not specified";
    const currency = job.salaryCurrency || "USD";
    if (job.salaryMin && job.salaryMax) {
      return `${currency} ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`;
    }
    if (job.salaryMin) return `${currency} ${Number(job.salaryMin).toLocaleString()}+`;
    return `Up to ${currency} ${Number(job.salaryMax).toLocaleString()}`;
  };

  const formatJobType = (type: string | null) => {
    if (!type) return "Not specified";
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.companyName} className="w-14 h-14 object-contain" />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{job.jobTitle}</h1>
                    <p className="text-lg text-muted-foreground">{job.companyName}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      {job.isRemote && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                          Remote
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatJobType(job.employmentType)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {job.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {job.description.split("\n").map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.split("\n").filter(Boolean).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, i) => (
                      <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {job.preferredSkills && job.preferredSkills.length > 0 && (
                    <>
                      <h4 className="font-medium mt-4 mb-2">Preferred Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.preferredSkills.map((skill, i) => (
                          <span key={i} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.split("\n").filter(Boolean).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <Button className="w-full mb-4" size="lg" asChild>
                  <Link href="/submit-cv">Apply Now</Link>
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Submit your CV to be considered for this position
                </p>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salary</p>
                    <p className="font-medium">{formatSalary()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Education</p>
                    <p className="font-medium">{job.requiredEducation || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">
                      {job.minExperience !== null
                        ? `${job.minExperience}${job.maxExperience ? `-${job.maxExperience}` : "+"} years`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{job.industry || "Not specified"}</p>
                  </div>
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Application Deadline</p>
                      <p className="font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {job.relocationSupport && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                    This employer offers relocation support
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
