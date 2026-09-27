import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * SYSTEM PROMPT — Controls the AI agent's personality, tone and rules for every email it writes.
 * Edit this to change how the agent communicates with customers.
 */
const SYSTEM_PROMPT = `
You are an elite autonomous B2B sales agent representing Graph8 — an AI-powered revenue infrastructure platform.

Your job is to write highly personalized, professional reply emails to enterprise prospects.

STRICT RULES:
- Always address the recipient by their first name
- Be confident, concise, and commercially sharp — never fluff or filler
- Do NOT use emojis
- Do NOT use bullet points unless specifically listing product features
- Keep emails under 180 words
- Always end with a single clear CTA (call-to-action)
- Sign off EXACTLY as: "Israr Khan | Graph8 Revenue Intelligence"
- Write like a senior enterprise Account Executive, not a chatbot
- Tone: Professional, warm, direct — never robotic or salesy

CONTEXT ABOUT GRAPH8:
- Graph8 is an autonomous revenue engine that combines: 300M+ contact enrichment DB, AI-driven inbound reply handling, and instant CPQ (Configure-Price-Quote) generation
- It replaces Apollo, ZoomInfo, and Outreach combined
- Proven 300% pipeline ROI within 60 days
- Enterprise clients get dedicated onboarding and 99.9% SLA
`;

export interface AIEmailInput {
    gear: 'REFERRAL' | 'OBJECTION' | 'BUYING_SIGNAL';
    prospectName: string;
    prospectEmail: string;
    prospectCompany: string;
    inboundText: string;       // The customer's actual reply we received
    outboundBody?: string;     // Our original email that triggered the reply
    // Gear-specific context
    referredName?: string;
    referredTitle?: string;
    competitor?: string;
    seats?: number;
    terms?: string;
    quoteUrl?: string;
}

export interface AIEmailOutput {
    subject: string;
    body: string;
}

/**
 * Uses Gemini to write a fully personalized reply email for each gear.
 * Falls back to a templated email if the API call fails.
 */
export async function writeEmailWithAI(input: AIEmailInput): Promise<AIEmailOutput> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        });

        let userPrompt = '';

        if (input.gear === 'REFERRAL') {
            userPrompt = `
Write a warm introduction email to a NEW contact who was referred to us by an existing prospect.

Context:
- Referring person: ${input.prospectName} at ${input.prospectCompany}
- New contact to email: ${input.referredName || 'the referred contact'} (${input.referredTitle || 'Decision Maker'})
- Their company: ${input.prospectCompany}
- Original prospect replied: "${input.inboundText}"

Write a subject line and email body. The email should reference the referral naturally, introduce Graph8 briefly, and ask for a 10-minute call.

Format your response as:
SUBJECT: <subject line>
BODY:
<email body>
`;
        } else if (input.gear === 'OBJECTION') {
            userPrompt = `
Write a counter-offer reply email to a prospect who raised an objection.

Context:
- Prospect: ${input.prospectName} at ${input.prospectCompany}
- Their objection/reply: "${input.inboundText}"
- Competitor mentioned: ${input.competitor || 'their current tools'}

Your job: Professionally overcome their objection. Highlight Graph8's 300% ROI guarantee, tool consolidation (replacing Apollo + Outreach + CPQ tools), and 60-day results. Offer a 10-minute side-by-side comparison call.

Format your response as:
SUBJECT: <subject line>
BODY:
<email body>
`;
        } else {
            // BUYING_SIGNAL
            userPrompt = `
Write an official proposal/quote email to a prospect who expressed buying intent.

Context:
- Prospect: ${input.prospectName} at ${input.prospectCompany}
- Their request: "${input.inboundText}"
- Seats requested: ${input.seats || 25}
- Payment terms: ${input.terms || 'Net-30'}
- Monthly value: $${((input.seats || 25) * 49).toLocaleString()}/mo
- Quote & e-sign link: ${input.quoteUrl || 'https://app.graph8.com/quotes/pending'}

Write an exciting but professional email confirming the proposal, summarizing what they get, and directing them to sign. The CTA should be to click the e-sign link.

Format your response as:
SUBJECT: <subject line>
BODY:
<email body>
`;
        }

        const result = await model.generateContent(userPrompt);
        const raw = result.response.text().trim();

        // Parse SUBJECT and BODY from the response
        const subjectMatch = raw.match(/SUBJECT:\s*(.+)/i);
        const bodyMatch = raw.match(/BODY:\s*([\s\S]+)/i);

        const subject = subjectMatch ? subjectMatch[1].trim() : buildFallbackSubject(input);
        const body = bodyMatch ? bodyMatch[1].trim() : raw;

        return { subject, body };

    } catch (err) {
        console.error('[AI Writer] Gemini call failed, using fallback:', err);
        return buildFallback(input);
    }
}

// -----------------------------------------------------------------------
// Fallback templates if Gemini API is unavailable
// -----------------------------------------------------------------------
function buildFallbackSubject(input: AIEmailInput): string {
    if (input.gear === 'REFERRAL') return `${input.prospectName} suggested we connect — Graph8 for ${input.prospectCompany}`;
    if (input.gear === 'OBJECTION') return `Re: ROI vs ${input.competitor || 'Current Stack'} — ${input.prospectCompany}`;
    return `Official Graph8 Proposal: ${input.seats || 25} Seats for ${input.prospectCompany} (${input.terms || 'Net-30'})`;
}

function buildFallback(input: AIEmailInput): AIEmailOutput {
    const subject = buildFallbackSubject(input);
    let body = '';

    if (input.gear === 'REFERRAL') {
        body = `Hi ${input.referredName?.split(' ')[0] || 'there'},\n\n${input.prospectName} at ${input.prospectCompany} suggested I reach out to you directly.\n\nGraph8 is an autonomous revenue engine that replaces your current enrichment, sequencing, and CPQ stack with a single AI layer — delivering a 300% pipeline ROI within 60 days.\n\nWould you have 10 minutes this week for a quick architectural walkthrough?\n\nIsrar Khan | Graph8 Revenue Intelligence`;
    } else if (input.gear === 'OBJECTION') {
        body = `Hi ${input.prospectName.split(' ')[0]},\n\nI completely understand — and that's exactly why teams are moving from ${input.competitor || 'legacy tools'} to Graph8.\n\nInstead of three separate subscriptions, Graph8 consolidates everything into one autonomous engine, cutting costs by 38% and guaranteeing 300% verified pipeline ROI in 60 days.\n\nOpen to a 10-minute side-by-side comparison this week?\n\nIsrar Khan | Graph8 Revenue Intelligence`;
    } else {
        body = `Hi ${input.prospectName.split(' ')[0]},\n\nExcited to partner with ${input.prospectCompany}! Your official proposal for ${input.seats || 25} seats at $${(input.seats || 25) * 49}/mo (${input.terms || 'Net-30'}) is ready.\n\nReview and e-sign here:\n${input.quoteUrl || 'https://app.graph8.com/quotes/pending'}\n\nSeats provision automatically within 60 seconds of signing.\n\nIsrar Khan | Graph8 Revenue Intelligence`;
    }

    return { subject, body };
}
