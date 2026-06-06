# Contracts

`src/ComputeOutsourcePlatform.sol` is the first Solidity scaffold from Sec 2 of the product spec.

It includes:

- task creation with `taskURI`, `orderURI`, `criteriaHash`, deadline, and AI audit flag
- worker and validator registration
- worker output commitments
- validator score submission
- AI audit score submission
- final score calculation using validator reputation
- basic worker reward claim

This contract is intentionally minimal for hackathon iteration. The next step is adding a Foundry or Hardhat test harness and replacing the mock oracle signature check with a real signer verification path.
