export enum Stage {
  TASK = 1,
  ACCESSIBILITY = 2,
  JOURNEY = 3,
  BRANCH_FINDER = 4,
  VISIT_PLAN = 5,
}

export const STAGE_LABELS: Record<Stage, string> = {
  [Stage.TASK]: 'Your task',
  [Stage.ACCESSIBILITY]: 'Accessibility needs',
  [Stage.JOURNEY]: 'Your journey',
  [Stage.BRANCH_FINDER]: 'Find a branch',
  [Stage.VISIT_PLAN]: 'Your plan',
};

export interface Choice {
  id: string;
  label: string;
  description?: string;
}

export type MessageType = 'text' | 'choices' | 'text-input' | 'branches' | 'visit-plan';

export interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
  type: MessageType;
  choices?: Choice[];
  multiSelect?: boolean;
  inputPlaceholder?: string;
  stage?: Stage;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  suburb: string;
  postcode: string;
  distanceKm: number;
  driveMinutes: number;
  walkMinutes: number;
  features: BranchFeatures;
  hours: string;
  phone: string;
}

export interface BranchFeatures {
  quietRoom: boolean;
  hearingLoop: boolean;
  wheelchairAccess: boolean;
  accessibleParking: boolean;
  privateMeetingRoom: boolean;
  automaticDoors: boolean;
}

export interface UserSelections {
  // Stage 1
  primaryTask?: string;
  customerType?: string;
  accountType?: string;
  startedOnline?: string;

  // Stage 2
  accessibilityNeeds: string[];
  accessibilityOther?: string;

  // Stage 3
  transportMode?: string;
  needsAccessibleParking?: string;
  branchPreference?: string;
  suburb?: string;

  // Stage 4
  selectedBranch?: Branch;
  appointmentType?: string;

  // Stage 5 — derived
}
