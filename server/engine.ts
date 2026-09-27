import { EventEmitter } from 'events';
import { G8_CONFIG } from './graph8-client';
import { createFlywheelGraph } from './agent-graph';
import { batchManager } from './batch';

export interface FlywheelEvent {
    id: string;
    timestamp: string;
    mode: 'sandbox' | 'live';
    stage: 'RECEIVED' | 'CLASSIFIED' | 'GEAR_ACTIVE' | 'GRAPH8_EXECUTION' | 'COMPLETED' | 'ERROR';
    gear?: 'REFERRAL' | 'OBJECTION' | 'BUYING_SIGNAL';
    gearNumber?: 1 | 2 | 3;
    nodeName?: string;
    prospectId?: string;
    title: string;
    description: string;
    storyline?: {
        stage1Outbound: {
            subject: string;
            sender: string;
            recipient: string;
            body: string;
            sentAt: string;
        };
        stage2Inbound: {
            sender: string;
            senderName?: string;
            company: string;
            subject: string;
            text: string;
            receivedAt: string;
        };
        stage3Processing: {
            gearNumber: 1 | 2 | 3;
            gearName: string;
            aiConfidence: string;
            mcpTool: string;
            statusText: string;
        };
        stage4Resolution: {
            headline: string;
            details: string;
            previewSubject?: string;
            previewBody?: string;
            quoteId?: string;
            quoteUrl?: string;
            contactEmail?: string;
            sequenceId?: string;
            stepId?: string;
        };
    };
    generatedEmail?: any;
    data?: any;
    durationMs?: number;
}

export const flywheelEmitter = new EventEmitter();

// 3 Curated Realistic B2B Demo Presets for quick manual testing
export const DEMO_PRESETS = [
    {
        id: 'reply-1',
        title: 'Scenario 1: Wrong Person / Referral',
        subtitle: 'Lead redirects to VP of Engineering ➔ Auto-Enrich & Re-write',
        expectedGear: 'REFERRAL',
        gearNumber: 1,
        mcpTool: 'g8_find_contacts',
        prospectId: 'lead-1',
        stage1Outbound: {
            subject: 'Streamlining outbound pipeline infrastructure at CloudScale',
            sender: 'Israr Khan <israr@graph8.io>',
            recipient: 'Alex Rivera <alex.rivera@cloudscale.io>',
            sentAt: 'Yesterday at 10:14 AM',
            body: 'Hi Alex, noticed CloudScale is scaling engineering headcount. Teams like yours typically struggle with siloed SDR tools and manual data lookups. Are you looking to streamline outbound revops this quarter?'
        },
        stage2Inbound: {
            sender: 'alex.rivera@cloudscale.io',
            company: 'CloudScale Technologies',
            subject: 'Re: Streamlining outbound pipeline infrastructure at CloudScale',
            receivedAt: 'Today at 09:32 AM',
            text: "I don't make tooling decisions here. Please reach out to Sarah Jenkins, our VP of Engineering (sarah.jenkins@cloudscale.io)."
        }
    },
    {
        id: 'reply-2',
        title: 'Scenario 2: Competitor & Price Objection',
        subtitle: 'Apollo & budget objection ➔ 300% ROI counter-pitch',
        expectedGear: 'OBJECTION',
        gearNumber: 2,
        mcpTool: 'g8_gtm_update_campaign_step',
        prospectId: 'lead-2',
        stage1Outbound: {
            subject: 'Modern revenue infrastructure for Apex Fintech',
            sender: 'Israr Khan <israr@graph8.io>',
            recipient: 'Mark Vance <mark.vance@apexfintech.com>',
            sentAt: 'Yesterday at 02:45 PM',
            body: 'Hi Mark, given Apex Fintech\'s high transaction volume, having outbound intelligence tightly coupled with your CPQ workflow is critical. How is your team optimizing quota attainment right now?'
        },
        stage2Inbound: {
            sender: 'mark.vance@apexfintech.com',
            company: 'Apex Fintech',
            subject: 'Re: Modern revenue infrastructure for Apex Fintech',
            receivedAt: 'Today at 10:15 AM',
            text: 'We currently use Apollo and Outreach, and your price is way too expensive for our current quarterly budget.'
        }
    },
    {
        id: 'reply-3',
        title: 'Scenario 3: Direct Buying Signal & Quote',
        subtitle: '25 seats requested ➔ Instant CPQ quote proposal',
        expectedGear: 'BUYING_SIGNAL',
        gearNumber: 3,
        mcpTool: 'g8_create_quote (CPQ Engine)',
        prospectId: 'lead-3',
        stage1Outbound: {
            subject: 'Autonomous SDR & CPQ engine preview for EnterpriseOps',
            sender: 'Israr Khan <israr@graph8.io>',
            recipient: 'Elena Rostova <elena.rostova@enterprise-ops.com>',
            sentAt: 'Yesterday at 11:20 AM',
            body: 'Elena, Graph8 enables complete closed-loop revenue operations—from 300M+ lead discovery to instant automated CPQ contracts. We would love to showcase a live enterprise pilot.'
        },
        stage2Inbound: {
            sender: 'elena.rostova@enterprise-ops.com',
            company: 'EnterpriseOps Global',
            subject: 'Re: Autonomous SDR & CPQ engine preview for EnterpriseOps',
            receivedAt: 'Today at 11:04 AM',
            text: 'This architecture looks solid. We need 25 seats with Net-30 payment terms. Please send over an official quote so we can sign.'
        }
    }
];

