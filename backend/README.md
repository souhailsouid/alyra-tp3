# Projet 2

## Intro

Tous les tests ont été mis en place, avec un coverage de 100%. Les tests ont été organisé par "fonctions".

Les "describe" commençant par "#" sont les noms des fonctions testées. En général voici l'ordre des tests:

1. Les tests qui les modifiers fonctionnent
2. Les tests que les require fonctionnent
3. Les tests que le fonctionnement nominal fonctionne AVEC check des effets que ça a eu (changment de state, events, etc ...)

## Tester

### Lancer les tests

`npm run test`

### Lancer le coverage

`npm run coverage`

## Resultats

```
Voting
    Deployment & Init
      ✔ should be deployed and have an address (927ms)
      ✔ should have the owner to be the deployer
    Registration
      #addVoter
        ✔ should NOT be able to add a voter if not the OWNER
        ✔ should NOT be able to add a voter if status is not open to registering voters
        ✔ should NOT be able to add a voter twice with the same address
        ✔ should be able for the owner to add a voter if the registration is open
    Proposal
      #addProposal
        ✔ should NOT be able to add a new proposal if caller is not registered
        ✔ should NOT be able to add a new proposal if voting is not open to proposal submission
        ✔ should NOT be able to add an empty proposal
        ✔ should be able to add a proposal if registered and a sending a completed proposal
    Vote
      #setVote
        ✔ should not be able to add a vote if the caller is not registered
        ✔ should not be able to set vote if voting sessions did not start
        ✔ should not be able to vote twice
        ✔ should not be able to vote for an unexisting proposal
        ✔ should be able for a voter to vote for an existing proposal
    State
      #startProposalsRegistering
        ✔ should not be able to change the status if not owner
        ✔ should not be able to change the status if the previous status was not 'RegisteringVoters'
        ✔ should change status to the new status
      #endProposalsRegistering
        ✔ should not be able to change the status if not owner
        ✔ should not be able to change the status if previous was not 'proposal starting'
        ✔ should change status to the new status
      #startVotingSession
        ✔ should not be able to change the status if not owner
        ✔ should not be able to change the status if previous was not 'registration ended'
        ✔ should change status to the new status
      #endVotingSession
        ✔ should not be able to change the status if not owner
        ✔ should not be able to change the status if previous was not 'voting started'
        ✔ should change status to the new status
      #tallyVotes
        ✔ should not be able to change the status if not owner
        ✔ should not be able to tally votes if votes are not finished
        ✔ should tally the votes (43ms)
    Getters
      #getVoter
        ✔ should not be able to see voters if caller is not a voter
        ✔ should be able to see voters if caller is a voter
      #getOneProposal
        ✔ should not be able to see proposals if caller is not a voter
        ✔ should be able to see proposals if caller is a voter


  34 passing (1s)

-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |    85.71 |    88.89 |    85.71 |    86.27 |                |
  voting.sol |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
```
