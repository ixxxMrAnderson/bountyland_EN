const apiBaseUrl = "http://127.0.0.1:8787";
const aiThresholdLine = 72;

const state = {
  page: "define",
  criteriaOptions: [],
  selectedCriteriaId: null,
  draftTaskInput: null,
  tasks: [],
  activities: []
};

const elements = {
  pageTitle: document.querySelector("#pageTitle"),
  pageSubtitle: document.querySelector("#pageSubtitle"),
  definePage: document.querySelector("#definePage"),
  activePage: document.querySelector("#activePage"),
  activitiesPage: document.querySelector("#activitiesPage"),
  modalRoot: document.querySelector("#modalRoot"),
  refreshButton: document.querySelector("#refreshButton"),
  pendingApprovals: document.querySelector("#pendingApprovals"),
  navLinks: Array.from(document.querySelectorAll(".nav-link"))
};

elements.navLinks.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});
elements.refreshButton.addEventListener("click", refreshTasks);

await refreshTasks();
render();

function setPage(page) {
  state.page = page;
  render();
}

function render() {
  updateNavigation();
  renderDefinePage();
  renderActivePage();
  renderActivitiesPage();
  elements.pendingApprovals.textContent = state.tasks.length ? "1" : "0";
}

function updateNavigation() {
  const titles = {
    define: ["Define New Task", "Start with natural language. Confirm criteria, deposit, and Cobo mock approval."],
    active: ["Active Tasks", "Tasks that are active/on-chain mock and ready for miners or validators."],
    activities: ["Activities", "Your mined and validated orders, rewards, scores, and reputation changes."]
  };
  const [title, subtitle] = titles[state.page];
  elements.pageTitle.textContent = title;
  elements.pageSubtitle.textContent = subtitle;

  for (const section of [elements.definePage, elements.activePage, elements.activitiesPage]) {
    section.classList.add("hidden");
  }
  document.querySelector(`#${state.page}Page`).classList.remove("hidden");

  elements.navLinks.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === state.page);
  });
}

function renderDefinePage() {
  if (!state.draftTaskInput) {
    elements.definePage.innerHTML = `
      <div class="kickoff">
        <label class="kickoff-label" for="taskPrompt">Define a new task</label>
        <textarea id="taskPrompt" rows="4">帮我外包生成一个高质量的 reasoning QA 数据集，包含 1000 条问题、标准答案和简短推理过程。</textarea>
        <button id="startTaskButton">Submit to z.ai Agent</button>
      </div>
    `;
    document.querySelector("#startTaskButton").addEventListener("click", startTaskConversation);
    return;
  }

  const selectedCriteria = getSelectedCriteria();
  elements.definePage.innerHTML = `
    <div class="split-grid">
      <section class="panel">
        <h2>User task</h2>
        <label>
          Task description
          <textarea id="taskPrompt" rows="5">${escapeHtml(state.draftTaskInput.description)}</textarea>
        </label>
        <div class="form-grid">
          <label>
            Deposit / reward pool ETH
            <input id="rewardBudget" type="number" min="0" step="0.01" value="${state.draftTaskInput.rewardBudgetEth}" />
          </label>
          <label>
            Deadline
            <input id="deadline" value="${escapeHtml(state.draftTaskInput.deadline)}" />
          </label>
        </div>
        <div class="summary-box">
          <strong>AI threshold line: ${aiThresholdLine}/100</strong>
          <span>If all miner submissions fail this line, most of the deposit is refunded.</span>
        </div>
        <button id="confirmTaskButton" ${selectedCriteria ? "" : "disabled"}>Mock approve deposit and create task</button>
      </section>

      <section class="panel">
        <h2>z.ai Agent <span class="muted">(mock)</span></h2>
        <div class="chat-thread">
          <div class="message user-message">${escapeHtml(state.draftTaskInput.description)}</div>
          <div class="message agent-message">I drafted validator acceptance criteria. Choose one before creating the order.</div>
        </div>
        <div class="criteria-list">
          ${state.criteriaOptions.map(renderCriteriaOption).join("")}
        </div>
      </section>
    </div>
  `;

  document.querySelector("#taskPrompt").addEventListener("input", (event) => {
    state.draftTaskInput.description = event.target.value;
  });
  document.querySelector("#rewardBudget").addEventListener("input", (event) => {
    state.draftTaskInput.rewardBudgetEth = Number(event.target.value || 0);
  });
  document.querySelector("#deadline").addEventListener("input", (event) => {
    state.draftTaskInput.deadline = event.target.value;
  });
  document.querySelector("#confirmTaskButton").addEventListener("click", createTask);
  document.querySelectorAll("[data-criteria-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCriteriaId = button.dataset.criteriaId;
      renderDefinePage();
    });
  });
}

