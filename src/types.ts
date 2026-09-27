export interface GeneratedEmail {
  to: string;
  toName: string;
  subject: string;
  body: string;
  emailType: 'Warm Referral Outreach' | '300% ROI Counter-Offer' | 'Enterprise Quote & E-Sign Proposal';
  sentAt: string;
}

export interface AgentResolution {
  status: 'idle' | 'analyzing' | 'writing' | 'dispatched';
  gear: 1 | 2 | 3;
  gearName: string;
  reasoning: string;
  mcpTool: string;
  generatedEmail?: GeneratedEmail;
  graph8Result?: any;
  durationMs?: number;
  completedAt?: string;
}

export interface CohortProspect {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  avatar: string;
  selected: boolean;
  status: 'draft' | 'sending' | 'delivered' | 'replied' | 'automated';

  // Step 1: Outbound Email
  outboundSubject: string;
  outboundBody: string;
  outboundSentAt?: string;

  // Step 2: Inbound Reply
  replyCategory?: 'WRONG_PERSON' | 'PRICE_OBJECTION' | 'THIRD_PERSON_QUOTE' | 'NO_REPLY';
  replyGear?: 1 | 2 | 3;
  replyText?: string;
  replyReceivedAt?: string;

  // Step 3: Agent Resolution
  agentResolution?: AgentResolution;
  approvalStatus?: 'not_needed' | 'pending_approval' | 'approved';
}

export interface CohortMetrics {
  total: number;
  selected: number;
  delivered: number;
  replied: number;
  automated: number;
}

export interface FlywheelEvent {
  id: string;
  timestamp: string;
  mode: string;
  stage: 'RECEIVED' | 'CLASSIFIED' | 'GEAR1_REFERRAL' | 'GEAR2_MUTATE' | 'GEAR3_CPQ' | 'MUTATED' | 'CPQ_SENT' | 'COMPLETED';
  title: string;
  description: string;
  data?: any;
}
