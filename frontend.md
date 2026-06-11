# Frontend Product Design

This file defines the frontend experience for the MVP.

The frontend should have one cinematic entry screen, then focus on four primary product pages:

```text
0. Intro / Login
1. Define New Task
2. Wanted Order Hall
3. Activities
4. Hall-of-Fame Killer Agents
```

The goal is to make task creation feel like entering BountyLand: users post "wanted" computation orders, platform killer agents can solve specialized problems, and the open market can mine / validate tasks through a high-trust order hall.

The intro can feel like a high-production western game. After login, the actual app should become restrained, premium, and efficient: less theatrical, more like a clean high-end operations console.

---

## 0. Intro / Login

### Core Idea

Before entering the product, show an import / intro page that establishes the BountyLand metaphor.

Visual direction:

```text
大制作西部游戏风
Dusty frontier / wanted board / cinematic title screen
High drama only on this entry page
```

Image references:

```text
Intro page composition:
  reference: img/intro_page_concept.png

Main app theme candidates:
  dark premium theme reference: img/dark_concept.png

  light premium theme reference: img/light_concept.png
```

Usage:

```text
- Intro / Login should visually follow img/intro_page_concept.png.
- After login, choose either dark_concept or light_concept as the main app theme direction.
- Do not keep the full cinematic western style inside every dashboard page.
- Main product pages should stay clean, restrained, and premium.
```

Primary screen:

```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                       BountyLand                           │
│                                                            │
│                Wanted orders for computation               │
│                                                            │
│                   Click anywhere to start                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Click behavior:

```text
Click anywhere:
  open floating login window
```

Login modal:

```text
┌────────────────────────────────────────────┐
│ Enter BountyLand                       [x] │
│                                            │
│ Wallet / demo login                        │
│ Cobo Wallet: Mock connected                │
│                                            │
│ [Enter the hall]                           │
└────────────────────────────────────────────┘
```

After login:

```text
Enter main app
Style shifts to restrained / premium / efficient
No giant marketing hero after login
```

The intro page is not a dashboard page. It is an entry ritual.

---

## 1. Define New Task

### Core Idea

This page is where the user chooses how to create a BountyLand wanted order.

After login, the chatbot should not be the first visible object. The first screen should show three large horizontal entry bubbles. Each bubble is larger than the older compact bubbles and should feel like a premium selection surface.

The three bubbles together should occupy roughly half of the available screen height, excluding the tab/sidebar/navigation area.

### Main Entry Bubble Layout

Suggested layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ Define Wanted Order                                           │
│ Choose how this computation bounty should enter BountyLand.   │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 我需要 Web3 coding debug                                 │ │
│ │ Platform Debug Agent · GLM-4.5 Flash · Rating 4.8/5      │ │
│ │ Audit/debug smart contracts, repos, logs, failing tests. │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 我需要数据集                                             │ │
│ │ Data Mining Agent · Dataset scope + cleaning · 4.7/5     │ │
│ │ Define collection, filtering, schema, validation.        │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 我需要自定义 task warrant                                │ │
│ │ Spec Agent · rubric + reward + settlement · 4.6/5        │ │
│ │ Draft criteria and send the order into the hall.         │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Bubble visual rules:

```text
- horizontal rectangular bubbles, not tiny square cards
- each bubble has title, agent intro, rating/reputation, and status
- use subtle premium styling after login
- can include a small agent avatar / badge on the right
- the three bubbles together occupy about half the post-login content area
- the old centered chatbot should only appear after choosing custom task warrant
```

### Bubble 1: Web3 Coding Debug

```text
我需要 Web3 coding debug
```

Subtitle:

```text
Platform Debug Agent
Hooked with GLM-4.5 Flash
Open review score: 4.8 / 5
```

Short intro:

```text
For users who need Web3 protocol audit, smart contract debugging, failing-test diagnosis, or security triage. The platform Debug Agent helps formalize the problem, estimate a bounty, and produce an executable wanted order.
```

Click behavior:

```text
Click bubble:
  open formalized Web3 debug / audit form
```

Form fields:

```text
- repo URL / codebase upload
- contract address / chain / VM if relevant
- error log or failing test output
- suspected issue type
- target files / contract scope
- expected deliverable:
  - root cause
  - patch suggestion
  - PoC / reproduction
  - audit note
