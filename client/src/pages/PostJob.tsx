import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Plus, X, Briefcase } from "lucide-react";

const INDUSTRIES = [
  "Technology and IT", "Healthcare and Medicine", "Finance and Accounting", "Engineering",
  "Marketing and Sales", "Education and Training", "Creative and Design", "Business and Administration",
  "Legal and Compliance", "Manufacturing and Production", "Retail and E-commerce", "Hospitality and Tourism",
];

const DEGREES = ["High School", "Associate", "Bachelor", "Master", "PhD", "Any"];
const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
  { value: "hybrid", label: "Hybrid" },
];

export default function PostJob() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [requiredEducation, setRequiredEducation] = useState("");
  const [requiredFieldOfStudy, setRequiredFieldOfStudy] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newRequiredSkill, setNewRequiredSkill] = useState("");
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [newPreferredSkill, setNewPreferredSkill] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [relocationSupport, setRelocationSupport] = useState(false);
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [benefits, setBenefits] = useState("");
  const [deadline, setDeadline] = useState("");

  const postJobMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success("Job posted successfully!");
      navigate("/recruiter");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to post job");
    },
  });

  const addRequiredSkill = () => {
    if (newRequiredSkill.trim() && !requiredSkills.includes(newRequiredSkill.trim())) {
      setRequiredSkills([...requiredSkills, newRequiredSkill.trim()]);
      setNewRequiredSkill("");
    }
  };

  const addPreferredSkill = () => {
    if (newPreferredSkill.trim() && !preferredSkills.includes(newPreferredSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPreferredSkill.trim()]);
      setNewPreferredSkill("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !jobTitle.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    postJobMutation.mutate({
      companyName,
      jobTitle,
      location,
      isRemote,
      requiredEducation,
      requiredFieldOfStudy,
      requiredSkills,
      preferredSkills,
      minExperience: minExperience ? parseInt(minExperience) : undefined,
      maxExperience: maxExperience ? parseInt(maxExperience) : undefined,
      salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
      salaryCurrency,
      employmentType: employmentType as "full_time" | "part_time" | "contract" | "intern" | "hybrid",
      relocationSupport,
      industry,
      description,
      responsibilities,
      benefits,
      deadline: deadline ? new Date(deadline) : undefined,
    });
  };

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
                Please sign in to post job opportunities.
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
            <p className="text-muted-foreground">
              Fill out the form below to post a job and find matching candidates through our AI-powered system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Erbil, Iraq"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={isRemote}
                      onCheckedChange={(checked) => setIsRemote(checked === true)}
                    />
                    Remote position
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={relocationSupport}
                      onCheckedChange={(checked) => setRelocationSupport(checked === true)}
                    />
                    Relocation support offered
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requiredEducation">Required Education</Label>
                    <Select value={requiredEducation} onValueChange={setRequiredEducation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREES.map((degree) => (
                          <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requiredFieldOfStudy">Required Field of Study</Label>
                    <Input
                      id="requiredFieldOfStudy"
                      value={requiredFieldOfStudy}
                      onChange={(e) => setRequiredFieldOfStudy(e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minExperience">Minimum Experience (years)</Label>
                    <Input
                      id="minExperience"
                      type="number"
                      value={minExperience}
                      onChange={(e) => setMinExperience(e.target.value)}
                      placeholder="e.g., 3"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxExperience">Maximum Experience (years)</Label>
                    <Input
                      id="maxExperience"
                      type="number"
                      value={maxExperience}
                      onChange={(e) => setMaxExperience(e.target.value)}
                      placeholder="e.g., 7"
                      min="0"
                    />
                  </div>
                </div>

                {/* Required Skills */}
                <div>
                  <Label>Required Skills</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newRequiredSkill}
                      onChange={(e) => setNewRequiredSkill(e.target.value)}
                      placeholder="Add a required skill"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequiredSkill())}
                    />
                    <Button type="button" variant="outline" onClick={addRequiredSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button type="button" onClick={() => setRequiredSkills(requiredSkills.filter((s) => s !== skill))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                <div>
                  <Label>Preferred Skills</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newPreferredSkill}
                      onChange={(e) => setNewPreferredSkill(e.target.value)}
                      placeholder="Add a preferred skill"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreferredSkill())}
                    />
                    <Button type="button" variant="outline" onClick={addPreferredSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {preferredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button type="button" onClick={() => setPreferredSkills(preferredSkills.filter((s) => s !== skill))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Minimum Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="e.g., 50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax">Maximum Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="e.g., 80000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryCurrency">Currency</Label>
                    <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="IQD">IQD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the role and what the candidate will be doing..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                  <Textarea
                    id="responsibilities"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    placeholder="List key responsibilities..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="benefits">Benefits (one per line)</Label>
                  <Textarea
                    id="benefits"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    placeholder="List benefits and perks..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={postJobMutation.isPending}
            >
              {postJobMutation.isPending ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
