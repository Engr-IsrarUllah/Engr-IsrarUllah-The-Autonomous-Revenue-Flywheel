import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { classifyReply } from './classifier';
import { graph8Client, G8_CONFIG } from './graph8-client';
import { batchManager } from './batch';
import { writeEmailWithAI } from './ai-writer';

/**
 * LangGraph State Definition for the 3-Gear Revenue Flywheel
 */
export const FlywheelAnnotation = Annotation.Root({
    // Inbound Inputs
    prospectId: Annotation<string | undefined>(),
    text: Annotation<string>(),
    sender: Annotation<string>(),
    senderName: Annotation<string | undefined>(),
    company: Annotation<string>(),
    subject: Annotation<string>(),
    mode: Annotation<'sandbox' | 'live'>(),
    startTime: Annotation<number>(),

    // Classification & Reasoning State
    gear: Annotation<'REFERRAL' | 'OBJECTION' | 'BUYING_SIGNAL'>(),
    gearNumber: Annotation<1 | 2 | 3>(),
    confidence: Annotation<number>(),
    reasoning: Annotation<string>(),
    entities: Annotation<Record<string, any>>(),

    // LangGraph Node Telemetry
    currentNode: Annotation<string>(),
    mcpTool: Annotation<string>(),
    executionResult: Annotation<any>(),

    // Newly Generated Email by the Agent
    generatedEmail: Annotation<{
        to: string;
        toName: string;
        subject: string;
        body: string;
        emailType: 'Warm Referral Outreach' | '300% ROI Counter-Offer' | 'Enterprise Quote & E-Sign Proposal';
        sentAt: string;
    } | undefined>(),

    // 4-Stage Visual Storyline State
    stage1Outbound: Annotation<any>(),
    stage2Inbound: Annotation<any>(),
    stage3Processing: Annotation<any>(),
    stage4Resolution: Annotation<any>(),

    // Performance
    durationMs: Annotation<number>()
});

export type FlywheelGraphState = typeof FlywheelAnnotation.State;

// Event callback hook for real-time SSE propagation
export type GraphNodeCallback = (nodeName: string, state: Partial<FlywheelGraphState>) => void;

/**
 * Builds and compiles the LangGraph StateGraph
 */