- deadline / urgency
- privacy mode
```

Agent behavior after form submission:

```text
Debug Agent reads the form
  ↓
estimates complexity and suggested bounty
  ↓
drafts evaluation criteria and acceptance checks
  ↓
user pays / mock approves escrow
  ↓
task enters Wanted Order Hall
  ↓
status shows: Agent is working
```

### Bubble 2: Dataset / Data Mining

Label:

```text
我需要数据集
```

Subtitle:

```text
Platform Data Mining Agent
Dataset collection / filtering / cleaning
Open review score: 4.7 / 5
```

Short intro:

```text
For users who need a specific dataset but do not know how to define collection scope, filtering rules, cleaning standards, schema, quality criteria, or validator acceptance checks.
```

Click behavior:

```text
Click bubble:
  open formalized dataset request form
```

Form fields:

```text
- domain / use case
- dataset size target
- source constraints
- privacy / licensing constraints
- schema and output format
- cleaning / deduplication standard
- labeling requirements
- validation methodology
- deadline / urgency
```

Agent behavior after form submission:

```text
Data Mining Agent reads the form
  ↓
estimates dataset cost and suggested bounty
  ↓
drafts miner requirements and validator rubric
  ↓
user pays / mock approves escrow
  ↓
task enters Wanted Order Hall
  ↓
status shows: Agent is working
```

### Bubble 3: Custom Task Warrant

Label:

```text
我需要自定义 task warrant
```

Subtitle:

```text
Spec Agent
帮忙拟定任务评判 + 奖励结算并进入订单大厅
Open review score: 4.6 / 5
```

This bubble uses the previous chatbot logic.

After clicking it, the UI opens:

```text
Centered natural language input box
Prompt placeholder:
  "Describe the dataset, computation, or AI task you want to outsource to human miners..."
```

Example user input:

```text
帮我外包生成一个高质量的 reasoning QA 数据集，包含 1000 条问题、标准答案和简短推理过程。
```

Suggested flow:

```text
1. User describes task in natural language.
2. Platform spec agent returns a high-level scoring methodology.
3. User confirms or revises the methodology.
4. Platform spec agent asks strategy questions:
   - validator access: broad crowd vs curated experts
   - output format strictness
   - AI reference score vs human validator weighting
   - threshold / refund preference
5. User enters explicit Reward Pool amount.
6. Platform spec agent generates:
   - task summary
   - miner output requirements
   - validator checklist
   - pass / fail condition
   - AI threshold line
   - reward rule
   - dispute trigger
   - taskURI / orderURI / criteriaHash preview
   - Cobo Pact policy draft
7. User confirms task creation.
8. Task is created on-chain or mocked as on-chain for the demo.
9. Task appears in Wanted Order Hall.
```

### Confirmation State

Before confirming, the user should see a compact summary:

```text
Task:
  Generate a reasoning QA dataset with 1000 records.

Miner output:
  JSONL dataset with question, answer, reasoning, difficulty, topic.

Validator criteria:
  Dataset quality and diversity first.

Reward:
  User-entered Reward Pool, e.g. 0.01 ETH.

Escrow:
  The Reward Pool is escrowed before the task becomes active.
  This is not gas fee.

AI threshold line:
  72/100
  If all miner submissions fail to pass this threshold,
  most of the Reward Pool is refunded to the user.

Audit:
  AI audit enabled.

Contract:
  createTask(taskURI, orderURI, criteriaHash, deadline, aiAuditEnabled)
```

Primary action:

```text
Approve Reward Pool escrow and create task
```

After confirmation:

```text
Task created.
Reward Pool escrowed.
Status: Active
Available for miners.
```

Then the task should pop into the second topic page: `Wanted Order Hall`.

---

## 2. Wanted Order Hall

### Core Idea

This page shows computation bounties that have already been created and are available for miners / solvers / validators to accept.

For the MVP, tasks can be treated as already on-chain once the user confirms creation in the mock flow.

Each computation task should be visually treated like a retro `wanted` notice. This is the core BountyLand marketplace metaphor.

Each task card should visualize:

```text
- task overview
- wanted poster identity
- number of miner submissions
- reward overview
- AI audit status
- selected validator criteria
- two role actions:
  - I wanna mine
  - I wanna validate
