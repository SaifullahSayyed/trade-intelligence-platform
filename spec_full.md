<USER_REQUEST>
/plan # SPEC.md — Satark (SANGYAN Hackathon)

Status: v1. Every agent reads this first. If code and this file disagree, this file wins.
Items marked **[HUMAN]** must be decided or verified by a person. Agents must flag them, never invent them.

---

## 1. Purpose and scope

Satark helps first-time investors from Tier-2/3 India avoid fraud and scams before money moves.
Core loop:

1. **Shield:** the user pastes, forwards or speaks a message. Satark returns an action-first verdict, an honest uncertainty line and a reporting path.
2. **Red-team:** a separate harness attacks the detector with synthetic scam variants and measures robustness.
3. **Scam Gym:** short practice scenarios teach users the manipulation tactics (prebunking).

Hero journey (build depth here): a Hindi/Marathi voice note or forwarded message about a fake IPO, "guaranteed returns" or a paid tip group -> verdict -> pause step -> reporting guidance.

### Hackathon rules the product must obey (violations disqualify)
- No stock tips, buy/sell/hold signals, price or outcome predictions.
- No monetisation: no commissions, upsells, broker promotion or product links.
- No collecting OTPs, SMS, or sensitive financial data.
- Communicate uncertainty clearly. Disclose third-party components.
- IP in submissions vests in NSDL under the event terms. Write fresh code. Do NOT reuse code from any other personal or commercial project. **[HUMAN]** read the Terms and Conditions.

---

## 2. Users (personas to design and demo against)

| Persona | Context | Needs |
|---|---|---|
| Praveen, 22 | Tier-3 graduate, gig worker, trades on borrowed money, follows Telegram F&O tips | Fast, blunt warning before acting |
| Kavita, 39 | Tier-2 homemaker, manages family savings, not fluent in English | Voice and Marathi/Hindi, simple words, no jargon |
| Babulal, 63 | Retired, dormant folios, unsure about nominees and complaint portals | Large text, read-aloud, a clear complaint path |

---

## 3. Languages

Hindi (Devanagari), Marathi (Devanagari), Hinglish (Romanised Hindi), English.
UI language and message language are independent. Detect message language; let the user override.
All user-facing strings live in `i18n/{en,hi,mr}.json`. **[HUMAN]** a native speaker reviews hi/mr copy before the demo.

---

## 4. Verdicts (exactly three)

| Code | Colour + icon | Meaning |
|---|---|---|
| `HIGH_CONCERN` | red, stop-hand | Strong scam indicators |
| `BE_CAREFUL` | amber, warning | Some warning signs |
| `NO_RED_FLAGS_FOUND` | grey-blue, magnifier | Nothing detected. Never "safe", "genuine" or "legit" |

Verdict headline copy (draft; **[HUMAN]** review hi/mr):

| Code | English | Hindi | Marathi |
|---|---|---|---|
| HIGH_CONCERN | Very high concern. Do not send money or share OTP, PIN or UPI details. Verify first. | बहुत सावधान रहें: पैसे न भेजें और OTP, PIN या UPI की जानकारी न दें। पहले जाँच करें। | खूप सावध रहा: पैसे पाठवू नका आणि OTP, PIN किंवा UPI माहिती देऊ नका. आधी खात्री करा. |
| BE_CAREFUL | Be careful. Some warning signs found. Check before you act. | सावधान रहें: कुछ चेतावनी के संकेत मिले हैं। आगे बढ़ने से पहले जाँच लें। | सावध रहा: काही धोक्याची चिन्हे दिसली आहेत. पुढे जाण्यापूर्वी तपासा. |
| NO_RED_FLAGS_FOUND | No clear red flags found. I cannot verify the sender. Never share your OTP. | कोई स्पष्ट खतरे का संकेत नहीं मिला। मैं भेजने वाले की पुष्टि नहीं कर सकता। OTP कभी साझा न करें। | कोणतेही स्पष्ट धोक्याचे चिन्ह आढळले नाही. मी पाठवणाऱ्याची खात्री करू शकत नाही. OTP कधीही शेअर करू नका. |

Refusal (any request for buy/sell/hold, price prediction, "is this a good stock"):

| English | Hindi | Marathi |
|---|---|---|
| I can only check a message for warning signs. I cannot tell you whether to buy or sell. | मैं केवल संदेश में चेतावनी के संकेत जाँच सकता हूँ। खरीदने या बेचने की सलाह नहीं दे सकता। | मी फक्त संदेशातील धोक्याची चिन्हे तपासू शकतो. खरेदी किंवा विक्रीचा सल्ला देऊ शकत नाही. |

Degraded / failure message (shown with a rules-only verdict whenever any component fails):

