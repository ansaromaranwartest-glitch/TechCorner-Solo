import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, MapPin, Clock, Building2, Calendar, ArrowRight, Filter, Briefcase } from "lucide-react";
import { useState } from "react";

const INDUSTRIES = [
  "Technology and IT",
  "Healthcare and Medicine",
  "Finance and Accounting",
  "Engineering",
  "Marketing and Sales",
  "Education and Training",
  "Creative and Design",
  "Business and Administration",
  "Legal and Compliance",
  "Manufacturing and Production",
];

const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
  { value: "hybrid", label: "Hybrid" },
];

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string>("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: jobs, isLoading } = trpc.jobs.list.useQuery({
    search: searchQuery,
    location,
    industries: selectedIndustries.length > 0 ? selectedIndustries : undefined,
    jobType: selectedJobType || undefined,
    remoteOnly,
  });

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Dream Job</h1>
            <p className="text-white/80">
              Discover opportunities from top companies worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 flex-1">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {jobs?.length ?? 0} jobs found
            </p>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <aside className={`md:block ${showFilters ? "block" : "hidden"}`}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-semibold">Filters</h3>
                  </div>

                  {/* Industries */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
                      Industries
                    </h4>
                    <div className="space-y-2">
                      {INDUSTRIES.map((industry) => (
                        <label
                          key={industry}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedIndustries.includes(industry)}
                            onCheckedChange={() => toggleIndustry(industry)}
                          />
                          {industry}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Job Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
                      Job Type
                    </h4>
                    <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Job Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Job Types</SelectItem>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remote Only */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={remoteOnly}
                        onCheckedChange={(checked) => setRemoteOnly(checked === true)}
                      />
                      Remote Only
                    </label>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedIndustries([]);
                      setSelectedJobType("");
                      setRemoteOnly(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Job Listings */}
            <div className="md:col-span-3 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                        <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs?.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/post-job">Post a Job</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                jobs?.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface JobCardProps {
  job: {
    id: number;
    jobTitle: string;
    companyName: string;
    companyLogo: string | null;
    location: string | null;
    isRemote: boolean | null;
    employmentType: string | null;
    salaryMin: string | null;
    salaryMax: string | null;
    salaryCurrency: string | null;
    industry: string | null;
    description: string | null;
    deadline: Date | null;
    createdAt: Date;
  };
}

function JobCard({ job }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.salaryCurrency || "USD";
    if (job.salaryMin && job.salaryMax) {
      return `${currency} ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`;
    }
    if (job.salaryMin) return `${currency} ${Number(job.salaryMin).toLocaleString()}+`;
    return `Up to ${currency} ${Number(job.salaryMax).toLocaleString()}`;
  };

  const formatJobType = (type: string | null) => {
    if (!type) return null;
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.companyName} className="w-10 h-10 object-contain" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{job.jobTitle}</h3>
                <p className="text-muted-foreground text-sm">{job.companyName}</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/jobs/${job.id}`}>
                  View
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Meta Info */}
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
              {job.employmentType && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatJobType(job.employmentType)}
                </span>
              )}
              {job.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Description Preview */}
            {job.description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {job.industry && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  {job.industry}
                </span>
              )}
              {formatSalary() && (
                <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                  {formatSalary()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