```

Each wanted poster card should also be clickable. Clicking the card opens a floating rectangular detail modal. The modal sits above the page, has a close button in the top-right corner, and keeps the user in the same page context.

The two role actions should be available both on the card and inside the floating detail modal.

### Wanted Poster Card Structure

Each task should be displayed as a retro wanted poster card:

```text
┌────────────────────────────────────────────┐
│                WANTED                      │
│          Reasoning QA Dataset              │
│                                            │
│  Bounty: 0.1 ETH                           │
│  Status: Open / Agent is working           │
│  Miner submissions: 3                      │
│  AI audit: Enabled                         │
│  Criteria: Dataset quality + diversity     │
│                                            │
│  [I wanna mine] [I wanna validate]          │
└────────────────────────────────────────────┘
```

Wanted poster visual rules:

```text
- parchment / poster-like shape is okay here
- title reads like a bounty notice
- reward is prominent
- status can show:
  - Open for miners
  - Agent is working
  - Waiting for validation
  - Scored
  - Settled
- do not make every other page parchment; this is specific to the order hall
```

Click behavior:

```text
Click card body:
  open floating wanted order detail modal

Click I wanna mine:
  open miner interaction interface for this task

Click I wanna validate:
  open validator interaction interface for this task
```

### Task Overview

The overview should be short and scannable:

```text
Title:
  Reasoning QA Dataset Generation

Summary:
  Generate 1000 reasoning QA records with question, answer, reasoning, difficulty, and topic fields.

Output format:
  JSONL

Deadline:
  48h
```

### Miner Submission Count

Show how many miners have already submitted:

```text
Miner submissions: 3
```

If none:

```text
Miner submissions: 0
Open for first submission
```

### Reward Overview

Show reward in a way that helps miners decide quickly:

```text
Reward pool: 0.1 ETH
Estimated payout: score-based
Validator reward: reduced if validator deviates from AI audit
```

For the MVP, this can be simplified:

```text
Reward pool: 0.1 ETH
Payout: based on audited final score
```

### Role Actions

Each task card has two main actions.

### Wanted Order Detail View

When a user clicks a wanted poster card, show a floating rectangular wanted order detail modal:

```text
┌────────────────────────────────────────────────────────────┐
│ Wanted order details                                   [x] │
│                                                            │
│ ...task content...                                         │
│                                                            │
│ [I wanna mine] [I wanna validate]                           │
└────────────────────────────────────────────────────────────┘
```

Modal behavior:

```text
- opens above Wanted Order Hall without navigating away
- top-right close button
- clicking outside can also close it
- card actions remain available inside the modal
```

Modal content:

```text
Task summary
  title
  status
  created time
  deadline
  reward pool
  escrowed Reward Pool amount
  AI threshold line
  AI audit status

Computation order
  task description
  miner output requirements
  output format
  taskURI
  orderURI
  criteriaHash

Validator acceptance criteria
  selected criteria option
  scoring dimensions
  pass / fail condition
  AI threshold line
  validator checklist
  dispute trigger

Reward Pool / refund rule
  Reward Pool escrowed by user
  if all miner submissions score below the AI threshold line,
  most of the Reward Pool is refunded to the user

Submissions
  miner submission count
  latest submission status

Actions
  I wanna mine
  I wanna validate
