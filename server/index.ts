import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { flywheelEmitter, runFlywheel, runFlywheelSimultaneous, DEMO_PRESETS, FlywheelEvent } from './engine';
import { G8_CONFIG } from './graph8-client';
import { batchManager } from './batch';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API-only server — React UI runs separately on port 3000 via Vite

// Keep track of active SSE client connections
const sseClients: Response[] = [];

/**
 * SSE Real-Time Stream Endpoint
 */
app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send connection greeting
    const welcomeEvent: FlywheelEvent = {
        id: `init-${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: 'live',
        stage: 'RECEIVED',
        title: '⚡ Autopilot Flywheel Telemetry Connected',
        description: `Connected to live Graph8 server. Sequence: ${G8_CONFIG.sequenceId.slice(0, 8)}... | Step: ${G8_CONFIG.stepId.slice(0, 8)}...`,
        data: {
            sequenceId: G8_CONFIG.sequenceId,
            stepId: G8_CONFIG.stepId,
            userEmail: G8_CONFIG.userEmail
        }
    };
    res.write(`data: ${JSON.stringify(welcomeEvent)}\n\n`);

    sseClients.push(res);

    req.on('close', () => {
        const index = sseClients.indexOf(res);
        if (index !== -1) {
            sseClients.splice(index, 1);
        }
    });
});

// Broadcast events from flywheelEmitter to all SSE clients
flywheelEmitter.on('flywheel-event', (event: FlywheelEvent) => {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    sseClients.forEach(client => {
        try {
            client.write(payload);
        } catch (e) {
            // connection drop handled by req.on('close')
        }
    });
});

/**
 * Cohort Management Endpoints
 */
app.get('/api/cohort', (req: Request, res: Response) => {
    const cohort = batchManager.getCohort();
    const total = cohort.length;
    const selected = cohort.filter(p => p.selected).length;
    const delivered = cohort.filter(p => p.status === 'delivered').length;
    const replied = cohort.filter(p => p.status === 'replied').length;
    const automated = cohort.filter(p => p.status === 'automated').length;

    res.json({
        cohort,
        metrics: {
            total,
            selected,
            delivered,
            replied,
            automated
        },
        copilotMode: batchManager.getCopilotMode(),
        config: {
            sequenceId: G8_CONFIG.sequenceId,
            stepId: G8_CONFIG.stepId,
            userEmail: G8_CONFIG.userEmail
        }
    });
});

app.post('/api/cohort/select', (req: Request, res: Response) => {
    const { id, selected } = req.body;
    if (!id || typeof selected !== 'boolean') {
        return res.status(400).json({ error: 'id and selected boolean required' });
    }
    const cohort = batchManager.toggleSelection(id, selected);
    res.json({ status: 'ok', cohort });
});

app.post('/api/cohort/select-all', (req: Request, res: Response) => {
    const { selected } = req.body;
    const cohort = batchManager.selectAll(Boolean(selected));
    res.json({ status: 'ok', cohort });
});

/**
 * Step 1: Send outbound campaign to selected prospects
 */
app.post('/api/cohort/send', async (req: Request, res: Response) => {
    const { ids, mode = 'live', customTemplate } = req.body;
    const cohort = batchManager.sendSelected(ids, customTemplate);
    const targetCount = ids && ids.length > 0 ? ids.length : cohort.filter(p => p.selected).length;

    // Broadcast batch launch event
    flywheelEmitter.emit('flywheel-event', {
        id: `batch-${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode,
        stage: 'RECEIVED',
        title: `🚀 Outbound Campaign Sent (${targetCount} Enterprise Prospects)`,
        description: `Batch email sequence dispatched to ${targetCount} selected prospects via Graph8 Sequence #${G8_CONFIG.sequenceId.slice(0, 8)}.`,
        data: { total: targetCount, status: 'delivered', cohort }
    });

    // Simulate inbound customer replies arriving after a short delay
    setTimeout(() => {
        const updatedCohort = batchManager.receiveReplies();
        const repliedCount = updatedCohort.filter(p => p.status === 'replied').length;

        flywheelEmitter.emit('flywheel-event', {
            id: `replies-${Date.now()}`,
            timestamp: new Date().toISOString(),
            mode,
            stage: 'CLASSIFIED',
            title: `📬 ${repliedCount} Inbound Customer Replies Received!`,
            description: `Replies detected: 4 Wrong Person (Referrals), 4 Price Objections (Budget/Apollo), and 4 Buying Signals (Enterprise Quotes).`,
            data: { repliesReceived: repliedCount, activeCohort: updatedCohort }
        });
    }, 1400);

    res.json({
        status: 'dispatched',
        message: `Dispatched outbound sequence to ${targetCount} prospects. Incoming replies arriving shortly.`,
        cohort
    });
});

