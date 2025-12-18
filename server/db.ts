import { eq, and, like, or, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  cvProfiles, InsertCvProfile,
  consentLogs,
  deletionRequests,
  jobDescriptions, InsertJobDescription,
  matchResults, InsertMatchResult,
  ScoreExplanation
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { invokeLLM } from "./_core/llm";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Jobs
export async function getJobs(filters?: {
  search?: string;
  location?: string;
  industries?: string[];
  jobType?: string;
  remoteOnly?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(jobDescriptions).where(eq(jobDescriptions.status, "active"));
  
  const results = await query.orderBy(desc(jobDescriptions.createdAt));
  
  let filtered = results;
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(j => 
      j.jobTitle.toLowerCase().includes(searchLower) || 
      j.companyName.toLowerCase().includes(searchLower) ||
      j.description?.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters?.location) {
    const locLower = filters.location.toLowerCase();
    filtered = filtered.filter(j => j.location?.toLowerCase().includes(locLower));
  }
  
  if (filters?.industries && filters.industries.length > 0) {
    filtered = filtered.filter(j => j.industry && filters.industries!.includes(j.industry));
  }
  
  if (filters?.jobType && filters.jobType !== "all") {
    filtered = filtered.filter(j => j.employmentType === filters.jobType);
  }
  
  if (filters?.remoteOnly) {
    filtered = filtered.filter(j => j.isRemote);
  }
  
  return filtered;
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createJob(recruiterId: number, data: Omit<InsertJobDescription, "recruiterId" | "status">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const values: InsertJobDescription = {
    ...data,
    recruiterId,
    status: "active",
    salaryMin: data.salaryMin?.toString(),
    salaryMax: data.salaryMax?.toString(),
  };

  const result = await db.insert(jobDescriptions).values(values);
  return { id: result[0].insertId };
}

export async function getMyJobs(recruiterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobDescriptions).where(eq(jobDescriptions.recruiterId, recruiterId)).orderBy(desc(jobDescriptions.createdAt));
}

// CV Profiles
export async function submitCV(userId: number, data: {
  fullName: string;
  nationality?: string;
  city?: string;
  highestDegree?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  fieldOfWork?: string;
  willingToRelocate?: boolean;
  relocationPreference?: string;
  linkedinUrl?: string;
  minSalaryExpectation?: number;
  salaryCurrency?: string;
  yearsOfExperience?: number;
  skills?: string[];
  workHistory?: { title: string; employer: string; location: string; startDate: string; endDate: string; isCurrent: boolean; description?: string; }[];
  certifications?: string[];
  languages?: { language: string; proficiency: "native" | "fluent" | "intermediate" | "basic"; }[];
  additionalInfo?: string;
  cvFileUrl?: string;
  cvFileKey?: string;
  cvFileName?: string;
  cvFileMimeType?: string;
  consentDataCollection: boolean;
  consentDataProcessing: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check for existing profile
  const existing = await db.select().from(cvProfiles).where(eq(cvProfiles.userId, userId)).limit(1);
  
  const profileData: InsertCvProfile = {
    userId,
    fullName: data.fullName,
    nationality: data.nationality,
    city: data.city,
    highestDegree: data.highestDegree,
    fieldOfStudy: data.fieldOfStudy,
    graduationYear: data.graduationYear,
    fieldOfWork: data.fieldOfWork,
    willingToRelocate: data.willingToRelocate,
    relocationPreference: data.relocationPreference,
    linkedinUrl: data.linkedinUrl,
    minSalaryExpectation: data.minSalaryExpectation?.toString(),
    salaryCurrency: data.salaryCurrency,
    yearsOfExperience: data.yearsOfExperience,
    skills: data.skills,
    workHistory: data.workHistory,
    certifications: data.certifications,
    languages: data.languages,
    additionalInfo: data.additionalInfo,
    cvFileUrl: data.cvFileUrl,
    cvFileKey: data.cvFileKey,
    cvFileName: data.cvFileName,
    cvFileMimeType: data.cvFileMimeType,
    status: "active",
  };

  let profileId: number;
  
  if (existing.length > 0) {
    await db.update(cvProfiles).set(profileData).where(eq(cvProfiles.id, existing[0].id));
    profileId = existing[0].id;
  } else {
    const result = await db.insert(cvProfiles).values(profileData);
    profileId = result[0].insertId;
  }

  // Log consent
  if (data.consentDataCollection) {
    await db.insert(consentLogs).values({
      cvProfileId: profileId,
      userId,
      consentType: "data_collection",
      consentGiven: true,
      consentText: "I consent to the collection and storage of my personal data.",
    });
  }
  
  if (data.consentDataProcessing) {
    await db.insert(consentLogs).values({
      cvProfileId: profileId,
      userId,
      consentType: "data_processing",
      consentGiven: true,
      consentText: "I consent to the processing of my data by AI systems for job matching purposes.",
    });
  }

  return { id: profileId };
}

export async function getMyProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(cvProfiles).where(and(eq(cvProfiles.userId, userId), eq(cvProfiles.status, "active"))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function requestDeletion(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const profile = await db.select().from(cvProfiles).where(eq(cvProfiles.userId, userId)).limit(1);
  
  if (profile.length > 0) {
    await db.insert(deletionRequests).values({
      userId,
      cvProfileId: profile[0].id,
      status: "pending",
    });
    
    // Mark profile as deleted
    await db.update(cvProfiles).set({ status: "deleted" }).where(eq(cvProfiles.id, profile[0].id));
  }

  return { success: true };
}

// Matching
export async function getMatchesForJob(jobId: number, recruiterId: number) {
  const db = await getDb();
  if (!db) return [];

  // Verify recruiter owns this job
  const job = await db.select().from(jobDescriptions).where(and(eq(jobDescriptions.id, jobId), eq(jobDescriptions.recruiterId, recruiterId))).limit(1);
  if (job.length === 0) throw new Error("Job not found or access denied");

  const matches = await db.select().from(matchResults).where(eq(matchResults.jobId, jobId)).orderBy(desc(matchResults.overallScore));
  
  // Get candidate details for each match
  const matchesWithCandidates = await Promise.all(matches.map(async (match) => {
    const candidate = await db.select().from(cvProfiles).where(eq(cvProfiles.id, match.cvProfileId)).limit(1);
    return {
      ...match,
      candidate: candidate[0] || null,
    };
  }));

  return matchesWithCandidates.filter(m => m.candidate);
}

export async function runMatching(jobId: number, recruiterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get job details
  const job = await db.select().from(jobDescriptions).where(and(eq(jobDescriptions.id, jobId), eq(jobDescriptions.recruiterId, recruiterId))).limit(1);
  if (job.length === 0) throw new Error("Job not found or access denied");
  const jobData = job[0];

  // Get all active CV profiles
  const candidates = await db.select().from(cvProfiles).where(eq(cvProfiles.status, "active"));

  // Delete existing matches for this job
  await db.delete(matchResults).where(eq(matchResults.jobId, jobId));

  // Run matching for each candidate
  for (const candidate of candidates) {
    const scores = await calculateMatchScores(jobData, candidate);
    
    await db.insert(matchResults).values({
      jobId,
      cvProfileId: candidate.id,
      overallScore: scores.overall.toString(),
      educationScore: scores.education.toString(),
      experienceScore: scores.experience.toString(),
      skillsScore: scores.skills.toString(),
      locationScore: scores.location.toString(),
      salaryScore: scores.salary.toString(),
      industryScore: scores.industry.toString(),
      scoreExplanation: scores.explanations,
      qualificationSummary: scores.summary,
      keyHighlights: scores.highlights,
      gapAnalysis: scores.gaps,
      recruiterStatus: "pending",
    });
  }

  return { success: true, matchCount: candidates.length };
}

async function calculateMatchScores(job: typeof jobDescriptions.$inferSelect, candidate: typeof cvProfiles.$inferSelect) {
  // Education score (15%)
  let educationScore = 50;
  let educationExplanation = "No education requirements specified.";
  
  if (job.requiredEducation && candidate.highestDegree) {
    const degreeRank: Record<string, number> = { "PhD": 5, "Master": 4, "Bachelor": 3, "Associate": 2, "High School": 1 };
    const requiredRank = degreeRank[job.requiredEducation] || 0;
    const candidateRank = degreeRank[candidate.highestDegree] || 0;
    
    if (candidateRank >= requiredRank) {
      educationScore = 100;
      educationExplanation = `Candidate has ${candidate.highestDegree} degree, meeting or exceeding the ${job.requiredEducation} requirement.`;
    } else {
      educationScore = Math.max(30, (candidateRank / requiredRank) * 100);
      educationExplanation = `Candidate has ${candidate.highestDegree} degree, below the ${job.requiredEducation} requirement.`;
    }
    
    if (job.requiredFieldOfStudy && candidate.fieldOfStudy) {
      if (candidate.fieldOfStudy.toLowerCase().includes(job.requiredFieldOfStudy.toLowerCase())) {
        educationScore = Math.min(100, educationScore + 10);
        educationExplanation += ` Field of study (${candidate.fieldOfStudy}) matches requirement.`;
      }
    }
  }

  // Experience score (25%)
  let experienceScore = 50;
  let experienceExplanation = "No experience requirements specified.";
  
  if (job.minExperience !== null && candidate.yearsOfExperience !== null) {
    if (candidate.yearsOfExperience >= job.minExperience) {
      experienceScore = 100;
      experienceExplanation = `Candidate has ${candidate.yearsOfExperience} years of experience, meeting the ${job.minExperience}+ year requirement.`;
    } else {
      experienceScore = Math.max(20, (candidate.yearsOfExperience / job.minExperience) * 100);
      experienceExplanation = `Candidate has ${candidate.yearsOfExperience} years of experience, below the ${job.minExperience} year requirement.`;
    }
  }

  // Skills score (30%)
  let skillsScore = 50;
  let skillsExplanation = "No skills requirements specified.";
  
  if (job.requiredSkills && job.requiredSkills.length > 0 && candidate.skills && candidate.skills.length > 0) {
    const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
    const matchedSkills = job.requiredSkills.filter(skill => 
      candidateSkillsLower.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
    );
    skillsScore = (matchedSkills.length / job.requiredSkills.length) * 100;
    skillsExplanation = `Candidate matches ${matchedSkills.length} of ${job.requiredSkills.length} required skills: ${matchedSkills.join(", ") || "none"}.`;
  }

  // Location score (10%)
  let locationScore = 50;
  let locationExplanation = "No location requirements specified.";
  
  if (job.location && candidate.city) {
    if (job.location.toLowerCase().includes(candidate.city.toLowerCase()) || candidate.city.toLowerCase().includes(job.location.toLowerCase())) {
      locationScore = 100;
      locationExplanation = `Candidate is located in ${candidate.city}, matching job location (${job.location}).`;
    } else if (candidate.willingToRelocate) {
      locationScore = 80;
      locationExplanation = `Candidate is in ${candidate.city} but willing to relocate to ${job.location}.`;
    } else {
      locationScore = 30;
      locationExplanation = `Candidate is in ${candidate.city}, job is in ${job.location}, and candidate is not open to relocation.`;
    }
  }
  
  if (job.isRemote) {
    locationScore = 100;
    locationExplanation = "Job is remote, location is flexible.";
  }

  // Salary score (10%)
  let salaryScore = 50;
  let salaryExplanation = "No salary information available.";
  
  if (job.salaryMax && candidate.minSalaryExpectation) {
    const jobMax = parseFloat(job.salaryMax);
    const candidateMin = parseFloat(candidate.minSalaryExpectation);
    
    if (candidateMin <= jobMax) {
      salaryScore = 100;
      salaryExplanation = `Candidate's minimum salary expectation (${candidate.salaryCurrency} ${candidateMin.toLocaleString()}) is within the job's budget.`;
    } else {
      salaryScore = Math.max(20, (jobMax / candidateMin) * 100);
      salaryExplanation = `Candidate's minimum salary expectation (${candidate.salaryCurrency} ${candidateMin.toLocaleString()}) exceeds the job's maximum (${job.salaryCurrency} ${jobMax.toLocaleString()}).`;
    }
  }

  // Industry score (10%)
  let industryScore = 50;
  let industryExplanation = "No industry requirements specified.";
  
  if (job.industry && candidate.fieldOfWork) {
    if (job.industry.toLowerCase() === candidate.fieldOfWork.toLowerCase()) {
      industryScore = 100;
      industryExplanation = `Candidate's field of work (${candidate.fieldOfWork}) matches the job industry (${job.industry}).`;
    } else {
      industryScore = 40;
      industryExplanation = `Candidate's field of work (${candidate.fieldOfWork}) differs from job industry (${job.industry}).`;
    }
  }

  // Calculate weighted overall score
  const overall = (
    educationScore * 0.15 +
    experienceScore * 0.25 +
    skillsScore * 0.30 +
    locationScore * 0.10 +
    salaryScore * 0.10 +
    industryScore * 0.10
  );

  // Generate highlights and gaps
  const highlights: string[] = [];
  const gaps: string[] = [];

  if (skillsScore >= 80) highlights.push("Strong skill match with job requirements");
  if (experienceScore >= 80) highlights.push("Meets or exceeds experience requirements");
  if (educationScore >= 80) highlights.push("Education qualifications align well");
  if (locationScore >= 80) highlights.push("Location is compatible");

  if (skillsScore < 60) gaps.push("Some required skills may be missing");
  if (experienceScore < 60) gaps.push("Experience level below requirements");
  if (educationScore < 60) gaps.push("Education level below requirements");
  if (salaryScore < 60) gaps.push("Salary expectations may exceed budget");

  const summary = `Candidate with ${candidate.yearsOfExperience || 0} years of experience in ${candidate.fieldOfWork || "their field"}. ${candidate.highestDegree ? `Holds a ${candidate.highestDegree} degree` : ""}${candidate.fieldOfStudy ? ` in ${candidate.fieldOfStudy}` : ""}.`;

  return {
    overall: Math.round(overall),
    education: Math.round(educationScore),
    experience: Math.round(experienceScore),
    skills: Math.round(skillsScore),
    location: Math.round(locationScore),
    salary: Math.round(salaryScore),
    industry: Math.round(industryScore),
    explanations: {
      overall: `Overall match score based on weighted criteria: Skills (30%), Experience (25%), Education (15%), Location (10%), Salary (10%), Industry (10%).`,
      education: educationExplanation,
      experience: experienceExplanation,
      skills: skillsExplanation,
      location: locationExplanation,
      salary: salaryExplanation,
      industry: industryExplanation,
    } as ScoreExplanation,
    summary,
    highlights,
    gaps,
  };
}

export async function updateMatchStatus(matchId: number, status: "shortlisted" | "contacted" | "rejected", reviewerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(matchResults).set({
    recruiterStatus: status,
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
  }).where(eq(matchResults.id, matchId));

  return { success: true };
}
