const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

describe("ComputeOutsourcePlatform", function () {
  it("allocates task rewards by result-oracle submitted BPS shares", async function () {
    const [, oracle, creator, worker1, worker2, validator] = await ethers.getSigners();
    const minWorkerStake = ethers.parseEther("0.001");
    const minValidatorStake = ethers.parseEther("0.005");
    const rewardPool = ethers.parseEther("1");

    const Factory = await ethers.getContractFactory("ComputeOutsourcePlatform");
    const platform = await Factory.deploy(
      oracle.address,
      minWorkerStake,
      minValidatorStake,
    );
    await platform.waitForDeployment();

    await platform.connect(worker1).registerWorker({ value: minWorkerStake });
    await platform.connect(worker2).registerWorker({ value: minWorkerStake });
    await platform.connect(validator).registerValidator({ value: minValidatorStake });

    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = BigInt(latestBlock.timestamp + 3600);
    await platform.connect(creator).createTask(
      "ipfs://task",
      "ipfs://order",
      ethers.ZeroHash,
      deadline,
      { value: rewardPool },
    );

    await platform.connect(worker1).submitWorkerOutput(
      1,
      "ipfs://output-1",
      ethers.keccak256(ethers.toUtf8Bytes("output-1")),
    );
    await platform.connect(worker2).submitWorkerOutput(
      1,
      "ipfs://output-2",
      ethers.keccak256(ethers.toUtf8Bytes("output-2")),
    );

    await platform.connect(oracle).submitResult(
      1,
      worker1.address,
      validator.address,
      90,
      80,
      "ipfs://report-1",
      ethers.keccak256(ethers.toUtf8Bytes("report-1")),
    );
    await platform.connect(oracle).submitResult(
      1,
      worker2.address,
      validator.address,
      70,
      80,
      "ipfs://report-2",
      ethers.keccak256(ethers.toUtf8Bytes("report-2")),
    );

    await platform.connect(oracle).finalizeTask(
      1,
      [validator.address, worker1.address, worker2.address],
      [1000, 4500, 2700],
    );

    assert.equal(await platform.pendingRewards(validator.address), ethers.parseEther("0.1"));
    assert.equal(await platform.pendingRewards(worker1.address), ethers.parseEther("0.45"));
    assert.equal(await platform.pendingRewards(worker2.address), ethers.parseEther("0.27"));
    assert.equal(await platform.pendingRewards(creator.address), ethers.parseEther("0.18"));

    const stats = await platform.getTaskStats(1);
    assert.equal(stats.allocatedReward, ethers.parseEther("0.82"));
    assert.equal(stats.refundedReward, ethers.parseEther("0.18"));
  });
});
