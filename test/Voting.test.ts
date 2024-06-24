import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer, ContractTransactionResponse } from 'ethers';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { Voting } from '../typechain-types';

describe('Voting', function () {
    let contract,
        voting: Voting & {
            deploymentTransaction(): ContractTransactionResponse;
        },
        addr1: Signer,
        addr2: Signer,
        owner: Signer;

    async function deployContractFixture() {
        [owner, addr1, addr2] = await ethers.getSigners();
        contract = await ethers.getContractFactory('Voting');
        voting = await contract.deploy();
        return { voting, owner, addr1, addr2 };
    }

    describe('Initialization', function () {
        it('should deploy the contract', async function () {
            let { voting, owner } = await loadFixture(deployContractFixture);
            let ownerAddress = await voting.owner();

            expect(ownerAddress).to.equal(await owner.getAddress());
        });
    });

    describe('Registering Candidates, function addVoter', function () {
        beforeEach(async function () {
            ({ voting, owner, addr1, addr2 } = await loadFixture(
                deployContractFixture
            ));
        });

        it('should not allow non-owners to register candidates', async function () {
            const candidate = voting.connect(addr1);
            await expect(candidate.addVoter(addr2))
                .to.be.revertedWithCustomError(
                    voting,
                    'OwnableUnauthorizedAccount'
                )
                .withArgs(addr1.getAddress());
        });

        it('should allow the owner to register candidates', async function () {
            const administrator = voting.connect(owner);

            await expect(administrator.addVoter(addr1))
                .to.emit(voting, 'VoterRegistered')
                .withArgs(addr1.getAddress());
        });
        it('should not allow the owner to register the same candidate twice', async function () {
            const administrator = voting.connect(owner);
            await administrator.addVoter(addr1);
            await expect(administrator.addVoter(addr1)).to.be.revertedWith(
                'Already registered'
            );
        });
    });
    describe('startProposalsRegistering', () => {
        beforeEach(async function () {
            ({ voting, owner, addr1 } = await loadFixture(
                deployContractFixture
            ));
        });
        it('should not allow non-owners to start proposals registering', async function () {
            const candidate = voting.connect(addr1);
            await expect(candidate.startProposalsRegistering())
                .to.be.revertedWithCustomError(
                    voting,
                    'OwnableUnauthorizedAccount'
                )
                .withArgs(addr1.getAddress());
        });
        it('should allow the owner to start proposals registering', async function () {
            const administrator = voting.connect(owner);
            administrator.addVoter(addr1);
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(0);

            await expect(administrator.startProposalsRegistering())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(0, 1);
        });
        it('Should start proposal registration and push GENESIS proposal', async function () {
            await voting.connect(owner).addVoter(addr1.getAddress());
            await voting.connect(owner).addVoter(addr2.getAddress());
            await voting.connect(owner).startProposalsRegistering();

            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(1);

            const genesisProposal = await voting
                .connect(addr1)
                .getOneProposal(0);
            expect(genesisProposal.description).to.equal('GENESIS');
        });
        it('Should allow registered voters to add proposals and retrieve them', async function () {
            await voting.connect(owner).addVoter(addr1.getAddress());
            await voting.connect(owner).addVoter(addr2.getAddress());

            await voting.connect(owner).startProposalsRegistering();

            await expect(voting.connect(addr1).addProposal('Proposal miaou'))
                .to.emit(voting, 'ProposalRegistered')
                .withArgs(1);
            await expect(
                voting.connect(addr2).addProposal('Proposal ouaf ouaf')
            )
                .to.emit(voting, 'ProposalRegistered')
                .withArgs(2);

            const proposal1 = await voting.connect(addr1).getOneProposal(1);
            const proposal2 = await voting.connect(addr2).getOneProposal(2);

            expect(proposal1.description).to.equal('Proposal miaou');
            expect(proposal2.description).to.equal('Proposal ouaf ouaf');
            //
        });
        it('Should not allow unregistered addresses to add proposals', async function () {
            await voting.connect(owner).addVoter(addr1.getAddress());
            await voting.connect(owner).startProposalsRegistering();

            await expect(
                voting.connect(addr2).addProposal('Proposal 2')
            ).to.be.revertedWith("You're not a voter");
        });
    });
    describe('endProposalsRegistering', () => {
        let administrator: Voting;
        beforeEach(async function () {
            ({ voting, owner, addr1 } = await loadFixture(
                deployContractFixture
            ));
            administrator = voting.connect(owner);
            administrator.addVoter(addr1);
        });
        it('should not allow non-owners to start proposals registering', async function () {
            const candidate = voting.connect(addr1);
            await expect(candidate.endProposalsRegistering())
                .to.be.revertedWithCustomError(
                    voting,
                    'OwnableUnauthorizedAccount'
                )
                .withArgs(addr1.getAddress());
        });
        it('should not allow the owner to start proposals registering when WorkflowStatusChange is equals to: Registering proposals havent started yet', async function () {
            await expect(
                administrator.endProposalsRegistering()
            ).to.be.revertedWith('Registering proposals havent started yet');
        });
        it('should allow the owner to end proposals registering', async function () {
            await administrator.startProposalsRegistering();
            await expect(administrator.endProposalsRegistering())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(1, 2);
        });
    });
    describe('startVotingSession', () => {
        beforeEach(async function () {
            ({ voting, owner, addr1 } = await loadFixture(
                deployContractFixture
            ));
            await voting.connect(owner).addVoter(addr1.getAddress());
            await voting.connect(owner).addVoter(addr2.getAddress());

            await voting.connect(owner).startProposalsRegistering();
            await voting.connect(addr1).addProposal('Proposal miaou');
            await voting.connect(addr2).addProposal('Proposal ouaf ouaf');
            await voting.connect(owner).endProposalsRegistering();
        });
        it('should not allow non-owners to start the voting session', async function () {
            const notOwner = voting.connect(addr1);
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(2);
            await expect(notOwner.startVotingSession())
                .to.be.revertedWithCustomError(
                    voting,
                    'OwnableUnauthorizedAccount'
                )
                .withArgs(addr1.getAddress());
        });
        it('should allow the owner to start the voting session', async function () {
            const administrator = voting.connect(owner);
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(2);
            await expect(administrator.startVotingSession())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(2, 3);
        });
    });
    describe('Set vote', () => {
        beforeEach(async function () {
            ({ voting, owner, addr1 } = await loadFixture(
                deployContractFixture
            ));
            await voting.connect(owner).addVoter(addr1.getAddress());
            await voting.connect(owner).addVoter(addr2.getAddress());

            await voting.connect(owner).startProposalsRegistering();
            await voting.connect(addr1).addProposal('Proposal miaou');
            await voting.connect(addr2).addProposal('Proposal ouaf ouaf');
        });
        it('should not allow voters to start the voting session when is not the voting session had not started', async function () {
            await voting.connect(owner).endProposalsRegistering();
            const voter = voting.connect(addr1);
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(2);
            await expect(voter.setVote(1)).to.be.revertedWith(
                'Voting session havent started yet'
            );
        });
        it('should not allow voters to vote for a proposal that does not exist', async function () {
            await voting.connect(owner).endProposalsRegistering();
            await voting.connect(owner).startVotingSession();
            const voter = voting.connect(addr1);
            await expect(voter.setVote(3)).to.be.revertedWith(
                'Proposal not found'
            );
        });
        it('should allow voters to vote for a proposal', async function () {
            await voting.connect(owner).endProposalsRegistering();
            await voting.connect(owner).startVotingSession();
            await voting.connect(addr1).setVote(1);
            const voter = await voting
                .connect(addr1)
                .getVoter(addr1.getAddress());
            expect(voter.hasVoted).to.be.true;

            expect(voter.votedProposalId).to.equal(1);
        });
        it('should not allow voters to vote twice', async function () {
            await voting.connect(owner).endProposalsRegistering();
            await voting.connect(owner).startVotingSession();
            const voter = voting.connect(addr1);
            await voter.setVote(1);
            await expect(voter.setVote(1)).to.be.revertedWith(
                'You have already voted'
            );
        });
    });
    describe('endVotingSession', () => {
        beforeEach(async function () {
            ({ voting, owner, addr1 } = await loadFixture(
                deployContractFixture
            ));
            await voting.connect(owner).addVoter(addr1.getAddress());
            await voting.connect(owner).addVoter(addr2.getAddress());

            await voting.connect(owner).startProposalsRegistering();
            await voting.connect(addr1).addProposal('Proposal miaou');
            await voting.connect(addr2).addProposal('Proposal ouaf ouaf');
            await voting.connect(owner).endProposalsRegistering();
            await voting.connect(owner).startVotingSession();
            await voting.connect(addr1).setVote(1);
            await voting.connect(addr2).setVote(2);
        });
        it('should not allow non-owners to end the voting session', async function () {
            const notOwner = voting.connect(addr1);
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(3);
            await expect(notOwner.endVotingSession())
                .to.be.revertedWithCustomError(
                    voting,
                    'OwnableUnauthorizedAccount'
                )
                .withArgs(addr1.getAddress());
        });
        it('should allow the owner to end the voting session', async function () {
            const administrator = voting.connect(owner);
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(3);
            await expect(administrator.endVotingSession())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(3, 4);
        });
    });
    describe('tallyVotes', () => {
        beforeEach(async function () {
            ({ voting, owner, addr1 } = await loadFixture(
                deployContractFixture
            ));
            await voting.connect(owner).addVoter(addr1.getAddress());
            await voting.connect(owner).addVoter(addr2.getAddress());

            await voting.connect(owner).startProposalsRegistering();
            await voting.connect(addr1).addProposal('Proposal miaou');
            await voting.connect(addr2).addProposal('Proposal ouaf ouaf');
            await voting.connect(owner).endProposalsRegistering();
            await voting.connect(owner).startVotingSession();
            await voting.connect(addr1).setVote(1);
            await voting.connect(addr2).setVote(1);
        });
        it('should not allow non-owners to tally votes', async function () {
            await voting.connect(owner).endVotingSession();
            const notOwner = voting.connect(addr1);
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(4);
            await expect(notOwner.tallyVotes())
                .to.be.revertedWithCustomError(
                    voting,
                    'OwnableUnauthorizedAccount'
                )
                .withArgs(addr1.getAddress());
        });
        it('should not allow the owner to tally votes if the voting session is not ended', async function () {
            const administrator = voting.connect(owner);
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(3);
            await expect(administrator.tallyVotes()).to.be.revertedWith(
                'Current status is not voting session ended'
            );
        });
        it('should allow the owner to tally votes', async function () {
            const administrator = voting.connect(owner);
            await administrator.endVotingSession();

            await administrator.tallyVotes();
            const workflowStatus = await voting.workflowStatus();
            expect(workflowStatus).to.equal(5);
            const winningProposalID = await voting.winningProposalID();
            expect(winningProposalID).to.equal(1);
        });
        it('should not allow the owner to tally votes twice', async function () {
            const administrator = voting.connect(owner);
            await administrator.endVotingSession();

            await administrator.tallyVotes();
            await expect(administrator.tallyVotes()).to.be.revertedWith(
                'Current status is not voting session ended'
            );
        })
    });
});