/**
 * Step 2: Auto-Pilot Resolve ALL replies simultaneously with agents
 */
app.post('/api/cohort/resolve-all', async (req: Request, res: Response) => {
    const { mode = 'live' } = req.body;
    const activeMode = mode === 'sandbox' ? 'sandbox' : 'live';

    // Run async so HTTP returns immediately while SSE streams progress for all agents
    runFlywheelSimultaneous(activeMode).catch(console.error);

    res.json({
        status: 'initiated',
        mode: activeMode,
        message: 'Agents spawned simultaneously across all replied prospects. Streaming telemetry to /api/stream.'
    });
});

/**
 * Resolve a single prospect with AI agent
 */
app.post('/api/cohort/resolve-one', async (req: Request, res: Response) => {
    const { prospectId, mode = 'live' } = req.body;
    const prospect = batchManager.getProspect(prospectId);

    if (!prospect) {
        return res.status(404).json({ error: 'Prospect not found' });
    }

    const activeMode = mode === 'sandbox' ? 'sandbox' : 'live';
    runFlywheel({
        prospectId: prospect.id,
        text: prospect.replyText || '',
        sender: prospect.email,
        senderName: prospect.name,
        company: prospect.company,
        subject: `Re: ${prospect.outboundSubject}`
    }, activeMode).catch(console.error);

    res.json({
        status: 'queued',
        mode: activeMode,
        prospect
    });
});

/**
 * Toggle Autonomous vs Co-Pilot Review Mode
 */
app.post('/api/settings/copilot-mode', (req: Request, res: Response) => {
    const { enabled } = req.body;
    const mode = batchManager.setCopilotMode(Boolean(enabled));
    res.json({ status: 'ok', copilotMode: mode });
});

/**
 * Real-World Inbound Webhook Listener
 * Accepts incoming email events from email services (SendGrid, Mailgun, Postmark, Graph8)
 */
app.post('/api/webhook/email', async (req: Request, res: Response) => {
    const { from, to, subject, text, mode = 'live' } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'text body is required' });
    }

    const senderEmail = from || 'customer@enterprise.com';
    let matchedLead = batchManager.findProspectByEmail(senderEmail);

    if (matchedLead) {
        batchManager.simulateReplyForLead(matchedLead.id, text);
    }

    flywheelEmitter.emit('flywheel-event', {
        id: `webhook-${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode,
        stage: 'RECEIVED',
        title: `📬 Inbound Webhook Received: ${senderEmail}`,
        description: `Subject: "${subject || 'Re: Outbound'}" | Ingested via /api/webhook/email`,
        data: { from: senderEmail, subject, text }
    });

    const activeMode = mode === 'sandbox' ? 'sandbox' : 'live';
    runFlywheel({
        prospectId: matchedLead?.id,
        text,
        sender: senderEmail,
        senderName: matchedLead?.name || 'Inbound Prospect',
        company: matchedLead?.company || 'Enterprise Account',
        subject: subject || 'Re: Outbound Discussion'
    }, activeMode).catch(console.error);

    res.json({
        status: 'received',
        event: 'inbound_webhook_processed',
        prospectId: matchedLead?.id,
        action: 'agent_triggered'
    });
});

/**
 * Simulate Inbound Reply for an individual prospect
 */
app.post('/api/cohort/simulate-reply', (req: Request, res: Response) => {
    const { prospectId, text } = req.body;
    const lead = batchManager.simulateReplyForLead(prospectId, text);
    if (!lead) {
        return res.status(404).json({ error: 'Prospect not found' });
    }

    flywheelEmitter.emit('flywheel-event', {
        id: `reply-${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: 'live',
        stage: 'CLASSIFIED',
        title: `📬 Inbound Reply Received: ${lead.name}`,
        description: `"${lead.replyText}"`,
        data: { prospectId: lead.id, lead }
    });

    res.json({ status: 'ok', lead });
});

