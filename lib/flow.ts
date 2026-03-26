import { Stage, Choice, Message, UserSelections, MessageType } from './types';

interface FlowStep {
  id: string;
  stage: Stage;
  message: string;
  type: MessageType;
  choices?: Choice[];
  multiSelect?: boolean;
  inputPlaceholder?: string;
  condition?: (selections: UserSelections) => boolean;
  selectionKey: keyof UserSelections;
}

const FLOW_STEPS: FlowStep[] = [
  // --- Stage 1: What do you want to do today? ---
  {
    id: 'welcome',
    stage: Stage.TASK,
    message: "Hi there! I'm your CommBank branch assistant. I can help you plan a branch visit and make sure everything is set up for you.\n\nWhat can I help you with today?",
    type: 'choices',
    choices: [
      { id: 'open-account', label: 'Open a new account' },
      { id: 'plan-visit', label: 'Plan my branch visit' },
      { id: 'book-appointment', label: 'Book an appointment' },
    ],
    selectionKey: 'primaryTask',
  },
  {
    id: 'customer-type',
    stage: Stage.TASK,
    message: 'Are you already a CommBank customer, or will this be your first time banking with us?',
    type: 'choices',
    choices: [
      { id: 'new', label: "I'm new to CommBank" },
      { id: 'existing', label: "I'm already a customer" },
    ],
    condition: (s) => s.primaryTask === 'open-account',
    selectionKey: 'customerType',
  },
  {
    id: 'account-type',
    stage: Stage.TASK,
    message: "What type of account are you looking for? Don't worry, branch staff can help you choose the best one.",
    type: 'choices',
    choices: [
      { id: 'smart-access', label: 'Smart Access', description: 'An everyday spending account with a debit card' },
      { id: 'saver', label: 'NetBank Saver', description: 'A savings account you manage online' },
      { id: 'goal-saver', label: 'Goal Saver', description: 'A savings account that rewards you for depositing each month' },
      { id: 'not-sure', label: "I'm not sure yet", description: "That's okay — staff will help you choose in branch" },
    ],
    condition: (s) => s.primaryTask === 'open-account',
    selectionKey: 'accountType',
  },
  {
    id: 'started-online',
    stage: Stage.TASK,
    message: 'Have you already started an application online?',
    type: 'choices',
    choices: [
      { id: 'yes', label: 'Yes, I started online' },
      { id: 'no', label: "No, I'll do it all in branch" },
    ],
    condition: (s) => s.primaryTask === 'open-account',
    selectionKey: 'startedOnline',
  },

  // --- Stage 2: Accessibility needs ---
  {
    id: 'accessibility-needs',
    stage: Stage.ACCESSIBILITY,
    message: "Now I'd like to understand what would make this visit comfortable for you.\n\nWhat's important to you for this visit? Select all that apply.",
    type: 'choices',
    multiSelect: true,
    choices: [
      { id: 'quiet-space', label: 'I need a quiet or private space' },
      { id: 'wheelchair', label: 'I use a wheelchair or mobility aid' },
      { id: 'support-person', label: "I'm bringing a support person or carer" },
      { id: 'hearing', label: 'I have a hearing impairment' },
      { id: 'vision', label: 'I have a vision impairment' },
      { id: 'simple-language', label: 'I prefer simple, clear language' },
      { id: 'overwhelming', label: 'I find banks overwhelming or stressful' },
      { id: 'sunflower', label: 'I wear a Hidden Disabilities Sunflower' },
      { id: 'other', label: 'Something else' },
      { id: 'none', label: 'No specific needs' },
    ],
    selectionKey: 'accessibilityNeeds',
  },
  {
    id: 'accessibility-other',
    stage: Stage.ACCESSIBILITY,
    message: "Could you tell me a bit more about what you need? I'll do my best to find a branch that works for you.",
    type: 'text-input',
    inputPlaceholder: 'Tell us what would help...',
    condition: (s) => s.accessibilityNeeds.includes('other'),
    selectionKey: 'accessibilityOther',
  },

  // --- Stage 3: Journey planning ---
  {
    id: 'transport-mode',
    stage: Stage.JOURNEY,
    message: 'How are you planning to get to the branch?',
    type: 'choices',
    choices: [
      { id: 'drive', label: 'Drive' },
      { id: 'public-transport', label: 'Public transport' },
      { id: 'taxi', label: 'Taxi or rideshare' },
      { id: 'someone-taking', label: 'Someone is taking me' },
    ],
    selectionKey: 'transportMode',
  },
  {
    id: 'accessible-parking',
    stage: Stage.JOURNEY,
    message: 'Do you need accessible parking near the branch?',
    type: 'choices',
    choices: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      { id: 'not-sure', label: 'Not sure' },
    ],
    condition: (s) => s.transportMode === 'drive' || s.transportMode === 'someone-taking',
    selectionKey: 'needsAccessibleParking',
  },
  {
    id: 'branch-preference',
    stage: Stage.JOURNEY,
    message: 'Would you prefer a branch close to home, or are you happy to travel further for better accessibility facilities?',
    type: 'choices',
    choices: [
      { id: 'close', label: 'Close to home is best' },
      { id: 'better-facilities', label: "I'll travel further for better facilities" },
    ],
    selectionKey: 'branchPreference',
  },
  {
    id: 'suburb',
    stage: Stage.JOURNEY,
    message: "What suburb or postcode are you starting from? I'll find branches near you.",
    type: 'text-input',
    inputPlaceholder: 'e.g. Chatswood or 2067',
    selectionKey: 'suburb',
  },

  // Stage 4 & 5 are handled specially in the Chat component
];

