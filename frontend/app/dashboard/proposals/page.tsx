'use client'
import React from 'react'

import { useWorkflowStatusContext } from '@/app/context/WorkflowStatusContext'
import ProposalsRegistering from '@/components/proposalsRegistering'
import VotingSession from '@/components/VotingSession'
import ProposalsTable from './shared/proposalsList'
import ProposalForm from '@/components/forms/proposalForm'
import TallyVotes from '@/components/TallyVotes'
import ViewsWinnerProposal from '@/components/viewsWinnerProposal'
import { VotingStatus } from '@/lib/constants'
import VotingForm from '@/components/forms/votingForm'
import WorkflowStatusComponent from '@/components/ui/WorkflowStatusComponent'
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'
import { VotingSessionProps } from '@/lib/types'
import withAuthMiddleware from '@/app/hoc/withAuthMiddleware'

const Pages: React.FC<VotingSessionProps> = () => {
    const { currentStatus } = useWorkflowStatusContext()

    const showContentWithStatus = () => {
        switch (currentStatus) {
            case VotingStatus.PROPOSALS_SESSION_ENDED:
            case VotingStatus.VOTING_SESSION_STARTED:
                return <VotingSession />
            case VotingStatus.VOTING_SESSION_ENDED:
                return <TallyVotes />
            case VotingStatus.VOTES_TALLIED:
                return <ViewsWinnerProposal />
            default:
                return <ProposalsRegistering />
        }
    }
    const showFormsWithContext = () => {
        switch (currentStatus) {
            case VotingStatus.PROPOSALS_SESSION_STARTED:
                return <ProposalForm />
            case VotingStatus.VOTING_SESSION_STARTED:
                return <VotingForm />
        }
    }
    
    

    return (
        <div>
            <WorkflowStatusComponent />
            {showContentWithStatus()}
            {showFormsWithContext()}
            <ProposalsTable />
        </div>
    )
}

export default withWorkflowStatus(withAuthMiddleware(Pages))