```

This view should make the task feel like an actual order that has already been created and can now be worked on.

### Agent Working State

For tasks created through Web3 Debug Agent or Data Mining Agent, the order should still enter the hall after payment / mock escrow.

Show:

```text
Status: Agent is working
Assigned killer agent: Debug Killer / Data Mining Agent
Estimated bounty: 0.XX ETH
Open review: pending after first output
```

The user should feel that the task has entered the same public order system, even if it is initially handled by a platform agent.

### Miner Interaction Interface

Opened by clicking:

```text
I wanna mine
```

This is the miner's working interface for a specific task.

Suggested layout:

```text
┌──────────────────────────────┬──────────────────────────────┐
│ Computation Order             │ Miner Submission             │
│ task summary                  │ output upload / text input   │
│ output requirements           │ outputURI                    │
│ reward / deadline             │ outputHash preview           │
│ validator criteria preview    │ submit button                │
└──────────────────────────────┴──────────────────────────────┘
```

Left side:

```text
- task overview
- required output format
- miner output requirements
- deadline
- reward pool
- selected validator criteria preview
```

Right side:

```text
- output text area or file upload
- outputURI input
- generated outputHash preview
- submit output button
```

After submission:

```text
Submission created.
Status: Waiting for validator score.
Potential reward: +0.0X ETH
AI threshold line: 72/100
```

The task should then appear in `Activities` under the user's mining activity.

### Validator Interaction Interface

Opened by clicking:

```text
I wanna validate
```

This is the validator's working interface for a specific task.

Suggested layout:

```text
┌──────────────────────────────┬──────────────────────────────┐
│ Miner Submission              │ Validator Panel              │
│ submitted output              │ criteria checklist           │
│ outputURI / outputHash        │ score input                  │
│ task requirements             │ reason input                 │
│ AI audit pending/status       │ submit validation            │
└──────────────────────────────┴──────────────────────────────┘
```

Left side:

```text
- selected miner submission
- outputURI
- outputHash
- output preview
- original computation order
```

Right side:

```text
- validator acceptance criteria
- checklist
- score input 0-100
- reason input
- submit validation button
- AI audit result after submission
```

After validator submits:

```text
Validator score submitted.
AI audit score generated.
Delta calculated.
Status: Scored / Waiting for settlement.
Potential validator reward: +0.00X ETH
Potential reputation change: +3 / -5 / -15
```

The task should then appear in `Activities` under the user's validation activity.

---

## 3. Activities

### Core Idea

`Activities` is the user's personal work history. It shows orders the user has mined or validated.

This page should be in the sidebar navigation:

```text
Define New Task
Wanted Order Hall
Activities
Hall-of-Fame Killer Agents
```

Each activity row/card is clickable and opens the full detail for that activity.
Clicking an activity opens a floating rectangular activity detail modal with a top-right close button.

### Activity List Visual Style

The list should feel like a transaction/activity feed:

```text
┌────────────────────────────────────────────────────────────┐
│ Reasoning QA Dataset Generation             +0.034 ETH     │
│ Mining activity | Settled                                  │
│ Final score: 88 | Submitted 2h ago                         │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Reasoning QA Dataset Generation             +0.008 ETH     │
│ Validation activity | Scored                               │
│ Validator delta: 12 | Reputation +3                        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ OCR Extraction Batch                         +0.015 ETH     │
│ Mining activity | Unscored                                │
│ Potential reward | Waiting for validator                   │
└────────────────────────────────────────────────────────────┘
```

The right side amount should be prominent:

```text
Settled:
  green number: +0.034 ETH

Scored but not settled:
  muted/outlined number: potential +0.034 ETH

Unscored:
  muted number: potential +0.015 ETH
```

### Activity Status

Each activity has one of these states:

```text
Unscored:
  miner submitted output, no validator score yet

Scored:
  validator score and AI audit score exist, final score calculated, settlement not complete

Settled:
  reward distributed or settlement mocked as complete
```

Chinese labels if the UI uses Chinese:

```text
未评分
已评分
已结算
```

### Mining Activity Card

For mining activity, show:

```text
- task title
- role: Mining
- status: Unscored / Scored / Settled
- miner submitted time
- final score if available
- potential reward if not settled
- settled reward if settled
- outputHash short preview
```

Right-side amount:

```text
Settled:
  +0.034 ETH

Unscored / Scored:
  potential +0.034 ETH
```

### Validation Activity Card

For validation activity, show:

```text
- task title
- role: Validation
- status: Scored / Settled
- validator score
- AI audit score
- delta
- validator reward or potential validator reward
- reputation settlement change
```

Right-side amount:

```text
Settled:
  +0.008 ETH

Scored:
  potential +0.008 ETH
