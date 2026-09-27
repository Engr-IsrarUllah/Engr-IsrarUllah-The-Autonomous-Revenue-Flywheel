# 🚀 Graph8 Autopilot — Autonomous Revenue Flywheel

> **AI-powered B2B sales engine that autonomously reads inbound customer replies, classifies intent, and takes the correct CRM action — within seconds.**

Built for the **Graph8 Hackathon** by **Israr Ullah Khan**

---

## 🎯 Problem

Enterprise sales teams lose deals due to slow, manual reply handling. When a customer responds to an outbound email, the SDR must:

- Manually research the **right stakeholder** if redirected
- Hand-craft a **custom ROI rebuttal** if a competitor is mentioned
- Manually build a **CPQ contract** in another tool if the customer asks for pricing

This takes **hours to days** — by which time the deal has cooled.

---

## ✅ Solution

**Graph8 Autopilot Revenue Flywheel** is a fully autonomous agent that:

1. **Reads** inbound customer replies in real-time
2. **Classifies** the intent using AI (Gemini + keyword intelligence)
3. **Takes the correct Graph8 CRM action** automatically — in under 3 seconds
4. **Writes a personalized reply email** using Gemini AI with a custom system prompt

---

## ⚙️ The 3-Gear Architecture

```
INBOUND CUSTOMER REPLY
         │
         ▼
┌────────────────────┐
│   AI Classifier    │  ← Reads and classifies the reply intent
│  (Gemini + NLP)    │
└────────────────────┘
         │
         ├── REFERRAL ──────────► Gear 1: Referral Hunter
         ├── OBJECTION ─────────► Gear 2: Sequence Step Mutator
         └── BUYING SIGNAL ─────► Gear 3: CPQ Quote Engine
```

### ⚙️ Gear 1 — Referral Hunter
**Trigger:** "I'm not the right person, contact Sarah instead."

**Agent Actions:**
- Extracts referred person's name, title from the reply
- Searches Graph8's **300M+ contact database**
- Creates the new contact in the CRM
- Enrolls them into the active outbound sequence
- Writes a warm introduction email via **Gemini AI**

### ⚙️ Gear 2 — Sequence Step Mutator
**Trigger:** "We already use Apollo / too expensive."

**Agent Actions:**
- Detects the competitor being mentioned
- Generates a **300% ROI counter-offer** email
- **Live-patches the Graph8 sequence step** across the entire active cohort
- No human intervention required

### ⚙️ Gear 3 — Instant CPQ Quote Engine
**Trigger:** "Send me a quote for 25 seats with Net-30 terms."

**Agent Actions:**
- Extracts exact seat count and payment terms from the email text
- Creates a complete **CPQ Quote** in Graph8
- Returns a **Stripe e-sign checkout URL** — ready to send immediately

---

## 🧠 AI Email Writing

Every reply email is written by **Gemini AI** with a custom system prompt:

```
You are an elite autonomous B2B sales agent for Graph8.
- Address recipient by first name
- Professional, direct, confident tone
- No emojis, under 180 words
- Sign off as: Israr Khan | Graph8 Revenue Intelligence
```

Each gear generates a different email style:
| Gear | Email Written |
|---|---|
| Referral | Warm stakeholder introduction |
| Objection | ROI counter-offer with competitor rebuttal |
| Buying Signal | Official proposal with e-sign link |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **AI Brain** | Google Gemini 1.5 Flash |
| **Agent Framework** | LangGraph (multi-node state machine) |
| **Backend** | Node.js + Express + TypeScript |
| **Frontend** | React 19 + Vite + TypeScript |
| **CRM / GTM** | Graph8 REST API + `@graph8/sdk` |
| **Real-time** | Server-Sent Events (SSE) |

---

## 📁 Project Structure

```
├── server/
│   ├── index.ts          # Express API server (port 3001)
│   ├── agent-graph.ts    # LangGraph state machine (3 gears)
│   ├── ai-writer.ts      # Gemini AI email writer with system prompt
│   ├── classifier.ts     # Intent classification engine
│   ├── engine.ts         # Flywheel orchestrator + SSE emitter
│   ├── batch.ts          # In-memory prospect state manager
│   └── graph8-client.ts  # Graph8 REST API client
├── src/
│   ├── App.tsx                        # Main React app
│   └── components/
│       ├── Header.tsx                 # Top navigation bar
│       ├── KpiSummary.tsx             # Live KPI dashboard
│       ├── ProspectsList.tsx          # Prospect list with status
│       ├── EmailConversationPane.tsx  # 4-stage conversation thread
│       ├── EmailComposeModal.tsx      # Email compose modal
│       └── TelemetryLog.tsx           # Real-time telemetry stream
├── .env.example          # Environment variables template
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Engr-IsrarUllah/Engr-IsrarUllah-The-Autonomous-Revenue-Flywheel.git
cd Engr-IsrarUllah-The-Autonomous-Revenue-Flywheel
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:
```env
GEMINI_API_KEY=your_gemini_api_key        # https://aistudio.google.com/app/apikey
G8_API_KEY=g8_live_your_key_here          # https://app.graph8.com/settings/api
G8_USER_EMAIL=your_email@example.com
G8_SEQUENCE_ID=your_sequence_id
G8_STEP_ID=your_step_id
PORT=3001
```

### 4. Run the project
```bash
npm run dev
```

| Service | URL |
|---|---|
| **React UI** | http://localhost:3000 |
| **Express API** | http://localhost:3001 |

---

## 🔌 Graph8 Tools Used

| Tool | Purpose |
|---|---|
| `POST /search/contacts` | Search 300M+ open data contact directory |
| `POST /contacts` | Create new contact in CRM |
| `POST /sequences/:id/contacts` | Enroll contact into GTM sequence |
| `PATCH /sequences/:id/steps/:id` | Live-mutate active sequence step copy |
| `POST /quotes` | Create CPQ quote with e-sign checkout URL |

---

## 📊 Business Impact

| Metric | Manual (Before) | Autopilot (After) |
|---|---|---|
| Reply response time | Hours to days | **< 3 seconds** |
| SDR admin time | 70% of day | **< 10%** |
| CPQ quote generation | 45 min | **Instant** |
| Concurrent reply handling | 1 at a time | **All simultaneously** |
| Stakeholder lookup | 20 min LinkedIn research | **Automated via 300M+ DB** |

---

## 👤 Author

**Israr Ullah Khan**
- GitHub: [@Engr-IsrarUllah](https://github.com/Engr-IsrarUllah)
- Email: engrisrar256@gmail.com

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
