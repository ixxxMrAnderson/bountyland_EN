// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReputationManager} from "./ReputationManager.sol";

abstract contract ResultManager is ReputationManager {
    function _submitResult(
        uint256 taskId,
        address worker,
        address validator,
        uint256 workerScore,
        uint256 validatorScore,
        string calldata reportURI,
        bytes32 reportHash
    ) internal {
        Task storage task = _tasks[taskId];
        require(task.status == TaskStatus.Open, "task not open");
        require(workerScore <= _SCORE_SCALE, "worker score out of range");
        require(validatorScore <= _SCORE_SCALE, "validator score out of range");
        require(_submissions[taskId][worker].submitted, "submission not found");
        require(!_results[taskId][worker].submitted, "result submitted");

        if (validator != address(0)) {
            require(_validators[validator].active, "validator not active");
            require(validator != worker, "validator cannot score self");
        }

        _results[taskId][worker] = Result({
            validator: validator,
            workerScore: workerScore,
            validatorScore: validatorScore,
            reportURI: reportURI,
            reportHash: reportHash,
            submitted: true
        });

        task.totalFinalScore += workerScore;
        task.evaluatedWorkerCount += 1;

        _updateWorkerReputation(worker, workerScore);
        if (validator != address(0)) {
            task.validatedResultCount += 1;
            _updateValidatorReputation(validator, validatorScore);
        }

        emit ResultSubmitted(
            taskId,
            worker,
            validator,
            workerScore,
            validatorScore,
            reportURI,
            reportHash
        );
    }

    function _finalizeTask(
        uint256 taskId,
        address[] calldata recipients,
        uint256[] calldata bpsShares
    ) internal {
        Task storage task = _tasks[taskId];
        require(task.status == TaskStatus.Open, "task not open");
        require(recipients.length > 0, "empty recipients");
        require(recipients.length == bpsShares.length, "length mismatch");
        require(
            block.timestamp > task.deadline || (task.workerCount > 0 && task.evaluatedWorkerCount == task.workerCount),
            "task still active"
        );

        task.status = TaskStatus.Finalized;

        uint256 allocatedReward = _allocateRewardsByBps(taskId, task.rewardPool, recipients, bpsShares);
        uint256 refundAmount = task.rewardPool - allocatedReward;
        if (refundAmount > 0) {
            _pendingRewards[task.creator] += refundAmount;
        }

        task.allocatedReward = allocatedReward;
        task.refundedReward = refundAmount;

        emit TaskFinalized(taskId, allocatedReward, refundAmount);
    }

    function _allocateRewardsByBps(
        uint256 taskId,
        uint256 rewardPool,
        address[] calldata recipients,
        uint256[] calldata bpsShares
    ) internal returns (uint256 allocatedReward) {
        uint256 totalBps = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "zero recipient");
            require(bpsShares[i] > 0, "zero share");
            totalBps += bpsShares[i];
            require(totalBps <= _MAX_BPS, "shares exceed 100%");

            uint256 amount = (rewardPool * bpsShares[i]) / _MAX_BPS;
            allocatedReward += amount;
            _pendingRewards[recipients[i]] += amount;
            emit RewardAllocated(taskId, recipients[i], bpsShares[i], amount);
        }
    }
}