```

Reputation line:

```text
Reputation +3
Reputation -5
Reputation -15
```

Positive reputation change should be green. Negative reputation change should be red or amber.

### Activity Detail View

Clicking an activity card opens a floating rectangular activity detail modal:

```text
┌────────────────────────────────────────────────────────────┐
│ Activity details                                       [x] │
│                                                            │
│ ...activity content...                                     │
└────────────────────────────────────────────────────────────┘
```

Modal behavior:

```text
- opens above Activities without navigating away
- top-right close button
- clicking outside can also close it
- shows the full task and reward context
```

Modal content:

```text
Task summary
Activity role: Mining / Validation
Status timeline
Reward calculation
Reward Pool / refund rule if relevant
Score details
AI audit explanation
Cobo settlement status
Contract params
```

Mining detail should include:

```text
- submitted outputURI
- outputHash
- validator score if available
- AI audit score if available
- final score if available
- reward formula
```

Validation detail should include:

```text
- miner submission reviewed
- selected validator criteria
- validator score
- validator reason
- AI audit reference score
- deviation
- reputation change
- validator reward formula
```

---

## 4. Hall-of-Fame Killer Agents

### Core Idea

`Hall-of-Fame Killer Agents` is a sidebar page dedicated to platform and community agents with strong reputation.

```text
1. Web3 Debug / Audit Killer
2. Data Mining Killer
3. Spec / Warrant Drafting Agent
4. Future community agents that earn enough reputation
```

This page is not the task marketplace and not a generic marketing landing page. It should feel like a premium hero roster from a game, but still practical: users can inspect each agent's architecture, reputation, open review, and service history.

### Sidebar Navigation

The sidebar should include:

```text
Define New Task
Wanted Order Hall
Activities
Hall-of-Fame Killer Agents
```

Chinese label:

```text
名人堂 Killer Agent
```

### Page Layout

Suggested layout:

```text
┌────────────────────────────────────────────────────────────┐
│ Hall-of-Fame Killer Agents                                  │
│ Agents that solve, draft, review, and earn reputation.       │
├─────────────────┬─────────────────┬────────────────────────┤
│ Avatar          │ Avatar          │ Avatar                 │
│ Debug Killer    │ Data Mining     │ Spec Agent             │
│ 4.8 / 5         │ 4.7 / 5         │ 4.6 / 5                │
│ solved / review │ solved / review │ drafted / review       │
└──────────────────────────────┴─────────────────────────────┘
```

### Hero Card Style

Each agent can be displayed as a game-like hero card:

```text
┌──────────────────────────────┐
│ [avatar]                     │
│ Web3 Debug Killer            │
│ GLM-4.5 Flash                │
│ Rating: 4.8 / 5              │
│ Reviews: 128                 │
│ Reputation: Hall of Fame     │
│ [Inspect agent]              │
└──────────────────────────────┘
```

Visual rules:

```text
- hero-card feeling is welcome here
- each card can have an avatar
- keep the page premium and readable, not a noisy collectible wall
- rating shown here should also appear on the first page selection bubbles
- cards can use subtle rarity / tier labels:
  - Candidate
  - Verified
  - Hall of Fame
```

### Agent Detail Modal / Page

Clicking an agent card opens an agent detail view:

```text
┌────────────────────────────────────────────────────────────┐
│ Web3 Debug Killer                                      [x] │
│                                                            │
│ Avatar / model / version / reputation                      │
│ Architecture                                               │
│ Capabilities                                               │
│ Recent wanted orders                                       │
│ Open review                                                │
│ Submit review                                              │
└────────────────────────────────────────────────────────────┘
```

Open review:

```text
- everyone can see other people's reviews
- users can submit a review after using or reviewing an agent output
- review score contributes to the agent's public rating
- high-reputation agents can graduate into Hall of Fame
```

The open review score must be reused on the Define New Task bubbles so users can decide:

```text
Use this agent
or
post the task into the order hall for miners
```

### Web3 Debug / Audit Killer Detail

The debug killer should be described as a platform service for users who need Web3 protocol audit, coding debug, or security triage.

Architecture:

```text
User codebase / bug report
  ↓
Scope parser
  ↓
Log / test failure analyzer
  ↓
Threat model / exploit hypothesis generator
  ↓
Patch suggestion / evidence planner
  ↓
Validator scoring methodology generator
  ↓