/**
 * Co-Pilot Mode: Approve and Dispatch Drafted Agent Email
 */
app.post('/api/cohort/approve', async (req: Request, res: Response) => {
    const { prospectId, editedBody } = req.body;
    const lead = batchManager.approveDraft(prospectId, editedBody);
    if (!lead) {
        return res.status(404).json({ error: 'Prospect not found' });
    }

    flywheelEmitter.emit('flywheel-event', {
        id: `approve-${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: 'live',
        stage: 'COMPLETED',
        title: `✅ [Co-Pilot Approved] Email Dispatched to ${lead.name}`,
        description: `Human sales rep approved agent's drafted email. Graph8 action finalized.`,
        data: { prospectId: lead.id, lead }
    });

    res.json({ status: 'approved', lead });
});

app.post('/api/cohort/reset', (req: Request, res: Response) => {
    const reset = batchManager.resetCohort();
    flywheelEmitter.emit('flywheel-event', {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        mode: 'live',
        stage: 'RECEIVED',
        title: '🔄 Cohort Reset to Fresh Draft (20 Prospects)',
        description: 'All 20 prospects restored to initial state ready for a new outbound sequence test.',
        data: { cohort: reset }
    });
    res.json({ status: 'reset', cohort: reset });
});

/**
 * Get Preloaded Presets for manual testing
 */
app.get('/api/presets', (req: Request, res: Response) => {
    res.json({
        presets: DEMO_PRESETS,
        cohort: batchManager.getCohort(),
        config: {
            sequenceId: G8_CONFIG.sequenceId,
            stepId: G8_CONFIG.stepId,
            userEmail: G8_CONFIG.userEmail
        }
    });
});

/**
 * Trigger Flywheel Execution (Backward compatible for custom tester)
 */
app.post('/api/trigger-reply', async (req: Request, res: Response) => {
    const { presetId, customText, sender, company, subject, mode = 'live' } = req.body;

    let inputData = {
        prospectId: undefined as string | undefined,
        text: customText || '',
        sender: sender || 'demo.prospect@enterprise.com',
        senderName: 'Authorized Prospect',
        company: company || 'Enterprise Corp',
        subject: subject || 'Re: Outbound discussion'
    };

    if (presetId) {
        const preset = DEMO_PRESETS.find(p => p.id === presetId);
        if (preset) {
            inputData = {
                prospectId: preset.prospectId,
                text: preset.stage2Inbound.text,
                sender: preset.stage2Inbound.sender,
                senderName: preset.prospectId ? batchManager.getProspect(preset.prospectId)?.name : 'Prospect',
                company: preset.stage2Inbound.company,
                subject: preset.stage2Inbound.subject
            };
        }
    }

    if (!inputData.text) {
        return res.status(400).json({ error: 'Text or valid presetId required' });
    }

    const activeMode = mode === 'sandbox' ? 'sandbox' : 'live';
    runFlywheel(inputData, activeMode).catch(console.error);

    res.json({
        status: 'queued',
        mode: activeMode,
        message: `Flywheel initiated in ${activeMode.toUpperCase()} mode. Watch /api/stream for real-time telemetry.`,
        input: inputData
    });
});

/**
 * Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'active',
        service: 'Autopilot Flywheel Server',
        timestamp: new Date().toISOString(),
        activeSseListeners: sseClients.length,
        graph8: {
            sequenceId: G8_CONFIG.sequenceId,
            stepId: G8_CONFIG.stepId,
            userEmail: G8_CONFIG.userEmail
        }
    });
});

// Serve Vite frontend in production if dist directory exists
const distPath = fs.existsSync(path.resolve(process.cwd(), 'dist'))
    ? path.resolve(process.cwd(), 'dist')
    : path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req: Request, res: Response, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api')) {
            return res.sendFile(path.join(distPath, 'index.html'));
        }
        next();
    });
}

app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 AUTOPILOT REVENUE FLYWHEEL SERVER RUNNING`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📊 SSE Stream: http://localhost:${PORT}/api/stream`);
    console.log(`🎯 Sequence ID: ${G8_CONFIG.sequenceId}`);
    console.log(`📌 Step ID:     ${G8_CONFIG.stepId}`);
    console.log(`==================================================\n`);
});
