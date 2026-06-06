# Frontend Product Design

This file defines the frontend experience for the MVP.

The frontend should focus on three primary topic pages:

```text
1. Define New Task
2. Active Tasks
3. Activities
```

The goal is to make task creation feel like a natural-language agent workflow, while keeping the marketplace of executable tasks easy for miners and validators to browse.

---

## 1. Define New Task

### Core Idea

This page is where the user defines a new compute outsourcing task.

The user should not start from a form with many fields. The first screen should feel closer to a ChatGPT-style initial input state:

```text
Centered natural language input box
Prompt placeholder:
  "Describe the dataset, computation, or AI task you want to outsource..."
```

Example user input:

```text
帮我外包生成一个高质量的 reasoning QA 数据集，包含 1000 条问题、标准答案和简短推理过程。
```

After the user submits, the page transforms into an interactive conversation interface.

### Layout Option A: Split-Screen Task Builder

After the initial input, the page can become a two-column workspace:

```text
┌──────────────────────────────┬──────────────────────────────┐
│ User Task Definition          │ z.ai Agent                   │
│ natural language task         │ mock criteria assistant      │
│ budget / deadline / audit     │ validator standards          │
│ confirmation controls         │ order preview                │
└──────────────────────────────┴──────────────────────────────┘
```

Left side:

```text
- User's original task description
- Editable task summary
- Reward budget
- Deadline
- AI audit enabled / disabled
- Final confirmation button
```

Right side:

```text
- z.ai Agent conversation
- Generated validator acceptance criteria
- Pass / fail conditions
- Validator checklist
- Reward rule suggestion
- Dispute trigger
- Computation order preview
```

Important:

```text
The z.ai Agent is currently a mock agent.
It should be visually branded as z.ai Agent for the demo,
but the implementation does not need to connect to a real z.ai API yet.
```

### Layout Option B: Chat-First Task Builder

The simpler MVP version can be a chat-style flow:

```text
Initial state:
  centered input box

After submit:
  conversation thread appears
  user message shown first
  z.ai Agent returns criteria options
  user selects one option
  z.ai Agent generates computation order
  user confirms
```

Suggested flow:

```text
1. User describes task in natural language.
2. z.ai Agent returns 2-3 validator acceptance criteria options.
3. User selects one criteria option.
4. z.ai Agent generates:
   - task summary
   - miner output requirements
   - validator checklist
   - pass / fail condition
   - AI threshold line
   - reward rule
   - dispute trigger
   - taskURI / orderURI / criteriaHash preview
   - Cobo Pact policy draft
5. User confirms task creation.
6. Task is created on-chain or mocked as on-chain for the demo.
7. Task appears in Active Tasks.
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
  0.1 ETH reward pool.

Deposit:
  User pays a task deposit before the task becomes active.

AI threshold line:
  72/100
  If all miner submissions fail to pass this threshold,
  most of the deposit is refunded to the user.

Audit:
  AI audit enabled.

Contract:
  createTask(taskURI, orderURI, criteriaHash, deadline, aiAuditEnabled)
```

Primary action:

```text
Pay deposit and create task
```

After confirmation:

```text
Task created.
Deposit paid.
Status: Active
Available for miners.
```

Then the task should pop into the second topic page: `Active Tasks`.

---

## 2. Active Tasks

### Core Idea

This page shows tasks that have already been created and are available for miners to accept.

For the MVP, tasks can be treated as already on-chain once the user confirms creation in the mock flow.

Each task card should visualize:

```text
- task overview
- number of miner submissions
- reward overview
- AI audit status
- selected validator criteria
- two role actions:
  - I wanna mine
  - I wanna validate
```

Each active task card should also be clickable. Clicking the card opens a floating rectangular detail modal. The modal sits above the page, has a close button in the top-right corner, and keeps the user in the same page context.

The two role actions should be available both on the card and inside the floating detail modal.

### Task Card Structure

Each active task should be displayed as a compact card:

```text
┌────────────────────────────────────────────┐
│ Reasoning QA Dataset Generation            │
│ Generate 1000 QA records with answers...    │
│                                            │
│ Status: On-chain / Active                  │
│ Miner submissions: 3                       │
│ Reward pool: 0.1 ETH                       │
│ AI audit: Enabled                          │
│ Criteria: Dataset quality and diversity    │
│                                            │
│ [I wanna mine] [I wanna validate]           │
└────────────────────────────────────────────┘
```

Click behavior:

```text
Click card body:
  open floating task detail modal

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

### Task Detail View

When a user clicks an active task card, show a floating rectangular task detail modal:

```text
┌────────────────────────────────────────────────────────────┐
│ Task details                                           [x] │
│                                                            │
│ ...task content...                                         │
│                                                            │
│ [I wanna mine] [I wanna validate]                           │
└────────────────────────────────────────────────────────────┘
```

Modal behavior:

```text
- opens above Active Tasks without navigating away
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
  deposit amount
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

Deposit / refund rule
  deposit paid by user
  if all miner submissions score below the AI threshold line,
  most of the deposit is refunded to the user

Submissions
  miner submission count
  latest submission status

Actions
  I wanna mine
  I wanna validate
```

This view should make the task feel like an actual order that has already been created and can now be worked on.

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
Active Tasks
Activities
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
Deposit / refund rule if relevant
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

## 4. Cobo Wallet Integration In The Frontend

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

When the user confirms a new task, show a Cobo Pact preview and deposit payment requirement:

```text
Cobo Pact Draft
  Deposit: 0.1 ETH
  Reward budget: 0.1 ETH
  AI threshold line: 72/100
  Refund rule:
    If all miner submissions score below the threshold,
    most of the deposit is refunded to the user.
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
Approve deposit and create task
```

For MVP:

```text
Mock approve deposit and create task
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

## 5. Navigation

The top-level navigation should be:

```text
Define New Task
Active Tasks
Activities
```

Optional later pages:

```text
Audit Dashboard
Wallet Settings
Reputation
```

For now, the product should not start with many separate dashboard pages. The first demo should make the task creation, marketplace, and personal activity loop obvious.

---

## 6. MVP Frontend State Flow

```text
Define New Task initial input
        ↓
User submits task description
        ↓
z.ai Agent mock returns validator criteria options
        ↓
User selects criteria
        ↓
z.ai Agent mock returns computation order preview
        ↓
User confirms task
        ↓
User pays deposit through Cobo approval / mock approval
        ↓
Task status becomes Active / On-chain mock
        ↓
Task appears in Active Tasks
        ↓
User clicks task card to inspect details
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

## 7. Implementation Notes

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
  active task detail drawer/page

selectedActivity:
  activity detail drawer/page

wallet:
  Cobo connection state / mock approval state
```

Current mock agent behavior:

```text
Task Criteria Agent:
  returns validator acceptance criteria from local templates

AI Audit Agent:
  returns a mock reference score after validator evaluation
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