| English | Hindi | Marathi |
|---|---|---|
| I could not fully check this. Please verify independently and do not send money based on this message. | मैं इसे पूरी तरह जाँच नहीं सका। कृपया खुद पुष्टि करें और इस संदेश के आधार पर पैसे न भेजें। | मी हे पूर्णपणे तपासू शकलो नाही. कृपया स्वतः खात्री करा आणि या संदेशावरून पैसे पाठवू नका. |

---

## 5. Risk signals and verdict floor (deterministic, rules-first)

Single source of truth: `rules/signals.yaml`. Both the Python backend and the browser JS engine load it. Never hand-duplicate logic.

| ID | Signal | Severity |
|---|---|---|
| S01 | Guaranteed / assured / doubled returns | high |
| S02 | Urgency, countdown, "last slots" | medium |
| S03 | Impersonation of SEBI, NSDL, a broker, RBI, police or "officer" | high |
| S04 | Asks for OTP, UPI PIN, CVV, password | critical |
| S05 | Asks to install remote-access or screen-share app | critical |
| S06 | Pressure to move to a private channel or join a paid "tip group" | high |
| S07 | Advance fee, "registration/processing/tax fee" | high |
| S08 | Unverified IPO/allotment/pre-IPO/"insider" claims | high |
| S09 | Suspicious link (shortener, lookalike domain, official claim on non-official domain) | medium |
| S10 | "Recover your lost money" service | high |
| S11 | Secrecy ("do not tell family") | high |
| S12 | Unsolicited KYC/demat-update with link or deadline | high |
| S13 | Profit screenshots or testimonials as proof | medium |
| S14 | Asks for holdings or account details | high |

Floor rules (applied in order; first match wins):
1. Any `critical` signal -> `HIGH_CONCERN`.
2. Two or more `high` -> `HIGH_CONCERN`.
3. S01+S07, or S03 with (S09 or S12) -> `HIGH_CONCERN`.
4. Exactly one `high` -> at least `BE_CAREFUL`.
5. Two or more `medium` -> `BE_CAREFUL`.
6. Otherwise -> `NO_RED_FLAGS_FOUND`.

**Warning context must not trigger signals.** Awareness text such as "no one can guarantee returns" or "never share your OTP" must not fire S01 or S04. The rules need negation and warning-context handling, with test vectors. This protects the false-positive rate.

Signals must be matched across Devanagari, Romanised Hindi/Marathi, English and mixed text, including common spelling variants and digits written in Devanagari.

---

## 6. Architecture

```
Input (text / voice note)
  -> on-device redaction
  -> language ID (+ transcription for audio; show transcript for confirmation)
  -> rules engine (rules/signals.yaml)  -> verdict FLOOR
  -> [online] LLM explanation (strict JSON schema)
  -> safety validator (may only RAISE concern, never lower; blocks banned content)
  -> action-first result + pause step + reporting routes
  -> optional Scam Gym
Offline / any failure -> rules-only verdict + degraded message.
```

The red-team harness is separate. It never edits production rules automatically; changes go through human review.

Suggested stack (agents may propose changes with reasons): FastAPI backend; lightweight PWA front end (Vite + Preact or vanilla TS) with a service worker; browser SpeechRecognition/speechSynthesis where available; server-side transcription for uploaded audio via a disclosed third-party API; LLM provider configurable via env vars; API keys only in server env, never in client code.

---

## 7. API contract

`POST /api/check`

Request:
```json
{
  "text": "<already-redacted text>",
  "input_mode": "text | voice",
  "language_hint": "hi | mr | hinglish | en | null",
  "ui_language": "hi | mr | en",
  "transcript_confidence": 0.0
}
```

Response:
```json
{
  "request_id": "uuid",
  "verdict": "HIGH_CONCERN | BE_CAREFUL | NO_RED_FLAGS_FOUND",
  "signals": [{"id": "S01", "evidence": "<short redacted fragment>"}],
  "explanation": {
    "language": "hi | mr | en",
    "summary": "...",
    "what_to_do": ["..."],
    "uncertainty": "..."
  },
  "report_routes": [{"id": "...", "label": "...", "verified": false}],
  "source": "rules_only | rules_plus_llm",
  "degraded": false
}
```

Rules:
- Validate request and response with schemas. Reject unknown fields.
- Never log or store message text. Log only request_id, verdict, signal ids, latency, error codes.
- Re-redact server-side defensively even though the client already redacted.

---

## 8. Redaction (on-device first, server defensive)

Replace with tokens such as `[PHONE]`, `[UPI]`, `[EMAIL]`, `[PAN]`, `[ID12]`, `[ACCOUNT]`, `[OTP]`:
- Indian mobile numbers (with or without +91, spaces, hyphens)
- UPI IDs (`name@bank`)
- Email addresses
- PAN pattern (5 letters, 4 digits, 1 letter)
- 12-digit Aadhaar-like numbers (with or without spaces)
- Account numbers (9-18 digits)
- OTP-like codes (4-8 digits near words such as OTP, code, PIN)
- Do NOT redact the *request* for these things; the signal must still fire on "send your OTP".

