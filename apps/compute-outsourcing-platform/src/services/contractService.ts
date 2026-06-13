// ============================================================================
// ComputeOutsourcePlatform — Sepolia contract interaction
// Contract: 0xD64381BF72758857da7151B7d197BFcF23b97339
// ============================================================================

import { ethers } from 'ethers';

// ---------------------------------------------------------------------------
// Contract metadata
// ---------------------------------------------------------------------------

const CONTRACT_ADDRESS = '0xD64381BF72758857da7151B7d197BFcF23b97339';

const CONTRACT_ABI: any[] = [
  // ---- createTask ----
  {
    inputs: [
      { internalType: 'string', name: 'taskURI', type: 'string' },
      { internalType: 'string', name: 'orderURI', type: 'string' },
      { internalType: 'bytes32', name: 'criteriaHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'createTask',
    outputs: [{ internalType: 'uint256', name: 'taskId', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  // ---- getTaskCore (view) ----
  {
    inputs: [{ internalType: 'uint256', name: 'taskId', type: 'uint256' }],
    name: 'getTaskCore',
    outputs: [
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'string', name: 'taskURI', type: 'string' },
      { internalType: 'string', name: 'orderURI', type: 'string' },
      { internalType: 'bytes32', name: 'criteriaHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'uint8', name: 'status', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // ---- getTaskStats (view) ----
  {
    inputs: [{ internalType: 'uint256', name: 'taskId', type: 'uint256' }],
    name: 'getTaskStats',
    outputs: [
      { internalType: 'uint256', name: 'rewardPool', type: 'uint256' },
      { internalType: 'uint256', name: 'totalFinalScore', type: 'uint256' },
      { internalType: 'uint256', name: 'allocatedReward', type: 'uint256' },
      { internalType: 'uint256', name: 'refundedReward', type: 'uint256' },
      { internalType: 'uint256', name: 'workerCount', type: 'uint256' },
      { internalType: 'uint256', name: 'evaluatedWorkerCount', type: 'uint256' },
      { internalType: 'uint256', name: 'validatedResultCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // ---- nextTaskId ----
  {
    inputs: [],
    name: 'nextTaskId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ---- TaskCreated event ----
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'taskId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'string', name: 'taskURI', type: 'string' },
      { indexed: false, internalType: 'string', name: 'orderURI', type: 'string' },
      { indexed: false, internalType: 'bytes32', name: 'criteriaHash', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'rewardPool', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'TaskCreated',
    type: 'event',
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateTaskResult {
  taskId: number;
  txHash: string;
  rewardPool: string; // ETH string
  blockNumber: number;
}

export interface TaskCore {
  creator: string;
  taskURI: string;
  orderURI: string;
  criteriaHash: string;
  deadline: number;
  status: number; // 0=Created, 1=Funded, 2=InProgress, 3=Completed, 4=Cancelled, 5=Finalized
}

export interface TaskStats {
  rewardPool: string;
  totalFinalScore: number;
  allocatedReward: string;
  refundedReward: string;
  workerCount: number;
  evaluatedWorkerCount: number;
  validatedResultCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getProvider(): ethers.BrowserProvider {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to interact with the contract.');
  }
  return new ethers.BrowserProvider((window as any).ethereum);
}

async function getContract(): Promise<ethers.Contract> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// ---------------------------------------------------------------------------
// Write: createTask
// ---------------------------------------------------------------------------

/**
 * Create a task on-chain and deposit ETH as the reward pool.
 *
 * NOTE: This sends a real transaction on Sepolia testnet and costs gas + the
 * reward pool amount in Sepolia ETH. MetaMask will prompt the user to confirm.
 */
export async function createTaskOnChain(params: {
  taskURI: string;
  orderURI: string;
  criteriaHash: string; // bytes32 hex string
  deadline: number; // Unix timestamp (seconds)
  rewardPoolEth: number; // ETH amount
}): Promise<CreateTaskResult> {
  const contract = await getContract();
  const valueWei = ethers.parseEther(params.rewardPoolEth.toString());

  // Validate criteriaHash format
  if (!ethers.isHexString(params.criteriaHash, 32)) {
    throw new Error(`criteriaHash must be a 32-byte hex string. Got: ${params.criteriaHash}`);
  }

  const tx = await contract.createTask(
    params.taskURI,
    params.orderURI,
    params.criteriaHash,
    params.deadline,
    { value: valueWei },
  );

  // Wait for block confirmation
  const receipt = await tx.wait();

  // Extract taskId from the TaskCreated event
  let taskId = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: [...log.topics], data: log.data });
      if (parsed?.name === 'TaskCreated') {
        taskId = Number(parsed.args.taskId);
        break;
      }
    } catch {
      // ignore logs that can't be parsed by this contract
    }
  }

  if (taskId === 0) {
    throw new Error('Transaction succeeded but could not find TaskCreated event — contract may not have emitted it.');
  }

  return {
    taskId,
    txHash: receipt.hash,
    rewardPool: params.rewardPoolEth.toString(),
    blockNumber: receipt.blockNumber,
  };
}

// ---------------------------------------------------------------------------
// Read: getTaskCore / getTaskStats
// ---------------------------------------------------------------------------

export async function getTaskCore(taskId: number): Promise<TaskCore> {
  const contract = await getContract();
  const result = await contract.getTaskCore(taskId);
  return {
    creator: result.creator,
    taskURI: result.taskURI,
    orderURI: result.orderURI,
    criteriaHash: result.criteriaHash,
    deadline: Number(result.deadline),
    status: Number(result.status),
  };
}

export async function getTaskStats(taskId: number): Promise<TaskStats> {
  const contract = await getContract();
  const result = await contract.getTaskStats(taskId);
  return {
    rewardPool: ethers.formatEther(result.rewardPool),
    totalFinalScore: Number(result.totalFinalScore),
    allocatedReward: ethers.formatEther(result.allocatedReward),
    refundedReward: ethers.formatEther(result.refundedReward),
    workerCount: Number(result.workerCount),
    evaluatedWorkerCount: Number(result.evaluatedWorkerCount),
    validatedResultCount: Number(result.validatedResultCount),
  };
}

export async function getNextTaskId(): Promise<number> {
  const contract = await getContract();
  return Number(await contract.nextTaskId());
}