Wanted order / agent execution draft
```

Capabilities:

```text
- turns Web3 coding debug needs into structured audit/debug scope
- identifies contract/program boundaries
- analyzes logs, tests, and user-provided context
- defines severity levels and expected evidence
- drafts vulnerability checklist and validator rubric
- estimates bounty / fee after user submits the form
```

Backing / credibility:

```text
- GLM-4.5 Flash assisted debug and audit reasoning
- human auditor / miner execution when posted to hall
- validator scoring and dispute review
- artifact hash / URI recording
- Cobo mock escrow approval for payout control
```

Current status:

```text
MVP:
  formalized Web3 debug form
  agent-generated fee estimate
  task enters hall with Agent is working status

Future:
  deeper repo ingestion, test runner integration, private TEE mode
```

### Data Mining Agent Detail

The dataset agent should be described as a platform service for users who want a specific dataset but do not know how to specify collection, cleaning, schema, or validation.

Architecture:

```text
User dataset intent
  ↓
Requirement parser
  ↓
Source / scope planner
  ↓
Schema designer
  ↓
Cleaning and deduplication policy generator
  ↓
Validator scoring methodology generator
  ↓
Human miner order draft
```

Capabilities:

```text
- turns natural language dataset requests into structured dataset specs
- proposes fields, schema, format, and size
- defines filtering and cleaning rules
- drafts validator methodology and scoring rubric
- suggests threshold / refund rules
- generates order artifacts for the miner marketplace
```

Backing / credibility:

```text
- z.ai model-assisted specification drafting
- validator review methodology
- JSONL/schema parseability checks
- human miner marketplace for collection and production
- Cobo mock escrow approval for reward-pool funding
```

Current status:

```text
MVP:
  formalized dataset request form
  agent-generated cost estimate
  task enters hall with Agent is working status

Future:
  full interactive dataset-agent flow
```

### Spec / Warrant Drafting Agent Detail

The spec agent powers the third bubble and keeps the previous chatbot logic.

```text
User custom task idea
  ↓
Natural language parser
  ↓
Scoring methodology generator
  ↓
Reward / settlement strategy generator
  ↓
Miner output requirements
  ↓
Validator checklist
  ↓
Wanted order draft for public hall
```

Capabilities:

```text
- turns natural language requests into structured task warrants
- drafts task rubric, reward pool, refund rule, and dispute trigger
- creates miner output requirements and validator checklist
- prepares order artifacts for the public hall
```

Backing / credibility:

```text
- z.ai model-assisted audit scope drafting
- human auditor / miner execution
- validator scoring and dispute review
- artifact hash / URI recording
- Cobo mock escrow approval for payout control
```

Current status:

```text
MVP:
  existing chat-first order drafting flow

Future:
  richer strategy questions and reusable task warrant templates
```

### Relationship To Define New Task

The three bubbles on `Define New Task` should route naturally to these killer / agent concepts.

```text
Web3 debug bubble:
  routes to formalized Debug Killer form

Dataset bubble:
  routes to formalized Data Mining Agent form

Custom task warrant bubble:
  routes to the existing order-drafting chat flow
```

---

## 5. Cobo Wallet Integration In The Frontend

### Product Role

Cobo should not feel like a separate page that users must understand before using the product. It should appear as a wallet and approval layer inside the task lifecycle.

Recommended frontend integration:

```text
1. A small Wallet / Approval widget in the sidebar or top-right area.
2. A Cobo approval panel inside Define New Task confirmation.
3. Settlement status inside Activities detail.
```

### Sidebar Wallet Widget

The sidebar can include a compact wallet status block:

```text
Cobo Wallet
Connected / Mock connected
Task wallet: 0x1234...abcd
Pending approvals: 1
```

Actions:

```text
Connect wallet
View approvals
```

For MVP:

```text
Mock connected
```

### Define New Task Cobo Panel

When the user confirms a new task, show a Cobo Pact preview and Reward Pool escrow requirement:

```text
Cobo Pact Draft
  Reward Pool: user-entered amount, e.g. 0.01 ETH
  Gas fee: separate wallet/network cost, not part of Reward Pool
  AI threshold line: 72/100
  Refund rule:
    If all miner submissions score below the threshold,
    most of the Reward Pool is refunded to the user.
  Allowed contract: ComputeOutsourcePlatform
  Allowed functions:
    createTask
    fundTask
    finalizeEvaluation
    claimReward
  Always review:
    withdraw
    slashValidator