function renderActivePage() {
  if (!state.tasks.length) {
    elements.activePage.innerHTML = `<div class="empty-state">No active tasks yet. Create one from Define New Task.</div>`;
    return;
  }

  elements.activePage.innerHTML = `
    <div class="card-list">
      ${state.tasks.map(renderTaskCard).join("")}
    </div>
  `;
  document.querySelectorAll("[data-open-task]").forEach((card) => {
    card.addEventListener("click", () => openTaskModal(Number(card.dataset.openTask)));
  });
  document.querySelectorAll("[data-mine-task]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openMineModal(Number(button.dataset.mineTask));
    });
  });
  document.querySelectorAll("[data-validate-task]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openValidateModal(Number(button.dataset.validateTask));
    });
  });
}

function renderActivitiesPage() {
  if (!state.activities.length) {
    elements.activitiesPage.innerHTML = `<div class="empty-state">No activities yet. Mine or validate an active task first.</div>`;
    return;
  }

  elements.activitiesPage.innerHTML = `
    <div class="activity-list">
      ${state.activities.map(renderActivityCard).join("")}
    </div>
  `;
  document.querySelectorAll("[data-open-activity]").forEach((card) => {
    card.addEventListener("click", () => {
      openActivityModal(card.dataset.openActivity);
    });
  });
}

async function startTaskConversation() {
  const description = document.querySelector("#taskPrompt").value.trim();
  if (!description) {
    return;
  }
  state.draftTaskInput = {
    name: "Reasoning QA dataset generation",
    description,
    taskType: "reasoning_qa_dataset",
    expectedRecords: 1000,
    rewardBudgetEth: 0.1,
    deadline: "48h",
    aiAuditEnabled: true
  };
  const response = await postJson("/tasks/criteria", state.draftTaskInput);
  state.criteriaOptions = response.options;
  state.selectedCriteriaId = response.options[0]?.id || null;
  render();
}

async function createTask() {
  const task = await postJson("/tasks", {
    taskInput: state.draftTaskInput,
    selectedCriteriaId: state.selectedCriteriaId
  });
  state.tasks = [normalizeTask(task), ...state.tasks.filter((item) => item.id !== task.id)];
  state.draftTaskInput = null;
  state.criteriaOptions = [];
  state.selectedCriteriaId = null;
  setPage("active");
}

async function submitMining(taskId) {
  const outputText = document.querySelector("#mineOutput").value;
  const submission = await postJson(`/tasks/${taskId}/submissions`, {
    workerAddress: "0xworker",
    outputText
  });
  const task = getTask(taskId);
  task.submissions = [...(task.submissions || []), submission];
  state.activities.unshift({
    id: makeId(),
    role: "Mining",
    status: "Unscored",
    taskId,
    submission,
    potentialRewardEth: estimateReward(task),
    createdAt: new Date().toISOString()
  });
  closeModal();
  setPage("activities");
}

async function submitValidation(taskId) {
  const task = getTask(taskId);
  const submission = task.submissions?.at(-1);
  if (!submission) {
    return;
  }
  const evaluation = await postJson(`/tasks/${taskId}/evaluations`, {
    submissionId: submission.id,
    validatorScore: Number(document.querySelector("#validatorScore").value),
    validatorReputation: Number(document.querySelector("#validatorReputation").value),
    reason: document.querySelector("#validatorReason").value,
    validatorAddress: "0xvalidator"
  });
  task.evaluations = [...(task.evaluations || []), evaluation];
  state.activities.unshift({
    id: makeId(),
    role: "Validation",
    status: "Scored",
    taskId,
    evaluation,
    potentialRewardEth: estimateValidatorReward(task, evaluation),
    reputationDelta: evaluation.reputationDelta,
    createdAt: new Date().toISOString()
  });
  state.activities
    .filter((activity) => activity.role === "Mining" && activity.taskId === taskId)
    .forEach((activity) => {
      activity.status = "Scored";
      activity.evaluation = evaluation;
      activity.potentialRewardEth = estimateReward(task, evaluation.finalScore);
    });
  closeModal();
  setPage("activities");
}

