import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Shield, Brain, Users, FileText, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Brain className="h-4 w-4" />
              AI-powered matchmaking
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Dream Job
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Discover thousands of opportunities from top companies worldwide. 
              Our AI-powered platform matches your skills and experience with the perfect role.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/jobs">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Jobs
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent" asChild>
                <Link href="/submit-cv">
                  <FileText className="h-5 w-5 mr-2" />
                  Submit Your CV
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose TechCorner CV Bank?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform ensures fair, transparent, and efficient recruitment 
              while protecting your privacy and data.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI-Powered Matching"
              description="Our advanced algorithms analyze your skills, experience, and preferences to find the perfect job matches with transparent scoring."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="GDPR Compliant"
              description="Your data is protected with industry-leading security. We collect only what's necessary and give you full control over your information."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Human Oversight"
              description="AI assists but humans decide. Every match is reviewed by real recruiters who understand your unique value."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get matched with your dream job in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Submit Your CV"
              description="Fill out our comprehensive form with your skills, experience, and preferences. Upload your CV for detailed analysis."
            />
            <StepCard
              number="2"
              title="AI Analysis"
              description="Our AI extracts key information and creates a detailed profile. Your data is anonymized before matching to ensure fairness."
            />
            <StepCard
              number="3"
              title="Get Matched"
              description="When employers post jobs, our system finds the best matches. Recruiters review and contact qualified candidates."
            />
          </div>
        </div>
      </section>

      {/* For Employers Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">For Employers</h2>
              <p className="text-muted-foreground mb-6">
                Access a curated pool of qualified candidates matched to your specific requirements. 
                Our transparent AI scoring helps you make informed hiring decisions.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Post job descriptions and get instant matches",
                  "View detailed candidate profiles with match scores",
                  "Understand exactly why each candidate was recommended",
                  "Maintain full control over final hiring decisions",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" asChild>
                <Link href="/post-job">Post a Job</Link>
              </Button>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Match Score</span>
                    <span className="text-primary font-bold">92%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground">Skills</div>
                    <div className="font-medium">95%</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground">Experience</div>
                    <div className="font-medium">88%</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground">Education</div>
                    <div className="font-medium">90%</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">100%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/logo.png" alt="TechCorner" className="h-10 w-auto mb-4 brightness-0 invert" />
              <p className="text-background/70 text-sm">
                AI-powered recruitment platform connecting talent with opportunity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="/jobs" className="hover:text-background">Browse Jobs</Link></li>
                <li><Link href="/submit-cv" className="hover:text-background">Submit CV</Link></li>
                <li><Link href="/my-profile" className="hover:text-background">My Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="/post-job" className="hover:text-background">Post a Job</Link></li>
                <li><Link href="/recruiter" className="hover:text-background">Recruiter Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="/privacy" className="hover:text-background">Privacy Policy</Link></li>
                <li><Link href="/privacy" className="hover:text-background">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-background">GDPR Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/50">
            © {new Date().getFullYear()} TechCorner. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
