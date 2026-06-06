// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ComputeOutsourcePlatform {
    uint256 public nextTaskId = 1;
    uint256 public constant MAX_REPUTATION = 100;

    struct Task {
        address creator;
        string taskURI;
        string orderURI;
        bytes32 criteriaHash;
        uint256 rewardBudget;
        uint256 deadline;
        bool aiAuditEnabled;
        bool finalized;
    }

    struct WorkerSubmission {
        address worker;
        string outputURI;
        bytes32 outputHash;
        bool submitted;
    }

    struct Evaluation {
        address validator;
        uint256 validatorScore;
        uint256 aiScore;
        uint256 finalScore;
        bool validatorSubmitted;
        bool aiSubmitted;
        bool finalized;
    }

    struct ValidatorProfile {
        uint256 stake;
        uint256 reputation;
        bool active;
    }

    mapping(uint256 => Task) public tasks;
    mapping(uint256 => mapping(address => WorkerSubmission)) public submissions;
    mapping(uint256 => mapping(address => Evaluation)) public evaluations;
    mapping(address => ValidatorProfile) public validators;
    mapping(address => bool) public workers;

    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        string taskURI,
        string orderURI,
        bytes32 criteriaHash,
        uint256 rewardBudget
    );
    event WorkerRegistered(address indexed worker);
    event ValidatorRegistered(address indexed validator, uint256 stake);
    event WorkerOutputSubmitted(uint256 indexed taskId, address indexed worker, string outputURI);
    event ValidatorScoreSubmitted(uint256 indexed taskId, address indexed worker, address indexed validator, uint256 score);
    event AIScoreSubmitted(uint256 indexed taskId, address indexed worker, uint256 aiScore);
    event EvaluationFinalized(uint256 indexed taskId, address indexed worker, uint256 finalScore, uint256 delta);

    function createTask(
        string calldata taskURI,
        string calldata orderURI,
        bytes32 criteriaHash,
        uint256 deadline,
        bool aiAuditEnabled
    ) external payable returns (uint256 taskId) {
        require(msg.value > 0, "reward budget required");
        require(deadline > block.timestamp, "deadline must be future");

        taskId = nextTaskId++;
        tasks[taskId] = Task({
            creator: msg.sender,
            taskURI: taskURI,
            orderURI: orderURI,
            criteriaHash: criteriaHash,
            rewardBudget: msg.value,
            deadline: deadline,
            aiAuditEnabled: aiAuditEnabled,
            finalized: false
        });

        emit TaskCreated(taskId, msg.sender, taskURI, orderURI, criteriaHash, msg.value);
    }

    function registerWorker() external payable {
        workers[msg.sender] = true;
        emit WorkerRegistered(msg.sender);
    }

    function registerValidator() external payable {
        require(msg.value > 0, "validator stake required");
        validators[msg.sender] = ValidatorProfile({
            stake: msg.value,
            reputation: 70,
            active: true
        });
        emit ValidatorRegistered(msg.sender, msg.value);
    }

    function submitWorkerOutput(
        uint256 taskId,
        string calldata outputURI,
        bytes32 outputHash
    ) external {
        require(workers[msg.sender], "worker not registered");
        require(tasks[taskId].creator != address(0), "task not found");

        submissions[taskId][msg.sender] = WorkerSubmission({
            worker: msg.sender,
            outputURI: outputURI,
            outputHash: outputHash,
            submitted: true
        });

        emit WorkerOutputSubmitted(taskId, msg.sender, outputURI);
    }

    function submitValidatorScore(
        uint256 taskId,
        address worker,
        uint256 score
    ) external {
        require(validators[msg.sender].active, "validator not active");
        require(score <= 100, "score out of range");
        require(submissions[taskId][worker].submitted, "submission not found");

        Evaluation storage evaluation = evaluations[taskId][worker];
        evaluation.validator = msg.sender;
        evaluation.validatorScore = score;
        evaluation.validatorSubmitted = true;

        emit ValidatorScoreSubmitted(taskId, worker, msg.sender, score);
    }

    function submitAIScore(
        uint256 taskId,
        address worker,
        uint256 aiScore,
        bytes calldata aiSignature
    ) external {
        require(aiSignature.length > 0, "oracle signature required");
        require(aiScore <= 100, "score out of range");
        require(submissions[taskId][worker].submitted, "submission not found");

        Evaluation storage evaluation = evaluations[taskId][worker];
        evaluation.aiScore = aiScore;
        evaluation.aiSubmitted = true;

        emit AIScoreSubmitted(taskId, worker, aiScore);
    }

    function finalizeEvaluation(uint256 taskId, address worker) external {
        Evaluation storage evaluation = evaluations[taskId][worker];
        require(evaluation.validatorSubmitted, "validator score missing");
        require(evaluation.aiSubmitted, "ai score missing");
        require(!evaluation.finalized, "already finalized");

        ValidatorProfile storage profile = validators[evaluation.validator];
        uint256 delta = _absDiff(evaluation.validatorScore, evaluation.aiScore);
        uint256 validatorTrust = profile.reputation;

        evaluation.finalScore =
            ((validatorTrust * evaluation.validatorScore) + ((MAX_REPUTATION - validatorTrust) * evaluation.aiScore)) /
            MAX_REPUTATION;
        evaluation.finalized = true;

        if (delta <= 20 && profile.reputation < MAX_REPUTATION) {
            profile.reputation += 1;
        } else if (delta > 40 && profile.reputation >= 15) {
            profile.reputation -= 15;
        } else if (delta > 20 && profile.reputation >= 5) {
            profile.reputation -= 5;
        }

        emit EvaluationFinalized(taskId, worker, evaluation.finalScore, delta);
    }

    function claimReward(uint256 taskId) external {
        Task storage task = tasks[taskId];
        Evaluation storage evaluation = evaluations[taskId][msg.sender];
        require(evaluation.finalized, "evaluation not finalized");
        require(!task.finalized, "task reward already claimed");

        task.finalized = true;
        uint256 payout = (task.rewardBudget * evaluation.finalScore) / 100;
        payable(msg.sender).transfer(payout);
    }

    function _absDiff(uint256 left, uint256 right) private pure returns (uint256) {
        return left >= right ? left - right : right - left;
    }
}
