import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

// Core user table backing auth flow
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "recruiter", "jobseeker"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// CV/Candidate profiles
export const cvProfiles = mysqlTable("cv_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  nationality: varchar("nationality", { length: 100 }),
  city: varchar("city", { length: 100 }),
  highestDegree: varchar("highestDegree", { length: 100 }),
  fieldOfStudy: varchar("fieldOfStudy", { length: 200 }),
  graduationYear: int("graduationYear"),
  fieldOfWork: varchar("fieldOfWork", { length: 200 }),
  willingToRelocate: boolean("willingToRelocate").default(false),
  relocationPreference: text("relocationPreference"),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  minSalaryExpectation: decimal("minSalaryExpectation", { precision: 12, scale: 2 }),
  salaryCurrency: varchar("salaryCurrency", { length: 10 }).default("USD"),
  yearsOfExperience: int("yearsOfExperience"),
  skills: json("skills").$type<string[]>(),
  workHistory: json("workHistory").$type<WorkHistoryItem[]>(),
  certifications: json("certifications").$type<string[]>(),
  languages: json("languages").$type<LanguageItem[]>(),
  additionalInfo: text("additionalInfo"),
  cvFileUrl: varchar("cvFileUrl", { length: 1000 }),
  cvFileKey: varchar("cvFileKey", { length: 500 }),
  cvFileName: varchar("cvFileName", { length: 255 }),
  cvFileMimeType: varchar("cvFileMimeType", { length: 100 }),
  isAnonymized: boolean("isAnonymized").default(false),
  status: mysqlEnum("status", ["active", "inactive", "deleted"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CvProfile = typeof cvProfiles.$inferSelect;
export type InsertCvProfile = typeof cvProfiles.$inferInsert;

export interface WorkHistoryItem {
  title: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description?: string;
}

export interface LanguageItem {
  language: string;
  proficiency: "native" | "fluent" | "intermediate" | "basic";
}

// Consent logs for GDPR compliance
export const consentLogs = mysqlTable("consent_logs", {
  id: int("id").autoincrement().primaryKey(),
  cvProfileId: int("cvProfileId").references(() => cvProfiles.id),
  userId: int("userId").references(() => users.id),
  consentType: mysqlEnum("consentType", ["data_collection", "data_processing", "marketing", "third_party_sharing"]).notNull(),
  consentGiven: boolean("consentGiven").notNull(),
  consentText: text("consentText"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
});

export type ConsentLog = typeof consentLogs.$inferSelect;
export type InsertConsentLog = typeof consentLogs.$inferInsert;

// Data deletion requests
export const deletionRequests = mysqlTable("deletion_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  cvProfileId: int("cvProfileId").references(() => cvProfiles.id),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "rejected"]).default("pending"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  processedBy: int("processedBy").references(() => users.id),
});

export type DeletionRequest = typeof deletionRequests.$inferSelect;
export type InsertDeletionRequest = typeof deletionRequests.$inferInsert;

// Job descriptions posted by employers
export const jobDescriptions = mysqlTable("job_descriptions", {
  id: int("id").autoincrement().primaryKey(),
  recruiterId: int("recruiterId").references(() => users.id),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyLogo: varchar("companyLogo", { length: 1000 }),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  location: varchar("location", { length: 200 }),
  isRemote: boolean("isRemote").default(false),
  requiredEducation: varchar("requiredEducation", { length: 100 }),
  requiredFieldOfStudy: varchar("requiredFieldOfStudy", { length: 200 }),
  requiredSkills: json("requiredSkills").$type<string[]>(),
  preferredSkills: json("preferredSkills").$type<string[]>(),
  minExperience: int("minExperience"),
  maxExperience: int("maxExperience"),
  salaryMin: decimal("salaryMin", { precision: 12, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 12, scale: 2 }),
  salaryCurrency: varchar("salaryCurrency", { length: 10 }).default("USD"),
  employmentType: mysqlEnum("employmentType", ["full_time", "part_time", "contract", "intern", "hybrid"]).default("full_time"),
  relocationSupport: boolean("relocationSupport").default(false),
  industry: varchar("industry", { length: 200 }),
  description: text("description"),
  responsibilities: text("responsibilities"),
  benefits: text("benefits"),
  deadline: timestamp("deadline"),
  status: mysqlEnum("status", ["draft", "active", "closed", "filled"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = typeof jobDescriptions.$inferInsert;

// Match results between CVs and jobs
export const matchResults = mysqlTable("match_results", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").references(() => jobDescriptions.id).notNull(),
  cvProfileId: int("cvProfileId").references(() => cvProfiles.id).notNull(),
  overallScore: decimal("overallScore", { precision: 5, scale: 2 }),
  educationScore: decimal("educationScore", { precision: 5, scale: 2 }),
  experienceScore: decimal("experienceScore", { precision: 5, scale: 2 }),
  skillsScore: decimal("skillsScore", { precision: 5, scale: 2 }),
  locationScore: decimal("locationScore", { precision: 5, scale: 2 }),
  salaryScore: decimal("salaryScore", { precision: 5, scale: 2 }),
  industryScore: decimal("industryScore", { precision: 5, scale: 2 }),
  scoreExplanation: json("scoreExplanation").$type<ScoreExplanation>(),
  qualificationSummary: text("qualificationSummary"),
  keyHighlights: json("keyHighlights").$type<string[]>(),
  gapAnalysis: json("gapAnalysis").$type<string[]>(),
  recruiterStatus: mysqlEnum("recruiterStatus", ["pending", "shortlisted", "contacted", "rejected", "hired"]).default("pending"),
  recruiterNotes: text("recruiterNotes"),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatchResult = typeof matchResults.$inferSelect;
export type InsertMatchResult = typeof matchResults.$inferInsert;

export interface ScoreExplanation {
  education: string;
  experience: string;
  skills: string;
  location: string;
  salary: string;
  industry: string;
  overall: string;
}

// Notification logs
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  type: mysqlEnum("type", ["new_match", "job_match", "profile_viewed", "status_update", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedJobId: int("relatedJobId").references(() => jobDescriptions.id),
  relatedMatchId: int("relatedMatchId").references(() => matchResults.id),
  isRead: boolean("isRead").default(false),
  emailSent: boolean("emailSent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Audit trail for file access
export const fileAccessLogs = mysqlTable("file_access_logs", {
  id: int("id").autoincrement().primaryKey(),
  cvProfileId: int("cvProfileId").references(() => cvProfiles.id),
  accessedBy: int("accessedBy").references(() => users.id),
  fileKey: varchar("fileKey", { length: 500 }),
  action: mysqlEnum("action", ["view", "download", "delete"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FileAccessLog = typeof fileAccessLogs.$inferSelect;
export type InsertFileAccessLog = typeof fileAccessLogs.$inferInsert;
