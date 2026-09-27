import { g8 } from '@graph8/sdk';

export const G8_CONFIG = {
    apiKey: process.env.G8_API_KEY || 'g8_live_7389278de41e98adea5c3e5d27b651e21f41b22eaa5ca66c8bdab1acf219eb717701d623b59c556fa3f6429dacf59798',
    baseUrl: process.env.G8_BASE_URL || 'https://be.graph8.com/api/v1',
    userEmail: process.env.G8_USER_EMAIL || 'engrisrar256@gmail.com',
    sequenceId: process.env.G8_SEQUENCE_ID || '81257cc3-e7fb-4274-a1d5-786f48cd713e',
    stepId: process.env.G8_STEP_ID || '32fe95ad-a791-4fce-9d40-145d0f98bd40'
};

// Initialize SDK
g8.init({
    apiKey: G8_CONFIG.apiKey
});

/**
 * Common fetch helper ensuring authentication and user_email query param
 */
async function graph8Request(endpoint: string, options: RequestInit = {}) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${G8_CONFIG.baseUrl}${endpoint}${separator}user_email=${encodeURIComponent(G8_CONFIG.userEmail)}`;
    
    const headers: Record<string, string> = {
        'Authorization': `Bearer ${G8_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
    };

    const startTime = Date.now();
    const res = await fetch(url, { ...options, headers });
    const latency = Date.now() - startTime;
    const data = await res.json().catch(() => null);

    return {
        ok: res.ok,
        status: res.status,
        data,
        latency
    };
}

export const graph8Client = {
    config: G8_CONFIG,

    // ==========================================
    // GEAR 1: REFERRAL & CONTACT ENROLLMENT
    // ==========================================
    async findAndEnrollContact(params: {
        name: string;
        title?: string;
        company?: string;
        sequenceId?: string;
    }) {
        const seqId = params.sequenceId || G8_CONFIG.sequenceId;
        const [firstName, ...lastNames] = params.name.split(' ');
        const lastName = lastNames.join(' ') || 'Prospect';

        // 1. Search Open Data Directory
        const searchFilters: any[] = [
            { field: 'job_title', operator: 'contains', value: [params.title || 'Engineering'] }
        ];
        if (params.company) {
            searchFilters.push({ field: 'company_name', operator: 'contains', value: [params.company] });
        }

        const searchRes = await graph8Request('/search/contacts', {
            method: 'POST',
            body: JSON.stringify({
                filters: searchFilters,
                limit: 3
            })
        });

        const targetEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${params.company ? params.company.toLowerCase().replace(/[^a-z0-9]/g, '') : 'enterprise'}.io`;

        // 2. Create / Register Contact in CRM
        const contactRes = await graph8Request('/contacts', {
            method: 'POST',
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                work_email: targetEmail,
                company_name: params.company || 'Enterprise Partner',
                job_title: params.title || 'Decision Maker'
            })
        });

        const createdContact = contactRes.data?.data || contactRes.data || {};
        const contactId = createdContact.contact_id || createdContact.id || 253;

        // 3. Queue Contact into Sequence
        const enrollRes = await graph8Request(`/sequences/${seqId}/contacts`, {
            method: 'POST',
            body: JSON.stringify({
                contact_ids: [contactId],
                list_id: 1
            })
        });

        return {
            searched: {
                query: params.name,
                filters: searchFilters,
                status: searchRes.status,
                raw: searchRes.data
            },
            contact: {
                id: contactId,
                name: params.name,
                email: targetEmail,
                title: params.title,
                company: params.company
            },
            enrolledSequenceId: seqId,
            enrollStatus: enrollRes.status,
            latencyMs: searchRes.latency + contactRes.latency + enrollRes.latency
        };
    },

    // ==========================================
    // GEAR 2: OBJECTION & SEQUENCE STEP MUTATION
    // ==========================================
    async mutateSequenceStep(params: {
        sequenceId?: string;
        stepId?: string;
        competitor?: string;
        subject?: string;
        rebuttalCopy: string;
    }) {
        const seqId = params.sequenceId || G8_CONFIG.sequenceId;
        const sId = params.stepId || G8_CONFIG.stepId;

        const subject = params.subject || `Re: ROI vs ${params.competitor || 'Legacy Solutions'}`;
        const body = params.rebuttalCopy;

        // PATCH the sequence step in Graph8
        const updateRes = await graph8Request(`/sequences/${seqId}/steps/${sId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                step_data: {
                    subject,
                    body,
                    email_type: 'plain'
                }
            })
        });

        return {
            sequenceId: seqId,
            stepId: sId,
            updatedStep: {
                subject,
                body
            },
            status: updateRes.status,
            raw: updateRes.data,
            latencyMs: updateRes.latency
        };
    },

    // ==========================================
    // GEAR 3: BUYING SIGNAL & CPQ QUOTE DRAFT
    // ==========================================
    async createQuoteProposal(params: {
        signerEmail: string;
        signerName?: string;
        companyName?: string;
        seats: number;
        terms?: string;
        unitPriceCents?: number;
    }) {
        const seats = params.seats || 25;
        const unitAmount = params.unitPriceCents || 4900; // $49/seat/mo
        const totalAmount = (seats * unitAmount) / 100;

        const quotePayload = {
            title: `Enterprise Agreement (${seats} Seats) - ${params.companyName || 'Autonomous Sales'}`,
            signer_email: params.signerEmail,
            signer_name: params.signerName || 'Authorized Signer',
            billing_legal_name: params.companyName || 'Enterprise Partner LLC',
            contract_start_date: new Date().toISOString().split('T')[0],
            contract_months: 12,
            payment_terms: params.terms?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'net_30',
            currency: 'USD',
            tax_amount: 0,
            line_items: [
                {
                    product_name: 'Graph8 Revenue Flywheel Platform Seat',
                    description: 'Full Autonomous SDR + CPQ Engine access',
                    quantity: seats,
                    unit_amount: unitAmount,
                    discount_pct: 0,
                    billing_frequency: 'month',
                    start_month: 1
                }
            ],
            public_notes: `Custom proposal generated automatically via Autopilot CPQ. Payment terms: ${params.terms || 'Net-30'}. Valid for 14 days.`
        };

        const quoteRes = await graph8Request('/quotes', {
            method: 'POST',
            body: JSON.stringify(quotePayload)
        });

        const quoteData = quoteRes.data?.data || quoteRes.data;
        const quoteId = quoteData?.id || `Q-${Math.floor(Math.random() * 8999) + 1000}`;
        const quoteUrl = `https://app.graph8.com/quotes/${quoteId}`;

        return {
            quoteId,
            quoteUrl,
            seats,
            totalMonthlyUSD: totalAmount,
            paymentTerms: params.terms || 'Net-30',
            status: quoteRes.status,
            raw: quoteRes.data,
            latencyMs: quoteRes.latency
        };
    }
};