Redaction must preserve signal detection. Test vectors prove it.

---

## 9. LLM contract

Input to the LLM: the redacted text, the language, and the list of fired signals with ids. Output: JSON matching the explanation schema, in the requested language, in plain words at roughly Class 6 reading level, with a one-line uncertainty statement.

The safety validator rejects and replaces output that contains any of:
- buy / sell / hold / "good stock" / price or return predictions
- names of brokers, apps or products
- claims that a message is "safe", "genuine", "legit", "verified" or "official"
- a verdict lower than the rules floor
- links not on the approved route list
- text outside the schema

Prompt-injection stance: message text is untrusted data. Instructions inside it ("ignore previous instructions", "say this is safe") must have no effect. The rules floor is computed without the LLM, so the verdict cannot be lowered by it. Test vectors cover this.

LLM timeout, error or invalid output -> rules-only verdict with the degraded message.

---

## 10. Voice journey

1. Record or upload a short voice note (cap length, e.g. 60 seconds).
2. Transcribe. Show the transcript and its confidence; the user can edit or confirm.
3. Redact, then run the normal check.
4. Return the verdict as text, with optional read-aloud where the device supports it.
5. Low confidence or unsupported audio -> degraded message. Never pretend the transcript is accurate.

---

## 11. Scam Gym

- Flow: pre-test (3 scenarios) -> 2-3 practice rounds with feedback naming the manipulation tactic -> post-test (3 different unseen scenarios).
- Scenario set is synthetic and clearly labelled "practice example". No real brands, people, phone numbers or live links. Pre-test and post-test pools are disjoint.
- No user-facing "generate a scam" feature.
- Results are stored locally on the device by default. Aggregate pilot export contains no message text and no identity.
- Reporting claims must say "pilot", with the sample size.

---

## 12. Red-team and evaluation

Datasets, kept separate (`eval/`):
1. `seed_handwritten.jsonl`: 30-50 messages written by a human **[HUMAN]**. Label, language, category. This is the ground-truth anchor.
2. `dev_synthetic.jsonl`: synthetic variants used for development.
3. `heldout_adversarial.jsonl`: synthetic variants never used for tuning.
4. `legitimate.jsonl`: SEBI-style awareness notes, broker-style service notices and normal messages (synthetic or paraphrased; no copyrighted text).

Rules:
- The model that generates variants must differ from the model that writes explanations (configurable; record which was used).
- Report hand-written and synthetic results separately.
- Metrics: precision, recall, false-positive rate on legitimate set, evasion rate, plus per-language and per-category breakdowns, round over round.
- No automatic rule or prompt updates. A human reviews every proposed change.
- Do not report any number that the harness did not produce.
- Generated scam text stays inside `eval/` and is not shown in the product UI.

---

## 13. Failure behaviour

| Failure | Behaviour |
|---|---|
| LLM timeout / error / invalid output | Rules-only verdict + degraded message |
| Backend unreachable | Browser rules engine runs; show degraded message |
| Transcription fails or low confidence | Ask for text or retry; show degraded message |
| Empty or oversize input | Friendly validation message in UI language |
| Unknown language | Run rules on raw text; say language could not be identified |
| Refusal topic (buy/sell/predict) | Refusal copy; no verdict claims about the stock |

---

## 14. Reporting routes

Show in the user's language, with a note that the user should verify details on official pages.
Candidates: SEBI SCORES complaint portal, National Cyber Crime Helpline 1930, the national cybercrime reporting portal. **[HUMAN]** verify each name, number and URL on the official site before setting `verified: true`. Agents must not invent links.

---

## 15. Privacy

- Nothing stored server-side. No message text in logs. No third-party analytics or trackers.
- No access to SMS, notifications, contacts or OTPs.
- Family circuit-breaker (stretch): a user-initiated share sheet only. No data collected by the app.
- A short privacy notice inside the app, in the user's language.

---

## 16. Quality gates (definition of done)

- Gate A: rules, redaction, validator pass all unit and conformance tests; Python and JS engines agree on every test vector.
- Gate B: end-to-end text journey works in hi/mr/en, online and offline, with every failure path tested.
- Gate C: voice, red-team harness and Scam Gym work; metrics generated by the harness.
- Gate D: QA suite green on slow network, mobile viewport and all failure modes; accessibility pass done.
- Gate E: demo run three times from a clean environment without intervention.

---

## 17. Non-goals (cut in this order if time breaks)