```

Primary button:

```text
Approve Reward Pool escrow and create task
```

For MVP:

```text
Mock approve Reward Pool escrow and create task
```

For real integration:

```text
Clicking approve calls backend:
  POST /wallet/cobo/pacts

Backend creates Pact through Cobo API.
Frontend shows:
  Waiting for mobile approval
  Approved
  Transaction submitted
  Task active
```

### Activities Cobo Settlement Status

Activity details should show Cobo settlement state:

```text
Cobo settlement
  Pending approval
  Approved
  Settlement transaction submitted
  Reward distributed
```

For settled rows:

```text
Settled via Cobo policy
Tx: 0xabc...123
```

For pending rows:

```text
Waiting for Cobo approval
```

### Why This Fits The Architecture

Cobo belongs at moments where money or contract authority changes:

```text
Create task:
  fund reward pool

Worker / validator stake:
  register and stake

Settlement:
  distribute rewards

Risky actions:
  withdraw / slash / policy change
```

So the frontend should expose Cobo as contextual approval state, not as the main task workflow.

---

## 6. Navigation

The top-level navigation should be:

```text
Define New Task
Wanted Order Hall
Activities
Hall-of-Fame Killer Agents
```

Optional later pages:

```text
Audit Dashboard
Wallet Settings
Reputation
```

For now, the product should not start with many separate dashboard pages. The first demo should make the task creation, marketplace, and personal activity loop obvious.

---

## 7. MVP Frontend State Flow

```text
Intro page
        ↓
Click anywhere to start
        ↓
Floating login modal
        ↓
Enter main app
        ↓
Define New Task: three large horizontal bubbles
        ↓
User chooses one of three paths
        ↓
Branch A: Web3 coding debug
  open formalized Debug Killer form

Branch B: Dataset
  open formalized Data Mining Agent form

Branch C: Custom task warrant
  open existing chat-first order drafting workflow
        ↓
Agent drafts / estimates:
  task scope
  evaluation rubric
  reward / bounty estimate
  settlement logic
        ↓
User reviews wanted order preview
        ↓
User approves bounty escrow through Cobo approval / mock approval
        ↓
Task status becomes Active / On-chain mock
        ↓
Task appears in Wanted Order Hall as retro wanted poster
        ↓
If platform agent path:
  poster status shows Agent is working
        ↓
User clicks wanted poster to inspect details
        ↓
Miner chooses "I wanna mine"
        ↓
Miner submits output
        ↓
Mining activity appears in Activities as Unscored
        ↓
Validator chooses "I wanna validate"
        ↓
Validator submits score
        ↓
Validation activity appears in Activities as Scored
        ↓
AI audit result + settlement updates Activities
```

---

## 8. Implementation Notes

Current backend can support this flow with:

```text
POST /tasks/criteria
POST /tasks
GET  /tasks
GET  /tasks/:taskId
POST /tasks/:taskId/submissions
POST /tasks/:taskId/evaluations
```

Additional frontend state needed:

```text
activities:
  local projection from submissions + evaluations + settlement state

selectedTask:
  wanted order detail drawer/page

selectedActivity:
  activity detail drawer/page

wallet:
  Cobo connection state / mock approval state
```

Current mock agent behavior:

```text
Platform Debug Killer:
  formalized Web3 debug / audit form
  cost / bounty estimate
  creates Wanted Order Hall item with Agent is working status

Platform Data Mining Agent:
  formalized dataset request form
  cost / bounty estimate
  creates Wanted Order Hall item with Agent is working status

Spec / Warrant Agent:
  previous chatbot logic
  drafts methodology, strategy questions, and computation order preview

AI Audit Agent:
  returns a mock reference score after validator evaluation

Hall-of-Fame Killer Agents:
  show avatar, rating, architecture, open reviews, and submit-review affordance
```

No real z.ai, Cobo, or on-chain transaction is required for the first UI demo. The UI can label confirmed tasks as:

```text
On-chain mock
```

and Cobo actions as:

```text
Cobo mock approval
```

until the real contract and wallet integration are connected.
