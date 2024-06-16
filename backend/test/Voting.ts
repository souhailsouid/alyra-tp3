import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import hre from "hardhat"

const ADDR_0 = "0x0000000000000000000000000000000000000000"
const NEW_PROPOSAL_TEXT = "New proposal"

enum WorkflowStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied,
}

describe.only("Voting", () => {
    async function deployBasicVoting() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, alice, bob] = await hre.ethers.getSigners()

        const Voting = await hre.ethers.getContractFactory("Voting")
        const voting = await Voting.deploy()

        return { owner, otherAccount, voting, alice, bob }
    }

    async function deployVotingWithVoter() {
        const { voting, owner, alice, otherAccount } = await deployBasicVoting()

        await voting.addVoter(owner.address)

        return { voting, owner, alice, otherAccount }
    }

    async function deployVotingWithVoterWithProposalOpened() {
        const { voting, owner, alice, otherAccount } = await deployVotingWithVoter()

        await voting.startProposalsRegistering()

        return { voting, owner, alice, otherAccount }
    }

    async function deployVotingWithVoterWithProposalsAndReadyToVote() {
        const { voting, owner, alice, otherAccount } = await deployVotingWithVoterWithProposalOpened()

        await voting.addProposal("PROPOSAL 1")
        await voting.addProposal("PROPOSAL 2")

        await voting.endProposalsRegistering()
        await voting.startVotingSession()

        return { voting, owner, alice, otherAccount }
    }

    async function deployVotingWithVotersAndProposalsReadyToTally() {
        const { voting, owner, alice, bob, otherAccount } = await deployBasicVoting()

        const VOTE_ID_WITH_MOST_VOTES = 1

        await voting.addVoter(owner.address)
        await voting.addVoter(alice.address)
        await voting.addVoter(bob.address)
        await voting.addVoter(otherAccount.address)

        await voting.startProposalsRegistering()

        await voting.connect(owner).addProposal("Owner proposal")
        await voting.connect(alice).addProposal("Alice proposal")
        await voting.connect(bob).addProposal("bob proposal")

        await voting.endProposalsRegistering()
        await voting.startVotingSession()

        await voting.connect(owner).setVote(VOTE_ID_WITH_MOST_VOTES)
        await voting.connect(bob).setVote(VOTE_ID_WITH_MOST_VOTES)
        await voting.connect(alice).setVote(2)
        await voting.connect(otherAccount).setVote(3)

        await voting.endVotingSession()

        return { voting, voteIdToWin: VOTE_ID_WITH_MOST_VOTES }
    }

    describe("Deployment & Init", () => {
        it("should be deployed and have an address", async () => {
            const { voting } = await loadFixture(deployBasicVoting)

            expect(await voting.getAddress()).to.not.be.eq(ADDR_0)
        })

        it("should have the owner to be the deployer", async () => {
            const { voting, owner } = await loadFixture(deployBasicVoting)

            expect(await voting.owner()).to.be.eq(owner.address)
        })
    })

    describe("Registration", () => {
        describe("#addVoter", () => {
            it("should NOT be able to add a voter if not the OWNER", async () => {
                const { voting, otherAccount, alice } = await loadFixture(deployBasicVoting)

                await expect(voting.connect(otherAccount).addVoter(alice.address)).to.be.revertedWithCustomError(
                    voting,
                    "OwnableUnauthorizedAccount"
                )
            })

            it("should NOT be able to add a voter if status is not open to registering voters", async () => {
                const { voting, alice } = await loadFixture(deployBasicVoting)

                await voting.startProposalsRegistering()

                await expect(voting.addVoter(alice.address)).to.be.rejectedWith("Voters registration is not open yet")
            })

            it("should NOT be able to add a voter twice with the same address", async () => {
                const { voting, alice } = await loadFixture(deployBasicVoting)

                await voting.addVoter(alice.address)

                await expect(voting.addVoter(alice.address)).to.be.rejectedWith("Already registered")
            })

            it("should be able for the owner to add a voter if the registration is open", async () => {
                const { voting, alice } = await loadFixture(deployBasicVoting)

                expect(await voting.addVoter(alice.address))
                    .to.emit(voting, "VoterRegistered")
                    .withArgs(alice.address)

                const addedVoter = await voting.connect(alice).getVoter(alice.address)
                expect(addedVoter.isRegistered).to.be.true
            })
        })
    })

    describe("Proposal", () => {
        describe("#addProposal", () => {
            it("should NOT be able to add a new proposal if caller is not registered", async () => {
                const { voting, alice } = await loadFixture(deployVotingWithVoter)

                await expect(voting.connect(alice).addProposal(NEW_PROPOSAL_TEXT)).to.be.revertedWith(
                    "You're not a voter"
                )
            })

            it("should NOT be able to add a new proposal if voting is not open to proposal submission", async () => {
                const { voting } = await loadFixture(deployVotingWithVoter)

                await expect(voting.addProposal(NEW_PROPOSAL_TEXT)).to.be.revertedWith("Proposals are not allowed yet")
            })

            it("should NOT be able to add an empty proposal", async () => {
                const { voting } = await loadFixture(deployVotingWithVoterWithProposalOpened)

                await expect(voting.addProposal("")).to.be.revertedWith("Vous ne pouvez pas ne rien proposer")
            })

            it("should be able to add a proposal if registered and a sending a completed proposal", async () => {
                const { voting } = await loadFixture(deployVotingWithVoterWithProposalOpened)

                const addProposalPromise = voting.addProposal(NEW_PROPOSAL_TEXT)

                await expect(addProposalPromise).to.emit(voting, "ProposalRegistered").withArgs("1")
            })
        })
    })

    describe("Vote", () => {
        describe("#setVote", () => {
            it("should not be able to add a vote if the caller is not registered", async () => {
                const { voting, alice } = await loadFixture(deployVotingWithVoter)

                await expect(voting.connect(alice).setVote("1")).to.be.revertedWith("You're not a voter")
            })

            it("should not be able to set vote if voting sessions did not start", async () => {
                const { voting } = await loadFixture(deployVotingWithVoterWithProposalOpened)

                await voting.addProposal("TEST")

                expect(voting.setVote("1")).to.be.revertedWith('Voting session havent started yet"')
            })

            it("should not be able to vote twice", async () => {
                const { voting } = await loadFixture(deployVotingWithVoterWithProposalsAndReadyToVote)

                await voting.setVote("1")

                expect(voting.setVote("2")).to.be.revertedWith('You have already voted"')
            })

            it("should not be able to vote for an unexisting proposal", async () => {
                const { voting } = await loadFixture(deployVotingWithVoterWithProposalsAndReadyToVote)

                expect(voting.setVote("99999")).to.be.revertedWith('Proposal not found"')
            })

            it("should be able for a voter to vote for an existing proposal", async () => {
                const { voting, owner } = await loadFixture(deployVotingWithVoterWithProposalsAndReadyToVote)
                const voteForId = "1"
                const proposalVoteCountBefore = await voting.getOneProposal(voteForId)
                await expect(voting.setVote(voteForId)).to.emit(voting, "Voted").withArgs(owner.address, voteForId)
                const proposalVoteCountAfter = await voting.getOneProposal(voteForId)
                const voter = await voting.getVoter(owner.address)

                expect(voter.hasVoted).to.be.true
                expect(voter.votedProposalId).to.eq(voteForId)
                expect(proposalVoteCountAfter.voteCount).to.eq(BigInt(proposalVoteCountBefore.voteCount) + 1n)
            })
        })
    })

    describe("State", () => {
        describe("#startProposalsRegistering", async () => {
            it("should not be able to change the status if not owner", async () => {
                const { voting, otherAccount } = await loadFixture(deployBasicVoting)

                await expect(voting.connect(otherAccount).startProposalsRegistering()).to.be.revertedWithCustomError(
                    voting,
                    "OwnableUnauthorizedAccount"
                )
            })

            it("should not be able to change the status if the previous status was not 'RegisteringVoters'", async () => {
                const { voting } = await loadFixture(deployBasicVoting)

                await voting.startProposalsRegistering()

                await expect(voting.startProposalsRegistering()).to.be.revertedWith(
                    "Registering proposals cant be started now"
                )
            })

            it("should change status to the new status", async () => {
                const { voting, owner } = await loadFixture(deployBasicVoting)

                await voting.addVoter(owner.address)

                const statusBefore = await voting.workflowStatus()
                await expect(voting.startProposalsRegistering())
                    .to.emit(voting, "WorkflowStatusChange")
                    .withArgs(statusBefore, WorkflowStatus.ProposalsRegistrationStarted)

                const genesisProposal = await voting.getOneProposal("0")

                expect(genesisProposal.description).to.eq("GENESIS")
            })
        })

        describe("#endProposalsRegistering", () => {
            it("should not be able to change the status if not owner", async () => {
                const { voting, otherAccount, alice } = await loadFixture(deployBasicVoting)

                await expect(voting.connect(otherAccount).endProposalsRegistering()).to.be.revertedWithCustomError(
                    voting,
                    "OwnableUnauthorizedAccount"
                )
            })

            it("should not be able to change the status if previous was not 'proposal starting'", async () => {
                const { voting } = await loadFixture(deployBasicVoting)

                await expect(voting.endProposalsRegistering()).to.be.revertedWith(
                    "Registering proposals havent started yet"
                )
            })

            it("should change status to the new status", async () => {
                const { voting } = await loadFixture(deployBasicVoting)

                await voting.startProposalsRegistering()

                const statusBefore = await voting.workflowStatus()
                await expect(voting.endProposalsRegistering())
                    .to.emit(voting, "WorkflowStatusChange")
                    .withArgs(statusBefore, WorkflowStatus.ProposalsRegistrationEnded)
            })
        })

        describe("#startVotingSession", () => {
            const EXPECTED_REVERTED_ERROR = "Registering proposals phase is not finished"
            const EXPECTED_STATUS = WorkflowStatus.VotingSessionStarted

            it("should not be able to change the status if not owner", async () => {
                const { voting, otherAccount } = await loadFixture(deployBasicVoting)

                await expect(voting.connect(otherAccount).startVotingSession()).to.be.revertedWithCustomError(
                    voting,
                    "OwnableUnauthorizedAccount"
                )
            })

            it("should not be able to change the status if previous was not 'registration ended'", async () => {
                const { voting } = await loadFixture(deployBasicVoting)

                await expect(voting.startVotingSession()).to.be.revertedWith(EXPECTED_REVERTED_ERROR)
            })

            it("should change status to the new status", async () => {
                const { voting } = await loadFixture(deployBasicVoting)

                await voting.startProposalsRegistering()
                await voting.endProposalsRegistering()

                const statusBefore = await voting.workflowStatus()
                await expect(voting.startVotingSession())
                    .to.emit(voting, "WorkflowStatusChange")
                    .withArgs(statusBefore, EXPECTED_STATUS)
            })
        })

        describe("#endVotingSession", () => {
            const EXPECTED_REVERTED_ERROR = "Voting session havent started yet"
            const EXPECTED_STATUS = WorkflowStatus.VotingSessionEnded

            it("should not be able to change the status if not owner", async () => {
                const { voting, otherAccount } = await loadFixture(deployBasicVoting)

                await expect(voting.connect(otherAccount).endVotingSession()).to.be.revertedWithCustomError(
                    voting,
                    "OwnableUnauthorizedAccount"
                )
            })

            it("should not be able to change the status if previous was not 'voting started'", async () => {
                const { voting } = await loadFixture(deployBasicVoting)

                await expect(voting.endVotingSession()).to.be.revertedWith(EXPECTED_REVERTED_ERROR)
            })

            it("should change status to the new status", async () => {
                const { voting } = await loadFixture(deployBasicVoting)

                await voting.startProposalsRegistering()
                await voting.endProposalsRegistering()
                await voting.startVotingSession()

                const statusBefore = await voting.workflowStatus()
                await expect(voting.endVotingSession())
                    .to.emit(voting, "WorkflowStatusChange")
                    .withArgs(statusBefore, EXPECTED_STATUS)
            })
        })

        describe("#tallyVotes", () => {
            const EXPECTED_REVERTED_ERROR = "Current status is not voting session ended"

            it("should not be able to change the status if not owner", async () => {
                const { voting, otherAccount } = await loadFixture(deployBasicVoting)

                await expect(voting.connect(otherAccount).tallyVotes()).to.be.revertedWithCustomError(
                    voting,
                    "OwnableUnauthorizedAccount"
                )
            })

            it("should not be able to tally votes if votes are not finished", async () => {
                const { voting } = await loadFixture(deployVotingWithVoterWithProposalOpened)

                await expect(voting.tallyVotes()).to.be.revertedWith(EXPECTED_REVERTED_ERROR)
            })

            it("should tally the votes", async () => {
                const { voting, voteIdToWin } = await loadFixture(deployVotingWithVotersAndProposalsReadyToTally)

                await expect(voting.tallyVotes())
                    .to.emit(voting, "WorkflowStatusChange")
                    .withArgs(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied)

                expect(await voting.winningProposalID()).to.eq(voteIdToWin)
                expect(await voting.workflowStatus()).to.eq(WorkflowStatus.VotesTallied)
            })
        })
    })

    describe("Getters", () => {
        describe("#getVoter", async () => {
            it("should not be able to see voters if caller is not a voter", async () => {
                const { voting, owner, otherAccount } = await loadFixture(deployVotingWithVoter)

                await expect(voting.connect(otherAccount).getVoter(owner.address)).to.be.rejectedWith(
                    "You're not a voter"
                )
            })

            it("should be able to see voters if caller is a voter", async () => {
                const { voting, owner } = await loadFixture(deployVotingWithVoter)

                const voter = await voting.getVoter(owner.address)

                expect(voter.isRegistered).to.be.true
                expect(voter.hasVoted).to.be.false
                expect(voter.votedProposalId).to.eq("0")
            })
        })

        describe("#getOneProposal", async () => {
            it("should not be able to see proposals if caller is not a voter", async () => {
                const { voting, owner, otherAccount } = await loadFixture(
                    deployVotingWithVoterWithProposalsAndReadyToVote
                )

                await expect(voting.connect(otherAccount).getOneProposal("0")).to.be.rejectedWith("You're not a voter")
            })

            it("should be able to see proposals if caller is a voter", async () => {
                const { voting } = await loadFixture(deployVotingWithVoterWithProposalsAndReadyToVote)
                const proposal = await voting.getOneProposal(0)

                expect(proposal.description).to.eq("GENESIS")
            })

            // it("should revert if the proposal does not exist", async () => {
            //     const { voting } = await loadFixture(deployVotingWithVoterWithProposalsAndReadyToVote)

            //     await expect(voting.getOneProposal("-3")).to.revertedWithPanic("INVALID_ARGUMENT")
            // })
        })
    })
})
