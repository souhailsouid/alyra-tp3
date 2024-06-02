# Voting Smart Contract Tests

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

The tests for the Voting smart contract are located in the `voting.test.ts` file. The tests cover various scenarios to ensure the contract behaves as expected.

## Test Overview

### Initialization

#### Deploying the Contract
- **Ensures the contract is deployed successfully.**
- **Verifies the owner of the contract.**

### Registering Candidates

#### Non-owners Cannot Register Candidates
- **Verifies that only the contract owner can register candidates.**

#### Owner Can Register Candidates
- **Ensures the owner can successfully register candidates.**

#### Prevent Duplicate Candidate Registration
- **Ensures the owner cannot register the same candidate twice.**

### Starting Proposals Registering

#### Non-owners Cannot Start Proposals Registering
- **Verifies that only the contract owner can start the proposals registering phase.**

#### Owner Can Start Proposals Registering
- **Ensures the owner can start the proposals registering phase and emits the appropriate event.**

#### Push GENESIS Proposal
- **Verifies that the first proposal (GENESIS) is automatically added when proposals registering starts.**

### Adding and Retrieving Proposals

#### Registered Voters Can Add Proposals
- **Ensures registered voters can add proposals.**

#### Unregistered Addresses Cannot Add Proposals
- **Verifies that unregistered addresses cannot add proposals.**

#### Retrieve Proposals
- **Ensures registered voters can retrieve their proposals.**

### Ending Proposals Registering

#### Non-owners Cannot End Proposals Registering
- **Verifies that only the contract owner can end the proposals registering phase.**

#### Owner Can End Proposals Registering
- **Ensures the owner can end the proposals registering phase and emits the appropriate event.**

### Starting Voting Session

#### Non-owners Cannot Start Voting Session
- **Verifies that only the contract owner can start the voting session.**

#### Owner Can Start Voting Session
- **Ensures the owner can start the voting session and emits the appropriate event.**

### Setting Votes

#### Voting Before Voting Session Starts
- **Verifies that voters cannot vote before the voting session starts.**

#### Voting for Non-existent Proposals
- **Ensures voters cannot vote for proposals that do not exist.**

#### Voting Once
- **Ensures voters can only vote once.**

#### Valid Voting
- **Ensures voters can vote for valid proposals and the vote is recorded.**

### Ending Voting Session

#### Non-owners Cannot End Voting Session
- **Verifies that only the contract owner can end the voting session.**

#### Owner Can End Voting Session
- **Ensures the owner can end the voting session and emits the appropriate event.**

### Tallying Votes

#### Non-owners Cannot Tally Votes
- **Verifies that only the contract owner can tally votes.**

#### Tally Votes After Voting Session Ends
- **Ensures the owner can tally votes only after the voting session ends.**

#### Record Winning Proposal
- **Verifies that the winning proposal is correctly recorded.**

## Running the Tests

To run the tests, use the following command:

```bash
npx hardhat test
```

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
