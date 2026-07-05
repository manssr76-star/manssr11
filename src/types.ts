export interface Job {
  id: string;
  title: string;
  company: string;
  region: string;
  experience: 'Junior' | 'Mid' | 'Senior' | 'All';
  skills: string[];
  description: string;
  salary: string;
  contactEmail: string;
  postedAt: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  region: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface UserCV {
  id: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  content: string;
  isActive: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  skills: string[];
  experience: 'Junior' | 'Mid' | 'Senior';
  resumeText: string;
  resumeFileName: string | null;
  workExperiences?: WorkExperience[];
  educationList?: Education[];
  cvs?: UserCV[];
  activeCvId?: string | null;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  coverLetter: string;
  status: 'Pending' | 'Sent' | 'Failed';
  emailPreview?: string;
}

export interface JobAlert {
  id: string;
  region: string;
  skills: string[];
  experience: 'Junior' | 'Mid' | 'Senior' | 'All';
  isActive: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  jobId?: string;
  createdAt: string;
  read: boolean;
}

export interface CompanyEmail {
  companyName: string;
  email: string;
  description: string;
  reliability: string;
  region: string;
}