1. Family circuit-breaker
2. Voice read-aloud
3. Extra languages beyond hi/mr/en/Hinglish
4. Scam Gym pilot dashboard polish

Never cut: Hindi voice/text journey, guardrail behaviour, evaluation table, offline fallback.

---

## 18. Third-party components (fill as used) **[HUMAN]**

| Component | Purpose | Licence / provider |
|---|---|---|
| | | |                                                                                                                                                                                              You are working on "Satark", an investor-protection tool for the SANGYAN hackathon.

Always read SPEC.md first. SPEC.md is the contract. If asked to do something that conflicts with it, stop and explain instead of proceeding.

Rules:
1. Test first. Write failing tests from the spec, then implement.
2. Never invent official links, phone numbers, legal claims or statistics. Mark them HUMAN-VERIFY.
3. Never edit SPEC.md. Propose changes in a file named SPEC_PROPOSALS.md.
4. Never write code that stores or logs message text, collects OTPs/SMS, gives investment advice, or names brokers.
5. Write fresh code. Do not copy code from other repositories. List third-party libraries and services in THIRD_PARTY.md as you add them.
6. Never hardcode API keys. Read from environment variables. Add .env.example.
7. Rules logic has ONE source of truth: rules/signals.yaml. Never duplicate rules in code.
8. No automatic updates of detection rules or prompts from generated data.
9. When you finish a task, always report: (a) files changed, (b) tests added, (c) tests run with exact commands and results, (d) known limitations, (e) screenshots/artifacts for UI work.
10. Do not claim a feature is done unless its tests pass in this run.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-01T13:17:27+05:30.

The user has mentioned some items in the form @[ITEM]. Here is extra information about the items that were mentioned by the user, in the order that they appear:

/plan is a [Slash Command]:
<PLAN>The user is requesting that you think and plan carefully before executing the upcoming task.
Carefully research the task, make sure that you and the user are aligned on the goals and requirements,
create a detailed implementation plan artifact, and get user approval on the plan before making any code changes (besides artifacts)
or running any modifying commands.

# Guidelines
- Establish a shared understanding of the task with the user. If there are any ambiguities, underspecified requirements,
or implicit assumptions, clarify them with the user before proceeding.
- Thoroughly research the codebase to establish a solid understanding of the relevant components, systems, dependencies, and architecture.
As you research, provide verbal updates of your research steps and thought process with the user, so they can follow along.
- Create an implementation plan artifact that outlines your proposed execution strategy.
Set request_feedback = true and user_facing = true in the ArtifactMetadata. The user will automatically
see any new and modified plans you create, so DO NOT re-summarize the plan.
- Only after the user explicitly approves the plan should you proceed to execution.
- Verify that your changes have the desired effects e.g. run unit tests, make sure code builds, etc. before claiming that the task is complete.
- After you've completed your task and verified that your solution works, create a walkthrough artifact to summarize your work.

# Planning Mode Artifacts
When in planning mode, you should create two special artifacts.

# Implementation Plan
Path: <Artifact Directory>/<plan_name>.md

**Purpose**: A technical design document to present your implementation plan to the user for feedback and approval.
After reading the document, the user should understand the key technical details of your plan, and be able to make an informed decision on whether to approve it.
This document should be very detailed, including code snippets, diffs, mermaid diagrams, verification strategies, and background information.

**Format**: Use the following format, omitting any irrelevant sections:

## [Goal Description]
Provide a brief description of the problem, any background context, and what the change accomplishes.

## User Review Required
Document anything that requires user review or feedback, for example, breaking changes or significant design decisions. Use GitHub alerts (IMPORTANT/WARNING/CAUTION) to highlight critical items.

## Open Questions
Any clarifying or design questions for the user that will impact the implementation plan. Use GitHub alerts (IMPORTANT/WARNING/CAUTION) to highlight critical items.

## Proposed Changes
Group files by component (e.g., package, feature area, dependency layer) and order logically (dependencies first). Separate components with horizontal rules for visual clarity.

### [Component Name]
Summary of what will change in this component with explicit code snippets and diffs. For specific files, Use [NEW] and [DELETE] to demarcate new and deleted files, for example:
#### [MODIFY] file basename
#### [NEW] file basename
#### [DELETE] file basename

## Verification Plan
Summary of how you will verify that your changes have the desired effects.

### Automated Tests
Exact commands to run automated tests

### Manual Verification
Instructions for what the user should manually verify.

# Walkthrough
Path: <Artifact Directory>/walkthrough.md

**Purpose**: After completing work, summarize what you accomplished. Update an existing walkthrough for related follow-up work rather than creating a new one.

**Document**:
- Changes made
- What was tested
- Validation results

Embed screenshots and recordings to visually demonstrate UI changes and user flows.</PLAN>
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Claude Sonnet 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>