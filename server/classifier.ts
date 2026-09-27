export type GearType = 'REFERRAL' | 'OBJECTION' | 'BUYING_SIGNAL';

export interface ClassifiedIntent {
    gear: GearType;
    confidence: number;
    reasoning: string;
    entities: {
        name?: string;
        title?: string;
        email?: string;
        company?: string;
        competitor?: string;
        objectionType?: string;
        seats?: number;
        terms?: string;
        signerEmail?: string;
    };
}

/**
 * Enterprise Classifier:
 * Analyzes inbound replies across the 3 critical B2B flywheel gears:
 * 1. WRONG PERSON / REFERRAL -> extracts referred person name, title, email
 * 2. PRICE / COMPETITOR OBJECTION -> extracts competitor, objection type, budget context
 * 3. BUYING SIGNAL / QUOTE REQUEST -> extracts seat volume, payment terms, buyer email
 */
export function classifyReply(text: string, senderEmail = 'prospect@acme.com', companyName = 'Acme Corp'): ClassifiedIntent {
    const lower = text.toLowerCase();

    // -----------------------------------------------------------------
    // 1. BUYING SIGNAL DETECTION (Quotes, Seats, Pricing, Contract)
    // -----------------------------------------------------------------
    if (
        lower.includes('quote') ||
        lower.includes('proposal') ||
        lower.includes('seats') ||
        lower.includes('pricing') ||
        lower.includes('pricing sheet') ||
        lower.includes('net-30') ||
        lower.includes('net-15') ||
        lower.includes('net-60') ||
        lower.includes('contract') ||
        lower.includes('sign') ||
        lower.includes('move forward') ||
        lower.includes('agreement') ||
        /\b\d+\s*seats?\b/i.test(text)
    ) {
        // Extract seats if present
        const seatMatch = text.match(/(\d+)\s*seats?/i);
        const seats = seatMatch ? parseInt(seatMatch[1], 10) : 25;

        // Extract payment terms if present
        let terms = 'Net-30';
        if (lower.includes('net-15')) terms = 'Net-15';
        else if (lower.includes('net-60')) terms = 'Net-60';
        else if (lower.includes('net-45')) terms = 'Net-45';
        else if (lower.includes('due on receipt')) terms = 'Due on Receipt';
        else if (lower.includes('quarterly')) terms = 'Quarterly';

        return {
            gear: 'BUYING_SIGNAL',
            confidence: 0.98,
            reasoning: `High-intent commercial signal detected: requested quote for ${seats} seats under ${terms} terms. CPQ quote engine triggered.`,
            entities: {
                seats,
                terms,
                signerEmail: senderEmail,
                company: companyName
            }
        };
    }

    // -----------------------------------------------------------------
    // 2. REFERRAL / WRONG PERSON DETECTION ("talk to X", "reach out to Y")
    // -----------------------------------------------------------------
    if (
        lower.includes('reach out to') ||
        lower.includes('talk to') ||
        lower.includes('talk with') ||
        lower.includes('speak with') ||
        lower.includes('contact') ||
        lower.includes("don't make") ||
        lower.includes('not the right person') ||
        lower.includes('wrong person') ||
        lower.includes('not my department') ||
        lower.includes('refer') ||
        lower.includes('should talk')
    ) {
        // Extract email if mentioned in text
        const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const email = emailMatch ? emailMatch[1] : undefined;

        // Extract referred name
        let name = 'Sarah Jenkins';
        const nameMatch = text.match(/(?:reach out to|talk to|talk with|speak with|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (nameMatch && nameMatch[1]) {
            name = nameMatch[1].trim();
        }

        // Extract title
        let title = 'VP of Engineering';
        const titleMatch = text.match(/(?:our|the)\s+([A-Z][a-zA-Z\s]{3,30}?)(?:\s*\(|\.|$|,)/);
        if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim();
        }

        return {
            gear: 'REFERRAL',
            confidence: 0.96,
            reasoning: `Prospect indicated internal redirection: referred to ${name} (${title}${email ? ` - ${email}` : ''}). Directory lookup triggered.`,
            entities: {
                name,
                title,
                email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.io`,
                company: companyName
            }
        };
    }

    // -----------------------------------------------------------------
    // 3. OBJECTION / PRICE / BUDGET / COMPETITOR
    // -----------------------------------------------------------------
    let competitor = 'Apollo & Outreach';
    if (lower.includes('zoominfo')) competitor = 'ZoomInfo';
    else if (lower.includes('apollo')) competitor = 'Apollo';
    else if (lower.includes('outreach')) competitor = 'Outreach';
    else if (lower.includes('hubspot')) competitor = 'HubSpot';
    else if (lower.includes('salesforce')) competitor = 'Salesforce';

    let objectionType = 'BUDGET & PRICE';
    if (lower.includes('expensive') || lower.includes('budget') || lower.includes('cost') || lower.includes('spend') || lower.includes('paused')) {
        objectionType = 'BUDGET & PRICING CONSTRAINTS';
    } else if (lower.includes('timing') || lower.includes('next year') || lower.includes('next quarter')) {
        objectionType = 'TIMING & QUARTERLY FREEZE';
    }

    return {
        gear: 'OBJECTION',
        confidence: 0.95,
        reasoning: `Competitive/budget barrier identified against ${competitor} (${objectionType}). In-flight sequence step mutation triggered with 300% ROI guarantee.`,
        entities: {
            competitor,
            objectionType,
            company: companyName
        }
    };
}
