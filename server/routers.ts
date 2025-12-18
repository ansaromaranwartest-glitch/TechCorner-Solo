import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  getJobs, getJobById, createJob, getMyJobs, 
  submitCV, getMyProfile, requestDeletion,
  getMatchesForJob, runMatching, updateMatchStatus 
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  jobs: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        location: z.string().optional(),
        industries: z.array(z.string()).optional(),
        jobType: z.string().optional(),
        remoteOnly: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getJobs(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getJobById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        companyName: z.string().min(1),
        jobTitle: z.string().min(1),
        location: z.string().optional(),
        isRemote: z.boolean().optional(),
        requiredEducation: z.string().optional(),
        requiredFieldOfStudy: z.string().optional(),
        requiredSkills: z.array(z.string()).optional(),
        preferredSkills: z.array(z.string()).optional(),
        minExperience: z.number().optional(),
        maxExperience: z.number().optional(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        salaryCurrency: z.string().optional(),
        employmentType: z.enum(["full_time", "part_time", "contract", "intern", "hybrid"]).optional(),
        relocationSupport: z.boolean().optional(),
        industry: z.string().optional(),
        description: z.string().optional(),
        responsibilities: z.string().optional(),
        benefits: z.string().optional(),
        deadline: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createJob(ctx.user.id, {
          ...input,
          salaryMin: input.salaryMin?.toString(),
          salaryMax: input.salaryMax?.toString(),
        });
      }),

    myJobs: protectedProcedure.query(async ({ ctx }) => {
      return getMyJobs(ctx.user.id);
    }),
  }),

  cv: router({
    submit: protectedProcedure
      .input(z.object({
        fullName: z.string().min(1),
        nationality: z.string().optional(),
        city: z.string().optional(),
        highestDegree: z.string().optional(),
        fieldOfStudy: z.string().optional(),
        graduationYear: z.number().optional(),
        fieldOfWork: z.string().optional(),
        willingToRelocate: z.boolean().optional(),
        relocationPreference: z.string().optional(),
        linkedinUrl: z.string().optional(),
        minSalaryExpectation: z.number().optional(),
        salaryCurrency: z.string().optional(),
        yearsOfExperience: z.number().optional(),
        skills: z.array(z.string()).optional(),
        workHistory: z.array(z.object({
          title: z.string(),
          employer: z.string(),
          location: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          isCurrent: z.boolean(),
          description: z.string().optional(),
        })).optional(),
        certifications: z.array(z.string()).optional(),
        languages: z.array(z.object({
          language: z.string(),
          proficiency: z.enum(["native", "fluent", "intermediate", "basic"]),
        })).optional(),
        additionalInfo: z.string().optional(),
        cvFileUrl: z.string().optional(),
        cvFileKey: z.string().optional(),
        cvFileName: z.string().optional(),
        cvFileMimeType: z.string().optional(),
        consentDataCollection: z.boolean(),
        consentDataProcessing: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        return submitCV(ctx.user.id, input);
      }),

    myProfile: protectedProcedure.query(async ({ ctx }) => {
      return getMyProfile(ctx.user.id);
    }),

    requestDeletion: protectedProcedure.mutation(async ({ ctx }) => {
      return requestDeletion(ctx.user.id);
    }),
  }),

  matching: router({
    getMatches: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getMatchesForJob(input.jobId, ctx.user.id);
      }),

    runMatching: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return runMatching(input.jobId, ctx.user.id);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        status: z.enum(["shortlisted", "contacted", "rejected"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return updateMatchStatus(input.matchId, input.status, ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
