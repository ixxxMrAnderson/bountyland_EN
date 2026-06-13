// ============================================================================
// Aurora Agent Core API client
// Dev: Vite proxy /api → http://127.0.0.1:8791
// ============================================================================

const API_BASE = '/api';

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface IntakeResponse {
  status: 'needs_confirmation' | 'awaiting_price_confirmation' | 'ready';
  ready: boolean;
  agent_message?: string;
  missing_fields?: string[];
  suggested_price?: number;
  user_budget?: number | null;
  draft_task?: Record<string, unknown>;
  task_spec?: Record<string, unknown>;
  usage?: {
    agent: string;
    llm?: {
      provider: string;
      model: string;
      total_tokens: number;
    };
    pricing?: {
      suggested_price: number;
      user_budget: number | null;
      currency: string;
    };
  };
}

export interface ExecutionArtifact {
  type: 'debug_report' | 'repo_context' | 'runtime' | 'trace' | 'patch' | 'modified_repo';
  path: string;
}

export interface ExecutionSummary {
  repo_url?: string;
  test_command?: string;
  reproduced?: boolean;
  returncode?: number;
  candidate_files?: number;
  patch_generated?: boolean;
  verification_returncode?: number;
  patch_iterations?: number;
  cleanup_repo?: boolean;
}

export interface ExecutionResult {
  task_id?: string;
  status?: string;
  summary?: ExecutionSummary;
  artifacts?: ExecutionArtifact[];
  usage?: {
    miner?: string;
    repo_cloned?: boolean;
    commands_run?: number;
    initial_returncode?: number;
    patch_iterations?: number;
    patch_generated?: boolean;
    files_modified?: number;
    verification_returncode?: number;
    cleanup_repo?: boolean;
    llm?: {
      provider: string;
      model: string;
      calls: number;
      total_tokens: number;
    };
    llm_total_tokens?: number;
  };
}

export interface ExecuteResponse {
  intake: IntakeResponse;
  execution: ExecutionResult | null;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * POST /v1/intake
 * Analyse the user's debug request and return a task spec + suggested price.
 */
export async function intakeDebug(userInput: string): Promise<IntakeResponse> {
  const res = await fetch(`${API_BASE}/v1/intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_input: userInput,
      use_llm: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Intake failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * POST /v1/execute
 * Confirm price and execute the debug miner.
 *
 * NOTE: /v1/execute re-runs TaskIntakeGraph internally before routing to the
 * miner, so user_input must contain the FULL original request text.
 */
export async function executeDebug(params: {
  userInput: string;
  userBudget: number;
  outputDir?: string;
}): Promise<ExecuteResponse> {
  const res = await fetch(`${API_BASE}/v1/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_input: params.userInput,
      price_confirmed: true,
      user_budget: params.userBudget,
      use_llm: true,
      output_dir: params.outputDir ?? 'artifacts/frontend_debug_run',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Execute failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * GET /health
 */
export async function healthCheck(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
