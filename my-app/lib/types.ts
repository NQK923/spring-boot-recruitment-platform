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
  title: string;
  description: string | null;
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

export type ApplicationDetails = Application & {
  candidateName: string | null;
};

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
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  cvs: Cv[];
};

export type Experience = {
  id: number;
  title: string | null;
  companyName: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type Education = {
  id: number;
  school: string | null;
  degree: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type Skill = {
  id: number;
  skillName: string | null;
};

export type Cv = {
  id: number;
  fileId: string | null;
  versionName: string;
  isDefault: boolean;
  createdAt: string;
};

export type MeResponse = {
  id: number;
  email: string;
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
