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
import { Upload, Plus, X, Shield, FileText, AlertCircle } from "lucide-react";

const DEGREES = ["High School", "Associate", "Bachelor", "Master", "PhD", "Other"];
const INDUSTRIES = [
  "Technology and IT", "Healthcare and Medicine", "Finance and Accounting", "Engineering",
  "Marketing and Sales", "Education and Training", "Creative and Design", "Business and Administration",
  "Legal and Compliance", "Manufacturing and Production", "Retail and E-commerce", "Hospitality and Tourism",
];
const LANGUAGES_LIST = ["English", "Arabic", "Kurdish", "Turkish", "Persian", "French", "German", "Spanish", "Chinese", "Other"];
const PROFICIENCY_LEVELS = ["native", "fluent", "intermediate", "basic"] as const;

interface WorkHistoryItem {
  title: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface LanguageItem {
  language: string;
  proficiency: typeof PROFICIENCY_LEVELS[number];
}

export default function SubmitCV() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("");
  const [city, setCity] = useState("");
  const [highestDegree, setHighestDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [fieldOfWork, setFieldOfWork] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [relocationPreference, setRelocationPreference] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [minSalaryExpectation, setMinSalaryExpectation] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  // Consent
  const [consentDataCollection, setConsentDataCollection] = useState(false);
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  
  const submitMutation = trpc.cv.submit.useMutation({
    onSuccess: () => {
      toast.success("Your CV has been submitted successfully!");
      navigate("/my-profile");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit CV");
    },
  });

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert));
  };

  const addWorkHistory = () => {
    setWorkHistory([...workHistory, {
      title: "",
      employer: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    }]);
  };

  const updateWorkHistory = (index: number, field: keyof WorkHistoryItem, value: string | boolean) => {
    const updated = [...workHistory];
    updated[index] = { ...updated[index], [field]: value };
    setWorkHistory(updated);
  };

  const removeWorkHistory = (index: number) => {
    setWorkHistory(workHistory.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    setLanguages([...languages, { language: "", proficiency: "intermediate" }]);
  };

  const updateLanguage = (index: number, field: keyof LanguageItem, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value } as LanguageItem;
    setLanguages(updated);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentDataCollection || !consentDataProcessing) {
      toast.error("Please accept the required consent agreements");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    // Upload CV file if present
    let cvFileUrl = "";
    let cvFileKey = "";
    if (cvFile) {
      const formData = new FormData();
      formData.append("file", cvFile);
      try {
        const uploadResult = await fetch("/api/upload-cv", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResult.json();
        cvFileUrl = uploadData.url;
        cvFileKey = uploadData.key;
      } catch {
        toast.error("Failed to upload CV file");
        return;
      }
    }

    submitMutation.mutate({
      fullName,
      nationality,
      city,
      highestDegree,
      fieldOfStudy,
      graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      fieldOfWork,
      willingToRelocate,
      relocationPreference,
      linkedinUrl,
      minSalaryExpectation: minSalaryExpectation ? parseFloat(minSalaryExpectation) : undefined,
      salaryCurrency,
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined,
      skills,
      workHistory,
      certifications,
      languages,
      additionalInfo,
      cvFileUrl,
      cvFileKey,
      cvFileName: cvFile?.name,
      cvFileMimeType: cvFile?.type,
      consentDataCollection,
      consentDataProcessing,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to submit your CV and access our job matching services.
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
            <h1 className="text-3xl font-bold mb-2">Submit Your CV</h1>
            <p className="text-muted-foreground">
              Fill out the form below to join our CV bank and get matched with relevant job opportunities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic information for identification purposes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g., Iraqi"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City of Residence</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Erbil"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL (optional)</Label>
                    <Input
                      id="linkedinUrl"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>Your academic background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="highestDegree">Highest Degree</Label>
                    <Select value={highestDegree} onValueChange={setHighestDegree}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREES.map((degree) => (
                          <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fieldOfStudy">Field of Study</Label>
                    <Input
                      id="fieldOfStudy"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g., 2020"
                    min="1950"
                    max={new Date().getFullYear() + 5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Your professional background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fieldOfWork">Field of Work / Industry</Label>
                    <Select value={fieldOfWork} onValueChange={setFieldOfWork}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="e.g., 5"
                      min="0"
                    />
                  </div>
                </div>

                {/* Work History */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Work History</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addWorkHistory}>
                      <Plus className="h-4 w-4 mr-1" /> Add Position
                    </Button>
                  </div>
                  {workHistory.map((work, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-4 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeWorkHistory(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Job Title"
                          value={work.title}
                          onChange={(e) => updateWorkHistory(index, "title", e.target.value)}
                        />
                        <Input
                          placeholder="Employer"
                          value={work.employer}
                          onChange={(e) => updateWorkHistory(index, "employer", e.target.value)}
                        />
                        <Input
                          placeholder="Location"
                          value={work.location}
                          onChange={(e) => updateWorkHistory(index, "location", e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="month"
                            placeholder="Start Date"
                            value={work.startDate}
                            onChange={(e) => updateWorkHistory(index, "startDate", e.target.value)}
                          />
                          <Input
                            type="month"
                            placeholder="End Date"
                            value={work.endDate}
                            onChange={(e) => updateWorkHistory(index, "endDate", e.target.value)}
                            disabled={work.isCurrent}
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={work.isCurrent}
                            onCheckedChange={(checked) => updateWorkHistory(index, "isCurrent", checked === true)}
                          />
                          Currently working here
                        </label>
                      </div>
                      <Textarea
                        className="mt-2"
                        placeholder="Description of responsibilities..."
                        value={work.description}
                        onChange={(e) => updateWorkHistory(index, "description", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Qualifications</CardTitle>
                <CardDescription>Your technical and soft skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Certifications</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add a certification"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                    />
                    <Button type="button" variant="outline" onClick={addCertification}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {certifications.map((cert) => (
                      <span
                        key={cert}
                        className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {cert}
                        <button type="button" onClick={() => removeCertification(cert)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Languages you speak and your proficiency level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <Label>Languages</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                    <Plus className="h-4 w-4 mr-1" /> Add Language
                  </Button>
                </div>
                {languages.map((lang, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Select value={lang.language} onValueChange={(v) => updateLanguage(index, "language", v)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES_LIST.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={lang.proficiency} onValueChange={(v) => updateLanguage(index, "proficiency", v)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_LEVELS.map((p) => (
                          <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLanguage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Your job preferences and expectations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minSalaryExpectation">Minimum Salary Expectation</Label>
                    <div className="flex gap-2">
                      <Input
                        id="minSalaryExpectation"
                        type="number"
                        value={minSalaryExpectation}
                        onChange={(e) => setMinSalaryExpectation(e.target.value)}
                        placeholder="e.g., 50000"
                      />
                      <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                        <SelectTrigger className="w-24">
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
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={willingToRelocate}
                      onCheckedChange={(checked) => setWillingToRelocate(checked === true)}
                    />
                    <span>I am willing to relocate</span>
                  </label>
                  {willingToRelocate && (
                    <Input
                      className="mt-2"
                      value={relocationPreference}
                      onChange={(e) => setRelocationPreference(e.target.value)}
                      placeholder="Relocation preferences (e.g., 'Open to relocating nationwide')"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CV Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload CV</CardTitle>
                <CardDescription>Upload your CV in PDF or DOCX format (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <span className="text-primary font-medium">Click to upload</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">PDF or DOCX (max 10MB)</p>
                  {cvFile && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      {cvFile.name}
                      <button type="button" onClick={() => setCvFile(null)}>
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Anything else you'd like to share</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Awards, volunteer work, or any other relevant information..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Consent */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Consent
                </CardTitle>
                <CardDescription>
                  We take your privacy seriously. Please review and accept the following.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                  <p><strong>Data Collection:</strong> We collect the information you provide to create your candidate profile and match you with relevant job opportunities.</p>
                  <p><strong>Data Processing:</strong> Your data will be processed by our AI-powered matching system. Personal identifiers (name, LinkedIn) are anonymized before matching to ensure fair evaluation.</p>
                  <p><strong>Data Retention:</strong> Your data will be retained until you request deletion. You can request deletion at any time through your profile settings.</p>
                  <p><strong>Third-Party Sharing:</strong> Your profile may be shared with recruiters who have posted matching job opportunities. They will only see your full details after you are shortlisted.</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={consentDataCollection}
                      onCheckedChange={(checked) => setConsentDataCollection(checked === true)}
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      I consent to the collection and storage of my personal data as described above. *
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={consentDataProcessing}
                      onCheckedChange={(checked) => setConsentDataProcessing(checked === true)}
                      className="mt-0.5"
                    />
                    <span className="text-sm">
                      I consent to the processing of my data by AI systems for job matching purposes. I understand that my data will be anonymized before matching. *
                    </span>
                  </label>
                </div>

                {(!consentDataCollection || !consentDataProcessing) && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Both consent agreements are required to submit your CV.
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitMutation.isPending || !consentDataCollection || !consentDataProcessing}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit CV"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
