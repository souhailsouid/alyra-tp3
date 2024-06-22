'use client'
import React, { useEffect } from 'react'

import { useWorkflowStatusContext } from '@/app/context/WorkflowStatusContext'
import ProposalsRegistering from '@/components/proposalsRegistering'
import VotingSession from '@/components/VotingSession'
import ProposalsTable from '@/components/table/proposalsList'
import ProposalForm from '@/components/forms/proposalForm'
import TallyVotes from '@/components/TallyVotes'
import ViewsWinnerProposal from '@/components/viewsWinnerProposal'
import { VotingStatus } from '@/lib/constants'
import VotingForm from '@/components/forms/votingForm'
import { useUserRole } from '@/app/hooks/useUserRole'
import WorkflowStatusComponent from '@/components/ui/WorkflowStatusComponent'



export default function Pages() {

    const { currentStatus, showError, isLoading } = useWorkflowStatusContext()
    const { isConnected, isAdmin, isVoter, isUserRoleLoading } = useUserRole()

    useEffect(() => {
    }, [currentStatus])



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
            default:
                return null
        }
    }


    if (isLoading) return <div>Verification de status en cours</div>
    if (showError) return <div>Erreur lors du changement de status</div>

    if (!isConnected) {
        return <p>Connectez-vous pour accéder à cette page</p>
    }
    if (isUserRoleLoading) {
        return <p>Verification en cours...</p>
    }
    if (!isVoter && !isAdmin) {
        return null
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
