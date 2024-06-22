// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title A voting contract that can draw a winning proposal
 * @author Alexandre B.
 */
contract Voting is Ownable {
    /**
     * @notice the winning proposals drawn
     * @return the winning proposal id linked to the `proposalArray`
     */
    uint public winningProposalID;

    /**
     * @title Struct of a voter that can submit a proposal and vote for other proposals
     * @author Alexandre B.
     */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /**
     * @title Struct of a proposal submitted by a voter
     * @author Alexandre B.
     */
    struct Proposal {
        string description;
        uint voteCount;
    }

    /**
     * @title The different status of the Workflow
     * @notice It restricts the actions possible in the time
     */
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
     * @notice the current status of the Voting flow
     */
    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping(address => Voter) voters;

    /**
     * @notice Triggered when a voter is added to the voters
     * @param voterAddress The address of the new added voter
     */
    event VoterRegistered(address voterAddress);
    /**
     * @notice Triggered when a workflow status is changing
     * @param previousStatus The previous status of the workflow
     * @param newStatus The status of the new workflow
     */
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    /**
     * @notice Triggered when a proposal is registered by a voter
     * @param proposalId The id of the new added proposal
     */
    event ProposalRegistered(uint proposalId);
    /**
     * @notice Triggered when a proposal is registered by a voter
     * @param proposalId The id of the new added proposal
     */
    event Voted(address voter, uint proposalId);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Use to prevent some functions to be call if they are not called by an address registered in the "voters"
     */
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }

    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    /**
     * @notice Get the voter object corresponding to the address passed in param
     * @param _addr Address of the voter
     * @return {Voter} Voter returned
     */
    function getVoter(address _addr) external view onlyVoters returns (Voter memory) {
        return voters[_addr];
    }

    /**
     * @notice Get the proposal object according to the proposal id passed in param
     * @param _id Proposal id to get
     * @return {Proposal} Proposal object returned
     */
    function getOneProposal(uint _id) external view onlyVoters returns (Proposal memory) {
        return proposalsArray[_id];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: //
    /**
     * @notice Add a new voter to the list
     * @param _addr the address of the voter
     */
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Voters registration is not open yet");
        require(voters[_addr].isRegistered != true, "Already registered");

        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    // ::::::::::::: PROPOSAL ::::::::::::: //

    /**
     * @notice Add a proposal to the list of proposals. Voters will be able to vote for any of the added proposal
     * @param _desc Description of the proposal to add
     */
    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals are not allowed yet");
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), "Vous ne pouvez pas ne rien proposer"); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        // proposalsArray.push(Proposal(_desc,0));
        emit ProposalRegistered(proposalsArray.length - 1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /**
     * @notice Vote for a proposal submitted by a voter.
     * @param _id Id of the proposal
     */
    function setVote(uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session havent started yet");
        require(voters[msg.sender].hasVoted != true, "You have already voted");
        require(_id < proposalsArray.length, "Proposal not found"); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //
    /**
     * @notice Enables voters to add proposals
     */
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Registering proposals cant be started now");
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;

        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);

        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @notice Stops the submition of new proposals
     */
    function endProposalsRegistering() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Registering proposals havent started yet"
        );
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted,
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    /**
     * @notice Starts the voting session: voters can vote for a proposal
     */
    function startVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationEnded,
            "Registering proposals phase is not finished"
        );
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @notice Stops the voting session: voters cannot vote for a proposal anymore
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session havent started yet");
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @notice Draw the winning proposal
     * @dev We could use a 'memory' array instead of the proposalsArray to reduce gas cost due to the iteration on a "storage" variable.
     */
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        uint _winningProposalId;
        for (uint256 p = 0; p < proposalsArray.length; p++) {
            if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
                _winningProposalId = p;
            }
        }
        winningProposalID = _winningProposalId;

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}
