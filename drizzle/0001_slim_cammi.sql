CREATE TABLE `consent_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvProfileId` int,
	`userId` int,
	`consentType` enum('data_collection','data_processing','marketing','third_party_sharing') NOT NULL,
	`consentGiven` boolean NOT NULL,
	`consentText` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `consent_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cv_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`fullName` varchar(255) NOT NULL,
	`nationality` varchar(100),
	`city` varchar(100),
	`highestDegree` varchar(100),
	`fieldOfStudy` varchar(200),
	`graduationYear` int,
	`fieldOfWork` varchar(200),
	`willingToRelocate` boolean DEFAULT false,
	`relocationPreference` text,
	`linkedinUrl` varchar(500),
	`minSalaryExpectation` decimal(12,2),
	`salaryCurrency` varchar(10) DEFAULT 'USD',
	`yearsOfExperience` int,
	`skills` json,
	`workHistory` json,
	`certifications` json,
	`languages` json,
	`additionalInfo` text,
	`cvFileUrl` varchar(1000),
	`cvFileKey` varchar(500),
	`cvFileName` varchar(255),
	`cvFileMimeType` varchar(100),
	`isAnonymized` boolean DEFAULT false,
	`status` enum('active','inactive','deleted') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cv_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deletion_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`cvProfileId` int,
	`reason` text,
	`status` enum('pending','processing','completed','rejected') DEFAULT 'pending',
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`processedBy` int,
	CONSTRAINT `deletion_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `file_access_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cvProfileId` int,
	`accessedBy` int,
	`fileKey` varchar(500),
	`action` enum('view','download','delete') NOT NULL,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_access_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_descriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recruiterId` int,
	`companyName` varchar(255) NOT NULL,
	`companyLogo` varchar(1000),
	`jobTitle` varchar(255) NOT NULL,
	`location` varchar(200),
	`isRemote` boolean DEFAULT false,
	`requiredEducation` varchar(100),
	`requiredFieldOfStudy` varchar(200),
	`requiredSkills` json,
	`preferredSkills` json,
	`minExperience` int,
	`maxExperience` int,
	`salaryMin` decimal(12,2),
	`salaryMax` decimal(12,2),
	`salaryCurrency` varchar(10) DEFAULT 'USD',
	`employmentType` enum('full_time','part_time','contract','intern','hybrid') DEFAULT 'full_time',
	`relocationSupport` boolean DEFAULT false,
	`industry` varchar(200),
	`description` text,
	`responsibilities` text,
	`benefits` text,
	`deadline` timestamp,
	`status` enum('draft','active','closed','filled') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_descriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `match_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`cvProfileId` int NOT NULL,
	`overallScore` decimal(5,2),
	`educationScore` decimal(5,2),
	`experienceScore` decimal(5,2),
	`skillsScore` decimal(5,2),
	`locationScore` decimal(5,2),
	`salaryScore` decimal(5,2),
	`industryScore` decimal(5,2),
	`scoreExplanation` json,
	`qualificationSummary` text,
	`keyHighlights` json,
	`gapAnalysis` json,
	`recruiterStatus` enum('pending','shortlisted','contacted','rejected','hired') DEFAULT 'pending',
	`recruiterNotes` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `match_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`type` enum('new_match','job_match','profile_viewed','status_update','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`relatedJobId` int,
	`relatedMatchId` int,
	`isRead` boolean DEFAULT false,
	`emailSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','recruiter','jobseeker') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `consent_logs` ADD CONSTRAINT `consent_logs_cvProfileId_cv_profiles_id_fk` FOREIGN KEY (`cvProfileId`) REFERENCES `cv_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consent_logs` ADD CONSTRAINT `consent_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cv_profiles` ADD CONSTRAINT `cv_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deletion_requests` ADD CONSTRAINT `deletion_requests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deletion_requests` ADD CONSTRAINT `deletion_requests_cvProfileId_cv_profiles_id_fk` FOREIGN KEY (`cvProfileId`) REFERENCES `cv_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `deletion_requests` ADD CONSTRAINT `deletion_requests_processedBy_users_id_fk` FOREIGN KEY (`processedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `file_access_logs` ADD CONSTRAINT `file_access_logs_cvProfileId_cv_profiles_id_fk` FOREIGN KEY (`cvProfileId`) REFERENCES `cv_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `file_access_logs` ADD CONSTRAINT `file_access_logs_accessedBy_users_id_fk` FOREIGN KEY (`accessedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `job_descriptions` ADD CONSTRAINT `job_descriptions_recruiterId_users_id_fk` FOREIGN KEY (`recruiterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_jobId_job_descriptions_id_fk` FOREIGN KEY (`jobId`) REFERENCES `job_descriptions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_cvProfileId_cv_profiles_id_fk` FOREIGN KEY (`cvProfileId`) REFERENCES `cv_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_results` ADD CONSTRAINT `match_results_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_relatedJobId_job_descriptions_id_fk` FOREIGN KEY (`relatedJobId`) REFERENCES `job_descriptions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_relatedMatchId_match_results_id_fk` FOREIGN KEY (`relatedMatchId`) REFERENCES `match_results`(`id`) ON DELETE no action ON UPDATE no action;