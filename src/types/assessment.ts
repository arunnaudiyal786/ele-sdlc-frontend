// Assessment Types for AI Impact Assessment System

export type AssessmentStatus = 'draft' | 'analyzing' | 'completed' | 'archived';
export type ImpactSeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ChangeType = 'new' | 'modified' | 'deleted';
export type CompletionStatus = 'completed' | 'in_progress' | 'not_started';

// Core Assessment entity
export interface Assessment {
  id: string;
  title: string;
  description: string;
  status: AssessmentStatus;
  createdAt: Date;
  updatedAt: Date;
  epicId?: string;
  epicUrl?: string;
  confidenceScore: number; // 0-100
  createdBy: string;
  assignedTo?: string;
}

// Historical Match from similar past projects
export interface HistoricalMatch {
  id: string;
  epicId: string;
  epicName: string;
  epicDescription: string;
  similarityScore: number; // 0-100
  technologies: string[];
  modules: string[];
  actualEffort: number; // hours
  estimatedEffort: number; // hours
  completionStatus: CompletionStatus;
  completedDate?: Date;
  teamSize: number;
  lessonsLearned?: string;
}

// Impacted Module (functional or technical)
export interface ImpactModule {
  id: string;
  name: string;
  type: 'functional' | 'technical';
  impactSeverity: ImpactSeverity;
  rationale: string;
  dependencies: string[];
  estimatedEffort: number; // hours
  owner?: string;
  tddSection?: string;
  included: boolean; // whether to include in final report
}

// Effort Estimation breakdown
export interface EffortBreakdown {
  module: string;
  devHours: number;
  qaHours: number;
  designHours: number;
}

export interface EffortEstimation {
  totalDevHours: number;
  totalQAHours: number;
  totalDesignHours: number;
  storyPoints: number;
  confidenceScore: number; // 0-100
  breakdown: EffortBreakdown[];
  historicalComparison: {
    averageEffort: number;
    minEffort: number;
    maxEffort: number;
    sampleSize: number;
  };
}

// Generated Jira Story
export interface JiraStory {
  id: string;
  key?: string; // JIRA key like "PROJ-123"
  title: string;
  description: string;
  storyPoints: number;
  priority: Priority;
  type: 'Story' | 'Task' | 'Bug' | 'Spike';
  assignee?: string;
  sprint?: string;
  labels: string[];
  acceptanceCriteria: string[];
  order: number; // for drag-to-reorder
}

// Code Impact Analysis
export interface CodeImpact {
  id: string;
  repository: string;
  filePath: string;
  changeType: ChangeType;
  language: string;
  estimatedLOC: number;
  complexity: ImpactSeverity;
  description: string;
  gitlabUrl?: string;
}

// Risk identification
export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: ImpactSeverity;
  likelihood: ImpactSeverity;
  category: 'technical' | 'resource' | 'schedule' | 'scope' | 'integration';
  mitigation: string;
  owner?: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
}

// Dependency between modules/systems
export interface Dependency {
  id: string;
  sourceModule: string;
  targetModule: string;
  type: 'upstream' | 'downstream' | 'bidirectional';
  description: string;
  criticalPath: boolean;
}

// Full Assessment Result (combines all analysis outputs)
export interface AssessmentResult {
  assessment: Assessment;
  historicalMatches: HistoricalMatch[];
  selectedMatchIds: string[]; // IDs of matches used as baseline
  functionalModules: ImpactModule[];
  technicalModules: ImpactModule[];
  effortEstimation: EffortEstimation;
  jiraStories: JiraStory[];
  codeImpacts: CodeImpact[];
  risks: Risk[];
  dependencies: Dependency[];
}

// Wizard state for new assessment flow
export type WizardStep = 'input' | 'matches' | 'complete' | 'estimation' | 'tdd' | 'jira';

export interface WizardState {
  currentStep: WizardStep;
  requirementText: string;
  epicId: string;
  uploadedFiles: File[];
  selectedMatchIds: string[];
  isAnalyzing: boolean;
  analysisProgress: number; // 0-100
  error?: string;
}

// Dashboard stats
export interface DashboardStats {
  activeAssessments: number;
  totalProjects: number;
  pendingReviews: number;
  avgAccuracy: number; // percentage
}

// Analytics data for charts
export interface MonthlyAnalytics {
  month: string;
  projectsDone: number;
  projectsTasks: number;
  projectsGoal: number;
}

// User for display purposes
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'analyst' | 'manager' | 'developer' | 'admin';
}

// Notification
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}