function openTaskModal(taskId) {
  const task = getTask(taskId);
  openModal(`
    <h2>Task details</h2>
    <div class="detail-grid">
      <section>
        <h3>${escapeHtml(task.order.taskSpec.name)}</h3>
        <p>${escapeHtml(task.order.taskSpec.description)}</p>
        <dl>${renderKeyValues([
          ["Status", "On-chain mock / Active"],
          ["Deadline", task.order.deadline],
          ["Reward pool", `${task.order.rewardBudgetEth} ETH`],
          ["Deposit", `${task.order.rewardBudgetEth} ETH`],
          ["AI threshold line", `${aiThresholdLine}/100`],
          ["Miner submissions", task.submissions?.length || 0]
        ])}</dl>
      </section>
      <section>
        <h3>Validator criteria</h3>
        <p>${escapeHtml(task.order.selectedCriteria.title)}</p>
        <p class="muted">${escapeHtml(task.order.selectedCriteria.passCondition)}</p>
        <p class="muted">Refund rule: if all submissions are below ${aiThresholdLine}, most deposit is refunded.</p>
      </section>
    </div>
    <div class="button-row">
      <button data-modal-mine="${task.id}">I wanna mine</button>
      <button class="secondary-button" data-modal-validate="${task.id}">I wanna validate</button>
    </div>
  `);
  document.querySelector("[data-modal-mine]").addEventListener("click", () => openMineModal(taskId));
  document.querySelector("[data-modal-validate]").addEventListener("click", () => openValidateModal(taskId));
}

function openMineModal(taskId) {
  const task = getTask(taskId);
  openModal(`
    <h2>I wanna mine</h2>
    <div class="detail-grid">
      <section>
        <h3>Computation order</h3>
        <p>${escapeHtml(task.order.taskSpec.description)}</p>
        <dl>${renderKeyValues([
          ["Output format", task.order.taskSpec.minerOutputFormat.format],
          ["Required fields", task.order.taskSpec.minerOutputFormat.fields.join(", ")],
          ["Reward pool", `${task.order.rewardBudgetEth} ETH`],
          ["AI threshold line", `${aiThresholdLine}/100`]
        ])}</dl>
      </section>
      <section>
        <h3>Miner submission</h3>
        <label>
          Output text / URI
          <textarea id="mineOutput" rows="8">{"question":"Why is AI audit useful?","answer":"It provides an independent reference score.","reasoning":"A reference score helps detect validator deviation.","difficulty":"medium","topic":"agent_audit"}</textarea>
        </label>
      </section>
    </div>
    <button id="submitMineButton">Submit output</button>
  `);
  document.querySelector("#submitMineButton").addEventListener("click", () => submitMining(taskId));
}

function openValidateModal(taskId) {
  const task = getTask(taskId);
  const submission = task.submissions?.at(-1);
  if (!submission) {
    openModal(`
      <h2>I wanna validate</h2>
      <p>No miner submissions yet. This task needs a miner before validation.</p>
    `);
    return;
  }

  openModal(`
    <h2>I wanna validate</h2>
    <div class="detail-grid">
      <section>
        <h3>Miner submission</h3>
        <p class="code-preview">${escapeHtml(submission.outputText || submission.outputURI)}</p>
        <dl>${renderKeyValues([
          ["Output hash", shortHash(submission.outputHash)],
          ["Criteria", task.order.selectedCriteria.title],
          ["AI threshold line", `${aiThresholdLine}/100`]
        ])}</dl>
      </section>
      <section>
        <h3>Validator panel</h3>
        <label>
          Score
          <input id="validatorScore" type="number" min="0" max="100" value="92" />
        </label>
        <label>
          Reputation
          <input id="validatorReputation" type="number" min="0" max="100" value="70" />
        </label>
        <label>
          Reason
          <textarea id="validatorReason" rows="4">Output follows the selected criteria and includes required fields.</textarea>
        </label>
      </section>
    </div>
    <button id="submitValidateButton">Submit validation</button>
  `);
  document.querySelector("#submitValidateButton").addEventListener("click", () => submitValidation(taskId));
}

function openActivityModal(activityId) {
  const activity = state.activities.find((item) => item.id === activityId);
  const task = getTask(activity.taskId);
  const amount = formatEth(activity.potentialRewardEth);
  const evaluation = activity.evaluation;
  openModal(`
    <h2>Activity details</h2>
    <dl>${renderKeyValues([
      ["Task", task.order.taskSpec.name],
      ["Role", activity.role],
      ["Status", activity.status],
      ["Reward", `${activity.status === "Settled" ? "+" : "potential +"}${amount} ETH`],
      ["AI threshold line", `${aiThresholdLine}/100`],
      ["Cobo settlement", activity.status === "Settled" ? "Reward distributed" : "Mock approval pending"]
    ])}</dl>
    ${
      evaluation
        ? `<h3>Score details</h3><dl>${renderKeyValues([
            ["Validator score", evaluation.validatorScore],
            ["AI score", evaluation.aiScore],
            ["Delta", evaluation.delta],
            ["Final score", evaluation.finalScore],
            ["Reputation change", evaluation.reputationDelta]
          ])}</dl>`
        : `<p class="muted">Waiting for validator score and AI audit.</p>`
    }
  `);
}