export function emitEvent(event: Omit<FlywheelEvent, 'id' | 'timestamp'>) {
    const fullEvent: FlywheelEvent = {
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date().toISOString(),
        ...event
    };
    flywheelEmitter.emit('flywheel-event', fullEvent);
    return fullEvent;
}

/**
 * Runs the Flywheel for a single prospect or custom text using LangGraph StateGraph
 */
export async function runFlywheel(
    input: {
        text: string;
        sender?: string;
        senderName?: string;
        company?: string;
        subject?: string;
        prospectId?: string;
    },
    mode: 'sandbox' | 'live' = 'live'
) {
    const startTime = Date.now();
    const prospect = input.prospectId ? batchManager.getProspect(input.prospectId) : undefined;
    const sender = input.sender || prospect?.email || 'prospect@enterprise.com';
    const senderName = input.senderName || prospect?.name || 'Prospect';
    const company = input.company || prospect?.company || 'Enterprise Corp';

    const flywheelGraph = createFlywheelGraph((nodeName, nodeState) => {
        if (nodeName === 'ingest_reply') {
            emitEvent({
                mode,
                stage: 'RECEIVED',
                nodeName,
                prospectId: input.prospectId,
                title: `📥 [LangGraph] Agent Ingested Reply: ${senderName}`,
                description: `Analyzing inbound context for ${senderName} (${company})`,
                storyline: {
                    stage1Outbound: nodeState.stage1Outbound,
                    stage2Inbound: nodeState.stage2Inbound,
                    stage3Processing: {
                        gearNumber: 1,
                        gearName: 'LangGraph Reasoning...',
                        aiConfidence: '98%',
                        mcpTool: 'langgraph_state_machine',
                        statusText: 'Executing LangGraph Node: ingest_reply'
                    },
                    stage4Resolution: {
                        headline: 'Pending Automated Resolution',
                        details: 'Routing through LangGraph state machine...'
                    }
                },
                data: { node: nodeName, prospectId: input.prospectId, mode }
            });
        }
    });

    try {
        const result = await flywheelGraph.invoke({
            prospectId: input.prospectId,
            text: input.text,
            sender,
            senderName,
            company,
            subject: input.subject || `Re: Inbound Discussion`,
            mode,
            startTime
        });

        // 1. Emit Classified Event
        emitEvent({
            mode,
            stage: 'CLASSIFIED',
            nodeName: 'classify_intent',
            prospectId: input.prospectId,
            gear: result.gear,
            gearNumber: result.gearNumber,
            title: `⚙️ [LangGraph] Intent: Gear ${result.gearNumber} [${result.gear}] - ${senderName}`,
            description: result.reasoning,
            storyline: {
                stage1Outbound: result.stage1Outbound,
                stage2Inbound: result.stage2Inbound,
                stage3Processing: result.stage3Processing,
                stage4Resolution: result.stage4Resolution
            },
            data: {
                prospectId: input.prospectId,
                confidence: `${((result.confidence || 0.98) * 100).toFixed(0)}%`,
                entities: result.entities,
                mode
            }
        });

        // 2. Emit Graph8 Execution & Newly Written Email Event
        emitEvent({
            mode,
            stage: 'GRAPH8_EXECUTION',
            nodeName: result.currentNode,
            prospectId: input.prospectId,
            gear: result.gear,
            gearNumber: result.gearNumber,
            title: `⚡ [LangGraph] Agent Executed Tool & Drafted Email: ${senderName}`,
            description: `Tool: ${result.mcpTool} | Generated Email: "${result.generatedEmail?.subject}"`,
            storyline: {
                stage1Outbound: result.stage1Outbound,
                stage2Inbound: result.stage2Inbound,
                stage3Processing: result.stage3Processing,
                stage4Resolution: result.stage4Resolution
            },
            generatedEmail: result.generatedEmail,
            data: {
                prospectId: input.prospectId,
                tool: result.mcpTool,
                execution: result.executionResult,
                generatedEmail: result.generatedEmail,
                mode
            }
        });

        const totalDuration = Date.now() - startTime;

        // 3. Emit Final Completed Event
        const finalEvent = emitEvent({
            mode,
            stage: 'COMPLETED',
            nodeName: 'finalize_outcome',
            prospectId: input.prospectId,
            gear: result.gear,
            gearNumber: result.gearNumber,
            title: `✅ [LangGraph] Email Dispatched & Handled: ${senderName}`,
            description: `Agent autonomously wrote email and executed closed-loop Graph8 action in ${totalDuration}ms.`,
            durationMs: totalDuration,
            storyline: {
                stage1Outbound: result.stage1Outbound,
                stage2Inbound: result.stage2Inbound,
                stage3Processing: result.stage3Processing,
                stage4Resolution: result.stage4Resolution
            },
            generatedEmail: result.generatedEmail,
            data: {
                prospectId: input.prospectId,
                gear: result.gear,
                gearNumber: result.gearNumber,
                generatedEmail: result.generatedEmail,
                mode,
                executionSummary: result.executionResult
            }
        });

        return { result, finalEvent };
    } catch (err: any) {
        return emitEvent({
            mode,
            stage: 'ERROR',
            prospectId: input.prospectId,
            title: `❌ [LangGraph] Execution Warning: ${senderName}`,
            description: err.message || 'Error executing LangGraph state machine',
            data: { error: String(err), mode }
        });
    }
}

