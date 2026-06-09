# 合约说明

`src/ComputeOutsourcePlatform.sol` 是当前项目的 MVP 结算合约，目标部署到 Sepolia 测试网，用于任务发布、Worker 接单、结果提交、链上信誉记录和奖池结算。

合约只部署一个主合约：

```text
ComputeOutsourcePlatform
```

源码通过继承做逻辑分层，部署时仍然是一个合约地址：

```text
src/
|-- ComputeOutsourcePlatform.sol
`-- base/
    |-- PlatformBase.sol
    |-- TaskManager.sol
    |-- StakeManager.sol
    |-- ReputationManager.sol
    `-- ResultManager.sol
```

## 已实现能力

- 用户创建任务，并把 ETH 打入任务奖池。
- 用户可以给任务追加资金。
- 用户可以在没有 Worker 提交前取消任务，并取回奖池。
- Worker 注册并提交保证金。
- Validator 注册并提交保证金。
- Worker 和 Validator 都记录 reputation。
- 一个任务支持多个 Worker 提交结果。
- Worker 提交 `outputURI` 和 `outputHash`。
- 后端 / Agent 评审服务通过 `resultOracle` 提交最终结果。
- 合约记录 `workerScore`，并更新 Worker reputation。
- 合约记录 `validatorScore`，并更新 Validator reputation。
- 奖励分配比例由链下后端 / Agent 计算，合约只接收最终收款人和 BPS 比例。
- Worker / Validator / 任务创建者通过 `claimReward()` 主动领取待领取金额。
- 合约使用 pull payment 模式和 reentrancy guard，避免在结算循环里直接转账。

## 任务类型

合约不绑定具体业务类型。

审计任务、数据集任务、标注任务、通用计算任务都可以复用同一套合约。具体任务内容、验收标准、交付物和报告都放在链下，通过 URI 和 hash 记录到链上。

常见字段含义：

```text
taskURI:
任务需求文件地址。

orderURI:
订单详情、数据集要求或补充规则文件地址。

criteriaHash:
验收标准文件的 hash。

outputURI:
Worker 提交结果文件地址。

outputHash:
Worker 提交结果文件 hash。

reportURI:
后端 / Agent / 评审服务生成的评估报告地址。

reportHash:
评估报告 hash。
```

## 评分模型

评分细则全部在链下完成，合约不计算排名、不计算偏离度、不内置奖励规则。

后端、Validator 服务、Agent 和人工评审完成评分后，由 `resultOracle` 调用：

```text
submitResult(taskId, worker, validator, workerScore, validatorScore, reportURI, reportHash)
```

参数含义：

```text
workerScore:
Worker 交付结果的最终评分。用于更新 Worker reputation，也可以被链下 Agent 用来决定排名和奖励比例。

validatorScore:
Validator 本次评判准确度的评分。用于更新 Validator reputation，并作为链上凭证记录。
validatorScore 不直接决定 Validator 奖励金额。
```

## 奖励分配模型

合约没有默认的 Validator 奖池比例，也不会按分数自动分配奖励。

最终奖励由链下后端 / Agent 计算，合约在任务结束时只接收最终分配结果：

```text
finalizeTask(taskId, recipients, bpsShares)
```

参数含义：

```text
recipients:
收款地址列表，可以包含 Worker、Validator 或其他需要结算的地址。

bpsShares:
每个收款地址对应的 BPS 比例。10000 BPS = 100%。
```

示例 1：只给一个获胜 Worker 发全部奖池。

```text
recipients = [worker1]
bpsShares = [10000]
```

示例 2：Validator 获得 10%，前三名 Worker 获得剩余 90% 的 50% / 30% / 20%。

```text
recipients = [validator1, worker1, worker2, worker3]
bpsShares = [1000, 4500, 2700, 1800]
```

如果 `bpsShares` 总和小于 `10000`，剩余奖池会退回给任务创建者的 `pendingRewards`，任务创建者同样通过 `claimReward()` 领取。

## 钱包模型

合约不绑定具体钱包。

普通钱包、前端钱包、后端钱包、Safe、Cobo Agentic Wallet 都可以调用同一套 ABI。钱包连接和交易发起由前端或后端负责，合约只识别：

```text
msg.sender
```

当前推荐后端方案：

- 用户通过前端钱包创建任务、追加资金、注册角色、提交结果、领取奖励。
- 后端控制 `resultOracle` 钱包。
- Agent 和人工评审在链下完成评分、排名和奖励比例计算。
- 后端用 `resultOracle` 钱包调用 `submitResult()` 和 `finalizeTask()`。

## Sepolia 构造参数

部署 `ComputeOutsourcePlatform` 时需要填写：

```text
initialResultOracle:
后端 / 评审服务的钱包地址。只有这个地址能提交最终评分和最终奖励分配。

initialMinWorkerStake:
Worker 最小保证金，单位 wei。

initialMinValidatorStake:
Validator 最小保证金，单位 wei。
```

Demo 推荐值：

```text
initialResultOracle: 后端 / 评审钱包地址
initialMinWorkerStake: 1000000000000000
initialMinValidatorStake: 5000000000000000
```

说明：

```text
1000000000000000 wei = 0.001 ETH
5000000000000000 wei = 0.005 ETH
```

这些参数部署后也可以由 owner 调整：

```text
setStakeRequirements(newMinWorkerStake, newMinValidatorStake)
setResultOracle(newResultOracle)
```

## Hardhat 使用

安装依赖：

```bash
npm install
```

编译合约：

```bash
npm run contracts:compile
```

部署到 Sepolia：

```bash
cp .env.example .env
npm run contracts:deploy:sepolia
```

Windows PowerShell 可以用：

```powershell
copy .env.example .env
npm.cmd run contracts:deploy:sepolia
```

`.env` 必填项：

```text
SEPOLIA_RPC_URL=你的 Sepolia RPC
SEPOLIA_PRIVATE_KEY=部署钱包私钥
RESULT_ORACLE_ADDRESS=后端 / 评审服务钱包地址
MIN_WORKER_STAKE_WEI=1000000000000000
MIN_VALIDATOR_STAKE_WEI=5000000000000000
```

部署成功后，脚本会写入：

```text
contracts/deployments/sepolia.json
```

该文件包含合约地址、部署交易 hash、构造参数和 ABI，属于本地部署产物，默认被 `.gitignore` 忽略。

同时，脚本还会写入一个可提交到仓库的共享配置文件：

```text
packages/shared/src/contracts/compute-platform-sepolia.json
```

这个文件只保留前端和后端调用合约需要的信息：

```text
network
chainId
contract
address
abi
deployment.transactionHash
deployment.blockNumber
```

前端和后端应优先读取这个 shared config 来调用 Sepolia 上已部署的合约。
