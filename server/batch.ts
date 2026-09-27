/**
 * In-Memory Batch Manager for 20 Enterprise B2B Prospects
 * Starts completely clean (zero email data, zero replies, zero drafts).
 * Populates outbound emails when dispatched, and inbound replies when simulated or received via webhook.
 */

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

    // Step 3 & 4: Autonomous Agent Resolution
    agentResolution?: AgentResolution;
    approvalStatus?: 'not_needed' | 'pending_approval' | 'approved';
}

export const PROSPECT_REPLY_SCENARIOS: Record<string, {
    category: 'WRONG_PERSON' | 'PRICE_OBJECTION' | 'THIRD_PERSON_QUOTE';
    gear: 1 | 2 | 3;
    text: string;
}> = {
    // Gear 1: Referral Hunter
    'lead-1': {
        category: 'WRONG_PERSON',
        gear: 1,
        text: "I don't make tooling decisions here. Please reach out to Sarah Jenkins, our VP of Engineering (sarah.jenkins@cloudscale.io)."
    },
    'lead-4': {
        category: 'WRONG_PERSON',
        gear: 1,
        text: "Not my department anymore. You should talk with Lisa Wang, our Chief Product Officer (lisa.wang@saasflow.io)."
    },
    'lead-7': {
        category: 'WRONG_PERSON',
        gear: 1,
        text: "Wrong person for this infrastructure. Please contact Marcus Sterling, VP of Sales Ops (marcus.sterling@vanguardmedia.com)."
    },
    'lead-10': {
        category: 'WRONG_PERSON',
        gear: 1,
        text: "Not my department. Speak with Amanda Vance, our Head of IT & Systems (amanda.vance@apexlogistics.com)."
    },
    'lead-13': {
        category: 'WRONG_PERSON',
        gear: 1,
        text: "I don't make tooling decisions here. Please reach out to David Ross, our VP of RevOps (david.ross@datapulse.io)."
    },
    'lead-16': {
        category: 'WRONG_PERSON',
        gear: 1,
        text: "Not my department anymore. You should talk with Kevin Smith, our Chief Technology Officer (kevin.smith@cloudcore.io)."
    },
    'lead-19': {
        category: 'WRONG_PERSON',
        gear: 1,
        text: "Wrong person for sales infrastructure. Please speak with Laura Chen, our VP of Revenue Operations (laura.chen@globaltalent.ai)."
    },

    // Gear 2: Step Mutator (Competitor & Price Objection)
    'lead-2': {
        category: 'PRICE_OBJECTION',
        gear: 2,
        text: "We currently use Apollo and Outreach, and your price is way too expensive for our current quarterly budget."
    },
    'lead-5': {
        category: 'PRICE_OBJECTION',
        gear: 2,
        text: "Our budget is completely locked with ZoomInfo until Q4. Can you follow up next year?"
    },
    'lead-8': {
        category: 'PRICE_OBJECTION',
        gear: 2,
        text: "We already evaluated HubSpot and your platform seems pricey. We cannot justify spending without guaranteed ROI."
    },
    'lead-11': {
        category: 'PRICE_OBJECTION',
        gear: 2,
        text: "Looks interesting but our CFO paused all new software spend. Do you offer tool-consolidation discounts?"
    },
    'lead-14': {
        category: 'PRICE_OBJECTION',
        gear: 2,
        text: "We currently use ZoomInfo and our budget is locked for the quarter. Your solution seems too expensive right now."
    },
    'lead-17': {
        category: 'PRICE_OBJECTION',
        gear: 2,
        text: "We already evaluated Apollo and our CFO paused all new software spend. Do you offer vendor consolidation discounts?"
    },
    'lead-20': {
        category: 'PRICE_OBJECTION',
        gear: 2,
        text: "We currently use HubSpot and your platform seems pricey. We cannot justify spending without guaranteed ROI."
    },

    // Gear 3: CPQ Quote Engine (Buying Signal)
    'lead-3': {
        category: 'THIRD_PERSON_QUOTE',
        gear: 3,
        text: "This architecture looks solid. We need 25 seats with Net-30 payment terms. Please send over an official quote so we can sign."
    },
    'lead-6': {
        category: 'THIRD_PERSON_QUOTE',
        gear: 3,
        text: "Very relevant. We want to pilot 10 seats for our outbound SDR team under Net-15 terms. Can you send the pricing agreement?"
    },
    'lead-9': {
        category: 'THIRD_PERSON_QUOTE',
        gear: 3,
        text: "We are ready to move forward. We need 50 seats with Net-30 enterprise billing. Send the quote and checkout link."
    },
    'lead-12': {
        category: 'THIRD_PERSON_QUOTE',
        gear: 3,
        text: "Great timing. Send a proposal for 15 seats with Net-30 terms so I can get executive approval today."
    },
    'lead-15': {
        category: 'THIRD_PERSON_QUOTE',
        gear: 3,
        text: "This architecture is exactly what we need. Send a quote for 20 seats with Net-30 payment terms so we can sign."
    },
    'lead-18': {
        category: 'THIRD_PERSON_QUOTE',
        gear: 3,
        text: "We are ready to move forward. Please send a proposal for 35 seats with Net-30 enterprise terms."
    }
};