let stepCounter = 0;

function makeId(): string {
  return `msg-${Date.now()}-${stepCounter++}`;
}

export function getInitialMessages(): Message[] {
  return [
    {
      id: makeId(),
      role: 'bot',
      content: "Hi there! I'm your CommBank branch assistant. I can help you plan a branch visit and make sure everything is set up for you.\n\nWhat can I help you with today?",
      type: 'choices',
      choices: [
        { id: 'open-account', label: 'Open a new account' },
        { id: 'plan-visit', label: 'Plan my branch visit' },
        { id: 'book-appointment', label: 'Book an appointment' },
      ],
      stage: Stage.TASK,
    },
  ];
}

export function getNextBotMessage(
  currentStepId: string,
  selections: UserSelections
): { message: Message; stepId: string } | null {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStepId);
  if (currentIndex === -1) return null;

  // Find the next applicable step
  for (let i = currentIndex + 1; i < FLOW_STEPS.length; i++) {
    const step = FLOW_STEPS[i];
    if (!step.condition || step.condition(selections)) {
      return {
        stepId: step.id,
        message: {
          id: makeId(),
          role: 'bot',
          content: step.message,
          type: step.type,
          choices: step.choices,
          multiSelect: step.multiSelect,
          inputPlaceholder: step.inputPlaceholder,
          stage: step.stage,
        },
      };
    }
  }

  // No more steps — trigger branch finder
  return null;
}

export function getStepSelectionKey(stepId: string): keyof UserSelections | undefined {
  return FLOW_STEPS.find((s) => s.id === stepId)?.selectionKey;
}

export function getCurrentStage(stepId: string): Stage {
  const step = FLOW_STEPS.find((s) => s.id === stepId);
  return step?.stage ?? Stage.TASK;
}

export function getAccessibilityAcknowledgement(needs: string[]): string | null {
  const parts: string[] = [];

  if (needs.includes('quiet-space') || needs.includes('overwhelming')) {
    parts.push("I'll prioritise branches with quiet rooms or private spaces. You can also request a **Customer Preference Card** — it lets you tell staff about your needs without having to explain in person.");
  }
  if (needs.includes('sunflower')) {
    parts.push('CommBank participates in the **Hidden Disabilities Sunflower** program — staff are trained to recognise the Sunflower lanyard and offer extra support.');
  }
  if (needs.includes('hearing')) {
    parts.push("I'll look for branches with hearing loop systems installed.");
  }
  if (needs.includes('vision')) {
    parts.push("Branch staff can assist with reading documents and forms. The **Equal Access Toolkit** includes large print materials and other support tools.");
  }
  if (needs.includes('simple-language')) {
    parts.push("I'll keep everything clear and straightforward.");
  }

  if (parts.length === 0) return null;
  return "Thanks for sharing that. Here's what I can do:\n\n" + parts.join('\n\n');
}

export { FLOW_STEPS };