function openModal(content) {
  elements.modalRoot.innerHTML = `
    <div class="modal-backdrop">
      <article class="modal-card">
        <button class="modal-close" aria-label="Close">x</button>
        ${content}
      </article>
    </div>
  `;
  document.querySelector(".modal-close").addEventListener("click", closeModal);
  document.querySelector(".modal-backdrop").addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });
}

function closeModal() {
  elements.modalRoot.innerHTML = "";
  render();
}

function renderCriteriaOption(criteria) {
  const selected = criteria.id === state.selectedCriteriaId ? "selected" : "";
  return `
    <button class="criteria-card ${selected}" data-criteria-id="${criteria.id}">
      <strong>${escapeHtml(criteria.title)}</strong>
      <span>${escapeHtml(criteria.description)}</span>
      <small>${escapeHtml(criteria.passCondition)}</small>
    </button>
  `;
}

function renderTaskCard(task) {
  return `
    <article class="task-card" data-open-task="${task.id}">
      <div>
        <h2>${escapeHtml(task.order.taskSpec.name)}</h2>
        <p>${escapeHtml(task.order.taskSpec.description)}</p>
      </div>
      <dl>${renderKeyValues([
        ["Status", "On-chain mock / Active"],
        ["Miner submissions", task.submissions?.length || 0],
        ["Reward pool", `${task.order.rewardBudgetEth} ETH`],
        ["Criteria", task.order.selectedCriteria.title]
      ])}</dl>
      <div class="button-row">
        <button data-mine-task="${task.id}">I wanna mine</button>
        <button class="secondary-button" data-validate-task="${task.id}">I wanna validate</button>
      </div>
    </article>
  `;
}

function renderActivityCard(activity) {
  const task = getTask(activity.taskId);
  const settled = activity.status === "Settled";
  const amountLabel = `${settled ? "+" : "potential +"}${formatEth(activity.potentialRewardEth)} ETH`;
  const reputation = activity.role === "Validation" ? `<span>Reputation ${formatSigned(activity.reputationDelta)}</span>` : "";
  return `
    <article class="activity-card" data-open-activity="${activity.id}">
      <div>
        <h2>${escapeHtml(task.order.taskSpec.name)}</h2>
        <p>${activity.role} activity | ${activity.status}</p>
        ${reputation}
      </div>
      <strong class="${settled ? "amount-settled" : "amount-potential"}">${amountLabel}</strong>
    </article>
  `;
}

function renderKeyValues(rows) {
  return rows
    .map(([key, value]) => `<dt>${escapeHtml(String(key))}</dt><dd>${escapeHtml(String(value))}</dd>`)
    .join("");
}

async function refreshTasks() {
  try {
    const response = await getJson("/tasks");
    state.tasks = response.tasks.map(normalizeTask);
    render();
  } catch {
    render();
  }
}

function normalizeTask(task) {
  return {
    ...task,
    submissions: task.submissions || [],
    evaluations: task.evaluations || []
  };
}

function getTask(taskId) {
  return state.tasks.find((task) => task.id === Number(taskId));
}

function getSelectedCriteria() {
  return state.criteriaOptions.find((criteria) => criteria.id === state.selectedCriteriaId);
}

function estimateReward(task, score = 80) {
  return (Number(task.order.rewardBudgetEth || 0) * score) / 100;
}

function estimateValidatorReward(task, evaluation) {
  return Number(task.order.rewardBudgetEth || 0) * 0.1 * Number(evaluation.validatorRewardMultiplier || 0);
}

function formatEth(value) {
  return Number(value || 0).toFixed(3);
}

function formatSigned(value) {
  const numeric = Number(value || 0);
  return `${numeric >= 0 ? "+" : ""}${numeric}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function shortHash(hash) {
  return hash ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : "n/a";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getJson(path) {
  const response = await fetch(`${apiBaseUrl}${path}`);
  return parseResponse(response);
}

async function postJson(path, body) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  return parseResponse(response);
}

async function parseResponse(response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}