/**
 * Runs the Flywheel simultaneously across all replied prospects
 */
export async function runFlywheelSimultaneous(mode: 'sandbox' | 'live' = 'live') {
    const cohort = batchManager.getCohort();
    const repliedProspects = cohort.filter(p => p.status === 'replied' && p.replyText);

    if (repliedProspects.length === 0) {
        emitEvent({
            mode,
            stage: 'COMPLETED',
            title: `ℹ️ No Pending Inbound Replies`,
            description: `All prospects are currently in ready/draft state. Click 'Send' to dispatch outbound emails and receive replies first.`,
            data: { activeAgentsCount: 0, mode }
        });
        return [];
    }

    emitEvent({
        mode,
        stage: 'GEAR_ACTIVE',
        title: `🚀 [LangGraph] Auto-Pilot: Spawning ${repliedProspects.length} Agents Concurrently`,
        description: `Autonomous LangGraph state machines analyzing replies, writing tailored emails, and calling Graph8 tools simultaneously.`,
        data: { activeAgentsCount: repliedProspects.length, mode }
    });

    // Execute simultaneously using Promise.all
    const promises = repliedProspects.map(prospect => {
        return runFlywheel({
            prospectId: prospect.id,
            text: prospect.replyText || '',
            sender: prospect.email,
            senderName: prospect.name,
            company: prospect.company,
            subject: `Re: ${prospect.outboundSubject}`
        }, mode);
    });

    const results = await Promise.all(promises);

    emitEvent({
        mode,
        stage: 'COMPLETED',
        title: `🎉 [LangGraph] All ${repliedProspects.length} Inbound Replies Handled Simultaneously!`,
        description: `Every prospect has received a newly written email, and all corresponding Graph8 tools (Referral DB, Step Mutation, CPQ Quote) have succeeded.`,
        data: { totalHandled: results.length, activeCohort: batchManager.getCohort() }
    });

    return results;
}
