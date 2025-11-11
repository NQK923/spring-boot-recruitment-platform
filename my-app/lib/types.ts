export type Role = "SUPER_ADMIN" | "COMPANY_ADMIN" | "RECRUITER" | "CANDIDATE";

export type JobStatus = "DRAFT" | "PUBLISHED" | "PAUSED" | "CLOSED";

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEWING"
  | "OFFERED"
  | "HIRED"
  | "REJECTED";

export type JobPostingPublic = {
  id: number;
  companyId: number | null;
  title: string;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  salaryRange: string | null;
  hiringQuantity: number;
  availableSlots: number;
  location: string | null;
  workType: string | null;
  department: string | null;
  level: string | null;
  status: string | null;
};

export type JobPosition = {
  id: number;
  companyId: number;
  title: string;
  department: string | null;
  level: string | null;
};

export type JobPosting = {
  id: number;
  companyId: number;
  jobPosition?: JobPosition | null;
  title: string;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  salaryRange: string | null;
  hiringQuantity: number;
  location: string | null;
  workType: string | null;
  status: JobStatus;
  recruiterId: number | null;
  createdAt: string;
  updatedAt: string | null;
};

export type Application = {
  id: number;
  jobPostingId: number;
  candidateId: number;
  cvId: number | null;
  source: string | null;
  status: ApplicationStatus;
  ownerUserId: number | null;
  appliedAt: string | null;
};

export type ApplicationInterviewDetails = {
  scheduledAt: string;
  timezone: string | null;
  location: string | null;
  instructions: string | null;
};

export type ApplicationOfferStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export type ApplicationOfferDetails = {
  salaryAmount: number;
  currency: string;
  notes: string | null;
  status: ApplicationOfferStatus;
  expiresAt: string | null;
  respondedAt: string | null;
  respondedByCandidateId: number | null;
  decisionNote: string | null;
};

export type ApplicationDetails = Application & {
  candidateName: string | null;
  interviewDetails?: ApplicationInterviewDetails | null;
  offerDetails?: ApplicationOfferDetails | null;
};

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export type SkillProficiency = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type LanguageProficiency =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2"
  | "FLUENT"
  | "NATIVE";

export type ApplicationNote = {
  id: number;
  applicationId: number;
  authorUserId: number;
  content: string;
  createdAt: string;
};

export type Interview = {
  id: number;
  applicationId: number;
  scheduleTime: string | null;
  timezone: string | null;
  format: string | null;
  locationOrLink: string | null;
  outcome: string | null;
};

export type Profile = {
  userId: number;
  fullName: string | null;
  phoneNumber: string | null;
  summary: string | null;
  avatarUrl: string | null;
  emailForCv: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  yearsOfExperience: number | null;
  desiredPosition: string | null;
  workAuthorization: string | null;
  openToRelocate: boolean;
  preferredCvLanguage: "vi" | "en" | null;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: ProfileLanguage[];
  cvs: Cv[];
};

export type Experience = {
  id: number;
  title: string | null;
  companyName: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  employmentType: EmploymentType | null;
  current: boolean;
  achievements: string | null;
  techStack: string[];
};

export type Education = {
  id: number;
  school: string | null;
  degree: string | null;
  major: string | null;
  gpa: string | null;
  honors: string | null;
  activities: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type Skill = {
  id: number;
  skillName: string | null;
  proficiency: SkillProficiency | null;
  years: number | null;
};

export type Project = {
  id: number;
  name: string | null;
  role: string | null;
  summary: string | null;
  responsibilities: string | null;
  achievements: string | null;
  techStack: string[];
  projectUrl: string | null;
  repoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
};

export type Certification = {
  id: number;
  name: string | null;
  issuer: string | null;
  issueDate: string | null;
  expireDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
};

export type ProfileLanguage = {
  id: number;
  language: string | null;
  proficiency: LanguageProficiency | null;
};

export type Cv = {
  id: number;
  fileId: string | null;
  downloadUrl: string | null;
  versionName: string;
  isDefault: boolean;
  createdAt: string;
  fileSize: number | null;
};

export type MeResponse = {
  id: number;
  email: string;
  companyId: number | null;
  roles: Role[];
};

export type InvitationDetails = {
  email: string;
  roleToGrant: Role;
  companyId: number | null;
  expiresAt: string;
};

export type AuthTokenResponse = {
  accessToken: string;
};

export type OAuthConfig = {
  googleClientId: string | null;
  githubClientId: string | null;
  githubRedirectUri: string | null;
  githubAuthorizeRedirectUri: string | null;
};

export type PublicOverviewResponse = {
  metrics: {
    companies: number;
    candidates: number;
    jobs: number;
    applications: number;
    interviews: number;
    upcomingInterviews: number;
  };
  pipeline: {
    applicationStages: PipelineStage[];
    jobStatuses: JobStatusBreakdown[];
  };
  spotlightJobs: JobSpotlight[];
};

export type PipelineStage = {
  stage: string;
  count: number;
};

export type JobStatusBreakdown = {
  status: string;
  count: number;
};

export type JobSpotlight = {
  id: number;
  companyId: number | null;
  title: string;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  salaryRange: string | null;
  location: string | null;
  workType: string | null;
  department: string | null;
  level: string | null;
  status: string | null;
};

export type CompanyPublicProfile = {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  companySize: string | null;
  companyAddress: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
