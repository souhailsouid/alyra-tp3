# Project

## Backend

1. Lancer la blockchain en local: `npx hardhat node`
2. Déployer le contract Voting.sol: `npx hardhat ignition deploy ./ignition/modules/Voting.ts --network localhost`

### Verification du contrat

Voici le processus pour vérifier le contrat sur le testnet

1. `cp .env.dist .env`
1. `pnpm install`
1. Modifier le .env avec les variables nécessaires
1. Déployer le contrat sur Sepolia
1. `npx hardhat verify --network sepolia <adresse du contrat>`

### Déploiement

Notre smart contract est déployé sur "Sepolia" (et vérifié).
Sepolia "Voting" contract: https://sepolia.etherscan.io/address/0xCaAa47151feA17C856AE002DabA99D40717cA738#code

### Ajout de sécurité

Nous avons ajouté une règle de sécurité à la ligne 180 du contrat:
`require(_id > 0, "Cannot vote for GENESIS proposal"); // Ajout d'une sécurité pour ne pas voter pour la proposition "GENESIS"`

---

## Frontend

1. Copier le `.env.dist` en `.env` et remplacer les variable d'environnements
1. `pnpm install`
1. Lancer le frontend avec `npm run dev` ou `pnpm dev`
    > Lors d'un lancement en local, la blokchain hardhat locale doit être lancée et le smart contract Voting deployé

### Déploiement

Le frontend est déployé sur Vercel. Voici le lien vers notre dapp: https://alyra-tp3.vercel.app/dashboard/voters
A chaque commit, notre frontend est redéployé.

## Divers

-   Lien vers les tâches: https://github.com/users/Pandazaur/projects/4/views/1
-   Lien vers l'enregistrement Loom: https://www.loom.com/share/3cc165fa701645f1b5487f45af48e0a0?sid=7182d280-c4ba-48e5-a7bb-4a3e982454d9
-   Sepolia "Voting" contract: https://sepolia.etherscan.io/address/0xCaAa47151feA17C856AE002DabA99D40717cA738#code
-   Lien vers notre dApp: https://alyra-tp3.vercel.app/dashboard/voters

### Interactions avec le smart contract

5. Interact with the Contract
   After deploying the contract, you can interact with it using the functions provided. Here are the steps to interact with the key functions:

1. Register Voters
    - Ensure the contract owner account is selected (the account that deployed the contract).
    - In the "Deploy & Run Transactions" panel, find the addVoter function.
    - Enter an address (you can use one of the generated addresses provided by Remix).
    - Click the "transact" button to register the voter.
1. Start Proposals Registration
    - Find the startProposalsRegistering function.
    - Click the "transact" button to start the proposals registration phase.
1. Add Proposals
    - Switch to one of the registered voter accounts using the account dropdown in Remix.
    - Find the addProposal function.
    - Enter a proposal description.
    - Click the "transact" button to add the proposal.
1. End Proposals Registration
    - Switch back to the contract owner account.
    - Find the endProposalsRegistering function.
    - Click the "transact" button to end the proposals registration phase.
1. Start Voting Session
    - Find the startVotingSession function.
    - Click the "transact" button to start the voting session.
1. Vote on Proposals
    - Switch to a registered voter account.
    - Find the setVote function.
    - Enter the proposal ID you want to vote for (e.g., 0 for the first proposal).
    - Click the "transact" button to cast your vote.
1. End Voting Session
    - Switch back to the contract owner account.
    - Find the endVotingSession function.
    - Click the "transact" button to end the voting session.
1. Tally Votes
    - Find the tallyVotes function.
    - Click the "transact" button to tally the votes and determine the winning proposal.
1. Verify the Results
    - Use the winningProposalID function to check the ID of the winning proposal.
    - Use the getOneProposal function to get details of a specific proposal by entering its ID.
