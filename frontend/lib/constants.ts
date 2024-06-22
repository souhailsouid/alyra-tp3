export const VotingStatus = {
    REGISTERING_VOTERS: 'Registering Voters',
    PROPOSALS_SESSION_STARTED: 'Proposals Registration Started',
    PROPOSALS_SESSION_ENDED: 'Proposals Registration Ended',
    VOTING_SESSION_STARTED: 'Voting Session Started',
    VOTING_SESSION_ENDED: 'Voting Session Ended',
    VOTES_TALLIED: 'Votes Tallied',
};

export type VotingStatusType = {
    [key in keyof typeof VotingStatus]: string;
};

export enum WorkflowStatus {
    RegisteringVoters = 0,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied,
}

export const statusMessages: { [key in WorkflowStatus]: string } = {
    [WorkflowStatus.RegisteringVoters]: 'Registering Voters',
    [WorkflowStatus.ProposalsRegistrationStarted]: 'Proposals Registration Started',
    [WorkflowStatus.ProposalsRegistrationEnded]: 'Proposals Registration Ended',
    [WorkflowStatus.VotingSessionStarted]: 'Voting Session Started',
    [WorkflowStatus.VotingSessionEnded]: 'Voting Session Ended',
    [WorkflowStatus.VotesTallied]: 'Votes Tallied',
};
