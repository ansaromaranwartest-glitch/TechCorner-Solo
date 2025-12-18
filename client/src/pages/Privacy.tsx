import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Eye, Lock, Trash2, Mail } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Privacy Policy & GDPR Compliance</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-6">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Our Commitment to Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  TechCorner CV Bank is committed to protecting your privacy and ensuring the security of your personal data.
                  This policy explains how we collect, use, store, and protect your information in compliance with the
                  General Data Protection Regulation (GDPR) and other applicable data protection laws.
                </p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>We collect the following categories of personal data when you submit your CV:</p>
                <ul>
                  <li><strong>Identity Data:</strong> Full name, nationality (for work eligibility verification only)</li>
                  <li><strong>Contact Data:</strong> City of residence, LinkedIn URL (optional)</li>
                  <li><strong>Education Data:</strong> Highest degree, field of study, graduation year</li>
                  <li><strong>Professional Data:</strong> Work history, skills, certifications, years of experience, industry</li>
                  <li><strong>Preference Data:</strong> Salary expectations, relocation willingness</li>
                  <li><strong>Language Data:</strong> Languages spoken and proficiency levels</li>
                  <li><strong>Document Data:</strong> Uploaded CV files (PDF/DOCX)</li>
                </ul>
                <p>
                  <strong>Data Minimization:</strong> We only collect data that is necessary for matching you with job opportunities.
                  We do not collect sensitive personal data such as religious beliefs, political opinions, or health information.
                </p>
              </CardContent>
            </Card>

            {/* How We Use Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  How We Use Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>Your data is used for the following purposes:</p>
                <ol>
                  <li><strong>Profile Creation:</strong> To create and maintain your candidate profile in our CV bank</li>
                  <li><strong>AI-Powered Matching:</strong> To match your profile with relevant job opportunities using our AI algorithms</li>
                  <li><strong>Recruiter Access:</strong> To share your profile with recruiters when you match their job requirements</li>
                  <li><strong>Communication:</strong> To notify you about matching job opportunities and updates</li>
                </ol>

                <h4>AI Processing and Anonymization</h4>
                <p>
                  Our AI-powered matching system processes your data to find suitable job matches. Before running matching algorithms:
                </p>
                <ul>
                  <li>Personal identifiers (name, LinkedIn URL) are <strong>anonymized</strong> and excluded from scoring</li>
                  <li>Nationality is used only for work eligibility verification, <strong>not for ranking</strong></li>
                  <li>Matching is based solely on skills, experience, education, location preferences, and salary alignment</li>
                </ul>
                <p>
                  This ensures fair and unbiased matching that focuses on your qualifications rather than personal characteristics.
                </p>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>We implement robust security measures to protect your data:</p>
                <ul>
                  <li><strong>Encryption:</strong> All data is encrypted at rest and in transit using industry-standard protocols</li>
                  <li><strong>Access Control:</strong> Strict role-based access controls limit who can view your data</li>
                  <li><strong>Secure Storage:</strong> CV files are stored in secure cloud storage with access logging</li>
                  <li><strong>Audit Trails:</strong> We maintain logs of all data access for accountability</li>
                  <li><strong>Regular Audits:</strong> We conduct regular security audits and bias assessments</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-primary" />
                  Your Rights Under GDPR
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>You have the following rights regarding your personal data:</p>
                <ul>
                  <li><strong>Right to Access:</strong> You can view all data we hold about you through your profile page</li>
                  <li><strong>Right to Rectification:</strong> You can update your information at any time</li>
                  <li><strong>Right to Erasure:</strong> You can request deletion of all your data through your profile settings</li>
                  <li><strong>Right to Restrict Processing:</strong> You can request that we stop processing your data</li>
                  <li><strong>Right to Data Portability:</strong> You can request a copy of your data in a machine-readable format</li>
                  <li><strong>Right to Object:</strong> You can object to processing of your data for specific purposes</li>
                  <li><strong>Right to Withdraw Consent:</strong> You can withdraw your consent at any time</li>
                </ul>

                <h4>Data Retention</h4>
                <p>
                  We retain your data for as long as your account is active or as needed to provide services.
                  When you request deletion, your data will be permanently removed within 30 days.
                </p>
              </CardContent>
            </Card>

            {/* Transparency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Transparency in AI Decision-Making
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  We believe in transparent AI. Our matching system provides:
                </p>
                <ul>
                  <li><strong>Score Explanations:</strong> Detailed breakdown of how match scores are calculated</li>
                  <li><strong>Criteria Weights:</strong> Clear information about what factors influence matching</li>
                  <li><strong>Human Oversight:</strong> All AI recommendations are reviewed by human recruiters before final decisions</li>
                  <li><strong>Bias Auditing:</strong> Regular audits to detect and address any algorithmic bias</li>
                </ul>
                <p>
                  The AI system assists in finding matches but <strong>does not make final hiring decisions</strong>.
                  Human recruiters always have the final say in candidate selection.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  If you have any questions about this privacy policy or wish to exercise your rights,
                  please contact our Data Protection Officer:
                </p>
                <ul>
                  <li>Email: privacy@techcorner.tech</li>
                  <li>Website: www.techcorner.tech</li>
                </ul>
                <p>
                  You also have the right to lodge a complaint with your local data protection authority
                  if you believe your rights have been violated.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