export function createFlywheelGraph(onNodeStep?: GraphNodeCallback) {
    const graph = new StateGraph(FlywheelAnnotation)
        // -----------------------------------------------------------------
        // NODE 1: Ingest & Context Loader
        // -----------------------------------------------------------------
        .addNode('ingest_reply', async (state) => {
            onNodeStep?.('ingest_reply', {
                currentNode: 'ingest_reply',
                prospectId: state.prospectId,
                text: state.text,
                sender: state.sender
            });

            // Find prospect from batchManager if prospectId provided
            const prospect = state.prospectId ? batchManager.getProspect(state.prospectId) : undefined;
            const senderName = state.senderName || prospect?.name || 'Prospect';
            const company = state.company || prospect?.company || 'Enterprise Corp';

            const stage1Outbound = {
                subject: prospect?.outboundSubject || state.subject || 'Exploring autonomous revenue infrastructure',
                sender: 'Israr Khan <israr@graph8.io>',
                recipient: `${senderName} <${state.sender}>`,
                sentAt: prospect?.outboundSentAt || 'Yesterday at 03:00 PM',
                body: prospect?.outboundBody || 'Hi there, reaching out to see if your team is exploring automated inbound response routing and closed-loop CPQ operations this quarter.'
            };

            const stage2Inbound = {
                sender: state.sender,
                senderName,
                company,
                subject: `Re: ${stage1Outbound.subject}`,
                text: state.text,
                receivedAt: prospect?.replyReceivedAt || 'Just now'
            };

            return {
                currentNode: 'ingest_reply',
                senderName,
                company,
                stage1Outbound,
                stage2Inbound
            };
        })

        // -----------------------------------------------------------------
        // NODE 2: Intent Classification & Entity Extraction (Brain)
        // -----------------------------------------------------------------
        .addNode('classify_intent', async (state) => {
            onNodeStep?.('classify_intent', {
                currentNode: 'classify_intent',
                prospectId: state.prospectId,
                text: state.text
            });

            const classification = classifyReply(state.text, state.sender, state.company);
            const gearNumber = classification.gear === 'REFERRAL' ? 1 : classification.gear === 'OBJECTION' ? 2 : 3;
            const gearName = gearNumber === 1 ? 'Referral Hunter (300M+ DB)' : gearNumber === 2 ? 'Sequence Step Mutator' : 'Instant CPQ Quote Engine';
            const mcpTool = gearNumber === 1 ? 'g8_find_contacts' : gearNumber === 2 ? 'g8_gtm_update_campaign_step' : 'g8_create_quote';

            const stage3Processing = {
                gearNumber,
                gearName,
                aiConfidence: `${(classification.confidence * 100).toFixed(0)}%`,
                mcpTool,
                statusText: `[LangGraph] Route: Gear ${gearNumber} Approved (${state.mode.toUpperCase()})`
            };

            return {
                currentNode: 'classify_intent',
                gear: classification.gear,
                gearNumber,
                confidence: classification.confidence,
                reasoning: classification.reasoning,
                entities: classification.entities,
                mcpTool,
                stage3Processing
            };
        })

        // -----------------------------------------------------------------
        // NODE 3: Gear 1 - Referral Hunter & Auto-Enrollment (Graph8 Tools)
        // -----------------------------------------------------------------
        .addNode('gear_1_referral_hunter', async (state) => {
            onNodeStep?.('gear_1_referral_hunter', {
                currentNode: 'gear_1_referral_hunter',
                prospectId: state.prospectId,
                gear: 'REFERRAL',
                gearNumber: 1
            });

            const referredName = state.entities?.name || 'Sarah Jenkins';
            const referredTitle = state.entities?.title || 'VP Engineering';
            const cleanDomain = state.company.toLowerCase().replace(/[^a-z0-9]/g, '');
            const targetEmail = state.entities?.email || `${referredName.toLowerCase().replace(/\s+/g, '.')}@${cleanDomain}.io`;

            let executionResult: any;

            if (state.mode === 'sandbox') {
                await new Promise(r => setTimeout(r, 440));
                executionResult = {
                    mode: 'sandbox',
                    searched: { query: referredName, status: 200, raw: { total_found: 1 } },
                    contact: { id: 253, name: referredName, email: targetEmail, title: referredTitle, company: state.company },
                    enrolledSequenceId: G8_CONFIG.sequenceId,
                    enrollStatus: 201,
                    latencyMs: 440
                };
            } else {
                executionResult = await graph8Client.findAndEnrollContact({
                    name: referredName,
                    title: referredTitle,
                    company: state.company
                });
            }

            // Agent uses Gemini AI to write a personalized warm outreach email
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const aiEmail = await writeEmailWithAI({
                gear: 'REFERRAL',
                prospectName: state.senderName || 'Prospect',
                prospectEmail: state.sender,
                prospectCompany: state.company,
                inboundText: state.text,
                referredName,
                referredTitle
            });
            const generatedEmail = {
                to: executionResult.contact?.email || targetEmail,
                toName: referredName,
                subject: aiEmail.subject,
                body: aiEmail.body,
                emailType: 'Warm Referral Outreach' as const,
                sentAt: `Today at ${nowTime}`
            };

            const stage4Resolution = {
                headline: `Warm Referral Sequence Queued for ${referredName}`,
                details: `Queried Graph8 300M+ DB via LangGraph, provisioned contact ${generatedEmail.to}, and enqueued into active sequence cohort.`,
                previewSubject: generatedEmail.subject,
                previewBody: generatedEmail.body,
                contactEmail: generatedEmail.to,
                sequenceId: executionResult.enrolledSequenceId
            };

            return {
                currentNode: 'gear_1_referral_hunter',
                executionResult,
                generatedEmail,
                stage4Resolution
            };
        })

        // -----------------------------------------------------------------
        // NODE 4: Gear 2 - Objection & Step Mutator (Graph8 Tools)
        // -----------------------------------------------------------------
        .addNode('gear_2_objection_mutator', async (state) => {
            onNodeStep?.('gear_2_objection_mutator', {
                currentNode: 'gear_2_objection_mutator',
                prospectId: state.prospectId,
                gear: 'OBJECTION',
                gearNumber: 2
            });

            const competitor = state.entities?.competitor || 'Apollo & Outreach';
            const dynamicRebuttal = `We understand budget is top of mind. Rather than paying separate subscriptions for data enrichment, sequencing, and CPQ, Graph8 consolidates all 3 tools into a single autonomous engine—reducing spend by 38% and guaranteeing a 300% verified pipeline ROI within 60 days. Attached is our migration case study.`;
            
            let executionResult: any;

            if (state.mode === 'sandbox') {
                await new Promise(r => setTimeout(r, 420));
                executionResult = {
                    mode: 'sandbox',
                    sequenceId: G8_CONFIG.sequenceId,
                    stepId: G8_CONFIG.stepId,
                    updatedStep: { subject: `Re: Budget & ROI vs ${competitor}`, body: dynamicRebuttal },
                    status: 200,
                    latencyMs: 418
                };
            } else {
                executionResult = await graph8Client.mutateSequenceStep({
                    competitor,
                    rebuttalCopy: dynamicRebuttal
                });
            }

            // Agent uses Gemini AI to write a personalized counter-offer email
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const aiEmail = await writeEmailWithAI({
                gear: 'OBJECTION',
                prospectName: state.senderName || 'Prospect',
                prospectEmail: state.sender,
                prospectCompany: state.company,
                inboundText: state.text,
                competitor
            });
            const generatedEmail = {
                to: state.sender,
                toName: state.senderName || 'there',
                subject: aiEmail.subject,
                body: aiEmail.body,
                emailType: '300% ROI Counter-Offer' as const,
                sentAt: `Today at ${nowTime}`
            };

            const stage4Resolution = {
                headline: `In-Flight Sequence Step Mutated Across Active Cohort`,
                details: `LangGraph live-patched Step #${executionResult.stepId} in Graph8. Injected a 300% ROI guarantee and ${competitor} consolidation pitch.`,
                previewSubject: generatedEmail.subject,
                previewBody: generatedEmail.body,
                stepId: executionResult.stepId,
                sequenceId: executionResult.sequenceId
            };

            return {
                currentNode: 'gear_2_objection_mutator',
                executionResult,
                generatedEmail,
                stage4Resolution
            };
        })

        // -----------------------------------------------------------------
        // NODE 5: Gear 3 - Buying Signal & CPQ Quote Engine (Graph8 Tools)
        // -----------------------------------------------------------------
        .addNode('gear_3_cpq_quote_engine', async (state) => {
            onNodeStep?.('gear_3_cpq_quote_engine', {
                currentNode: 'gear_3_cpq_quote_engine',
                prospectId: state.prospectId,
                gear: 'BUYING_SIGNAL',
                gearNumber: 3
            });

            const seats = state.entities?.seats || 25;
            const terms = state.entities?.terms || 'Net-30';
            let executionResult: any;

            if (state.mode === 'sandbox') {
                await new Promise(r => setTimeout(r, 480));
                const mockQuoteId = `Q-2026-00${Math.floor(Math.random() * 80 + 10)}`;
                executionResult = {
                    mode: 'sandbox',
                    quoteId: mockQuoteId,
                    quoteUrl: `https://app.graph8.com/quotes/${mockQuoteId}`,
                    seats,
                    totalMonthlyUSD: (seats * 49),
                    paymentTerms: terms,
                    status: 201,
                    latencyMs: 465
                };
            } else {
                executionResult = await graph8Client.createQuoteProposal({
                    signerEmail: state.entities?.signerEmail || state.sender,
                    signerName: state.senderName || 'Authorized Buyer',
                    companyName: state.company,
                    seats,
                    terms
                });
            }

            // Agent uses Gemini AI to write a personalized proposal email
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const quoteLink = executionResult.quoteUrl || `https://app.graph8.com/quotes/${executionResult.quoteId}`;
            const aiEmail = await writeEmailWithAI({
                gear: 'BUYING_SIGNAL',
                prospectName: state.senderName || 'Prospect',
                prospectEmail: state.sender,
                prospectCompany: state.company,
                inboundText: state.text,
                seats,
                terms,
                quoteUrl: quoteLink
            });
            const generatedEmail = {
                to: state.sender,
                toName: state.senderName || 'there',
                subject: aiEmail.subject,
                body: aiEmail.body,
                emailType: 'Enterprise Quote & E-Sign Proposal' as const,
                sentAt: `Today at ${nowTime}`
            };

            const stage4Resolution = {
                headline: `Proposal Staged: Quote #${executionResult.quoteId} ($${(seats * 49).toLocaleString()}/mo)`,
                details: `Graph8 CPQ engine provisioned an e-signature quote for ${seats} seats with ${terms} payment terms and generated an instant Stripe e-sign checkout URL.`,
                previewSubject: generatedEmail.subject,
                previewBody: generatedEmail.body,
                quoteId: executionResult.quoteId,
                quoteUrl: quoteLink
            };

            return {
                currentNode: 'gear_3_cpq_quote_engine',
                executionResult,
                generatedEmail,
                stage4Resolution
            };
        })

        // -----------------------------------------------------------------
        // NODE 6: Finalize & Telemetry Dispatcher
        // -----------------------------------------------------------------
        .addNode('finalize_outcome', async (state) => {
            const durationMs = Date.now() - (state.startTime || Date.now());
            onNodeStep?.('finalize_outcome', {
                currentNode: 'finalize_outcome',
                prospectId: state.prospectId,
                durationMs
            });

            // Update batchManager if prospectId is present
            if (state.prospectId) {
                batchManager.updateResolution(state.prospectId, {
                    status: 'dispatched',
                    gear: state.gearNumber,
                    gearName: state.gearNumber === 1 ? 'Referral Hunter' : state.gearNumber === 2 ? 'Step Mutator' : 'CPQ Quote Engine',
                    reasoning: state.reasoning,
                    mcpTool: state.mcpTool,
                    generatedEmail: state.generatedEmail,
                    graph8Result: state.executionResult,
                    durationMs,
                    completedAt: new Date().toISOString()
                });
            }

            return {
                currentNode: 'finalize_outcome',
                durationMs
            };
        })

        // -----------------------------------------------------------------
        // GRAPH EDGES & CONDITIONAL ROUTING
        // -----------------------------------------------------------------
        .addEdge(START, 'ingest_reply')
        .addEdge('ingest_reply', 'classify_intent')
        .addConditionalEdges(
            'classify_intent',
            (state) => {
                if (state.gear === 'REFERRAL') return 'gear_1_referral_hunter';
                if (state.gear === 'OBJECTION') return 'gear_2_objection_mutator';
                return 'gear_3_cpq_quote_engine';
            },
            {
                gear_1_referral_hunter: 'gear_1_referral_hunter',
                gear_2_objection_mutator: 'gear_2_objection_mutator',
                gear_3_cpq_quote_engine: 'gear_3_cpq_quote_engine'
            }
        )
        .addEdge('gear_1_referral_hunter', 'finalize_outcome')
        .addEdge('gear_2_objection_mutator', 'finalize_outcome')
        .addEdge('gear_3_cpq_quote_engine', 'finalize_outcome')
        .addEdge('finalize_outcome', END);

    return graph.compile();
}