export const INITIAL_COHORT_20: CohortProspect[] = [
    {
        id: 'lead-1',
        name: 'Alex Rivera',
        title: 'Head of Operations',
        company: 'CloudScale Technologies',
        email: 'alex.rivera@cloudscale.io',
        avatar: 'AR',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-2',
        name: 'Mark Vance',
        title: 'VP Sales Operations',
        company: 'Apex Fintech',
        email: 'mark.vance@apexfintech.com',
        avatar: 'MV',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-3',
        name: 'Elena Rostova',
        title: 'Chief Revenue Officer',
        company: 'EnterpriseOps Global',
        email: 'elena.rostova@enterprise-ops.com',
        avatar: 'ER',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-4',
        name: 'David Chen',
        title: 'Director of RevOps',
        company: 'SaaSFlow Analytics',
        email: 'david.chen@saasflow.io',
        avatar: 'DC',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-5',
        name: 'Samantha Ray',
        title: 'Head of Sales',
        company: 'FinPulse Systems',
        email: 'samantha.ray@finpulse.com',
        avatar: 'SR',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-6',
        name: 'Jonathan Miller',
        title: 'VP Business Development',
        company: 'Strata Corp',
        email: 'jonathan@stratacorp.net',
        avatar: 'JM',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-7',
        name: 'Claire Beauchamp',
        title: 'Marketing Director',
        company: 'Vanguard Media',
        email: 'claire@vanguardmedia.com',
        avatar: 'CB',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-8',
        name: 'Robert Sterling',
        title: 'Chief Commercial Officer',
        company: 'AeroLink Dynamics',
        email: 'robert@aerolink.io',
        avatar: 'RS',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-9',
        name: 'Priya Patel',
        title: 'Head of Growth',
        company: 'HyperScale AI',
        email: 'priya@hyperscale.ai',
        avatar: 'PP',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-10',
        name: 'Michael Scott',
        title: 'Regional Director',
        company: 'Apex Logistics',
        email: 'michael@apexlogistics.com',
        avatar: 'MS',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-11',
        name: 'Rachel Vance',
        title: 'VP of Growth',
        company: 'ScaleLogic Inc',
        email: 'rachel@scalelogic.io',
        avatar: 'RV',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-12',
        name: 'Daniel Brooks',
        title: 'Director of Revenue',
        company: 'OmniStack Solutions',
        email: 'daniel@omnistack.io',
        avatar: 'DB',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-13',
        name: 'Jessica Miller',
        title: 'VP Marketing',
        company: 'DataPulse Corp',
        email: 'jessica@datapulse.io',
        avatar: 'JM',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-14',
        name: 'Carlos Mendez',
        title: 'Chief Operations Officer',
        company: 'NextGen Logistics',
        email: 'carlos@nextgenlogistics.com',
        avatar: 'CM',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-15',
        name: 'Nina Kowalski',
        title: 'Director of Strategy',
        company: 'FinTech Alliance',
        email: 'nina@fintechalliance.org',
        avatar: 'NK',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-16',
        name: 'Brian Cooper',
        title: 'Head of Engineering',
        company: 'CloudCore Systems',
        email: 'brian@cloudcore.io',
        avatar: 'BC',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-17',
        name: 'Natalie Ward',
        title: 'VP Customer Success',
        company: 'SaaSMetrics HQ',
        email: 'natalie@saasmetrics.com',
        avatar: 'NW',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-18',
        name: 'Ethan Hunt',
        title: 'Director of Infrastructure',
        company: 'Mission Tech Ops',
        email: 'ethan@missionops.net',
        avatar: 'EH',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-19',
        name: 'Zoe Saldana',
        title: 'Chief People Officer',
        company: 'Global Talent AI',
        email: 'zoe@globaltalent.ai',
        avatar: 'ZS',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    },
    {
        id: 'lead-20',
        name: 'Thomas Sterling',
        title: 'VP Procurement',
        company: 'Prime Enterprise Group',
        email: 'thomas@primeenterprise.com',
        avatar: 'TS',
        selected: true,
        status: 'draft',
        outboundSubject: '',
        outboundBody: ''
    }
];

let cohort: CohortProspect[] = JSON.parse(JSON.stringify(INITIAL_COHORT_20));

export const batchManager = {
    getCohort(): CohortProspect[] {
        return cohort;
    },

    getProspect(id: string): CohortProspect | undefined {
        return cohort.find(p => p.id === id);
    },

    toggleSelection(id: string, selected: boolean) {
        const p = cohort.find(item => item.id === id);
        if (p) p.selected = selected;
        return cohort;
    },

    selectAll(selected: boolean) {
        cohort.forEach(p => p.selected = selected);
        return cohort;
    },

    sendSelected(ids?: string[], customTemplate?: { subject?: string; body?: string }) {
        const targetIds = ids && ids.length > 0 ? ids : cohort.filter(p => p.selected).map(p => p.id);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const defaultSubject = 'Streamlining outbound pipeline infrastructure at {{Company}}';
        const defaultBody = 'Hi {{First_Name}}, noticed {{Company}} is scaling engineering headcount. Teams typically struggle with siloed SDR tools and manual data lookups. Are you looking to streamline outbound revops this quarter?';

        const rawSubject = customTemplate?.subject || defaultSubject;
        const rawBody = customTemplate?.body || defaultBody;

        cohort.forEach(p => {
            if (targetIds.includes(p.id)) {
                p.status = 'delivered';
                p.outboundSentAt = `Today at ${now}`;
                const firstName = p.name.split(' ')[0];
                p.outboundSubject = rawSubject
                    .replace(/\{\{Company\}\}/g, p.company)
                    .replace(/\{\{First_Name\}\}/g, firstName)
                    .replace(/\{\{Title\}\}/g, p.title);
                p.outboundBody = rawBody
                    .replace(/\{\{Company\}\}/g, p.company)
                    .replace(/\{\{First_Name\}\}/g, firstName)
                    .replace(/\{\{Title\}\}/g, p.title);
            }
        });
        return cohort;
    },

    receiveReplies() {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        cohort.forEach((p, idx) => {
            if (p.status === 'delivered') {
                const scenario = PROSPECT_REPLY_SCENARIOS[p.id] || {
                    category: (idx % 3 === 0 ? 'WRONG_PERSON' : idx % 3 === 1 ? 'PRICE_OBJECTION' : 'THIRD_PERSON_QUOTE') as any,
                    gear: (((idx % 3) + 1) as (1 | 2 | 3)),
                    text: idx % 3 === 0
                        ? `I don't handle tooling decisions here. Please reach out to Sarah Jenkins, our VP of Engineering (sarah.jenkins@${p.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.io).`
                        : idx % 3 === 1
                        ? `We currently use ZoomInfo and your platform seems pricey for our quarterly budget.`
                        : `We are ready to move forward. Please send a quote for 25 seats with Net-30 payment terms.`
                };
                p.status = 'replied';
                p.replyCategory = scenario.category;
                p.replyGear = scenario.gear;
                p.replyText = scenario.text;
                p.replyReceivedAt = `Today at ${now}`;
            }
        });
        return cohort;
    },

    copilotMode: false,

    setCopilotMode(enabled: boolean) {
        this.copilotMode = enabled;
        return this.copilotMode;
    },

    getCopilotMode() {
        return this.copilotMode;
    },

    findProspectByEmail(email: string): CohortProspect | undefined {
        const clean = email.toLowerCase().trim();
        return cohort.find(p => p.email.toLowerCase() === clean);
    },

    simulateReplyForLead(id: string, customText?: string) {
        const p = cohort.find(item => item.id === id);
        if (p) {
            p.status = 'replied';
            p.replyReceivedAt = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            const scenario = PROSPECT_REPLY_SCENARIOS[id];
            if (scenario) {
                p.replyCategory = scenario.category;
                p.replyGear = scenario.gear;
                p.replyText = customText || scenario.text;
            } else {
                p.replyText = customText || 'Interested in learning more. Please send details.';
            }
        }
        return p;
    },

    approveDraft(id: string, editedBody?: string) {
        const p = cohort.find(item => item.id === id);
        if (p && p.agentResolution) {
            p.status = 'automated';
            p.approvalStatus = 'approved';
            if (editedBody && p.agentResolution.generatedEmail) {
                p.agentResolution.generatedEmail.body = editedBody;
            }
        }
        return p;
    },

    updateResolution(id: string, resolution: AgentResolution, asDraftOnly = false) {
        const p = cohort.find(item => item.id === id);
        if (p) {
            p.agentResolution = resolution;
            if (asDraftOnly || this.copilotMode) {
                p.approvalStatus = 'pending_approval';
            } else {
                p.status = 'automated';
                p.approvalStatus = 'approved';
            }
        }
        return p;
    },

    resetCohort(): CohortProspect[] {
        cohort = JSON.parse(JSON.stringify(INITIAL_COHORT_20));
        return cohort;
    }
};
