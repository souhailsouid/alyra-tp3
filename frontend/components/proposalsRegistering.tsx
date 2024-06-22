'use client'
import React, { useMemo } from 'react'
import { useWriteContract } from 'wagmi'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { wagmiContractConfig } from '@/lib/utils';

import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'
import { VotingSessionProps } from '@/lib/types'

const ProposalsRegistering: React.FC<VotingSessionProps> = ({ isConnected, workflowStatus, votingStatus, isAdmin, refetchWorkflowStatus }) => {
    const showToastMsgWithContext = (context: string | null) => {
        switch (context) {
            case votingStatus.PROPOSALS_SESSION_STARTED:
                return toast.success(votingStatus.PROPOSALS_SESSION_ENDED)
            default:
                return toast.success(votingStatus.PROPOSALS_SESSION_STARTED)
        }
    }

    const { writeContract, isPending } = useWriteContract({
        mutation: {
            onSuccess: async () => {
                showToastMsgWithContext(workflowStatus)
                await refetchWorkflowStatus()
            },
            onError: (e: any) => {
                console.error({ e })
                toast.error(e.shortMessage || e.message)
            },
        },
    })

    const proposalsRegistering = (functionName: string) => {
        writeContract({
            ...wagmiContractConfig,
            functionName,
            args: [],
        })
    }

    const handleProposalsRegistering = () => {
        switch (workflowStatus) {
            case votingStatus.PROPOSALS_SESSION_STARTED:
                return proposalsRegistering("endProposalsRegistering")
            default:
                return proposalsRegistering("startProposalsRegistering")
        }
    }

    const btnProposalState = useMemo(() => {
        if (!isConnected) {
            return { disabled: true, wording: 'Vous devez connecter votre wallet' }
        }

        if (isPending) {
            return { disabled: true, wording: 'Chargement ...' }
        }

        if (workflowStatus === votingStatus.PROPOSALS_SESSION_STARTED) {
            return { disabled: false, wording: 'Mettre fin à la session de proposition' }
        }
        if (workflowStatus === votingStatus.PROPOSALS_SESSION_ENDED) {
            return { disabled: true, wording: 'Session de proposition cloturée' }
        }

        return { disabled: false, wording: 'Démarrer la session de proposition' }
    }, [isConnected, isPending, workflowStatus, votingStatus])

    if (!isConnected || !isAdmin) {
        return null
    }

    return (
        <div className="border rounded-xl p-6 mb-10 space-x-4">
            <Button className="mt-4" onClick={handleProposalsRegistering} disabled={btnProposalState.disabled}>
                {btnProposalState.wording}
            </Button>
        </div>

    )
}

export default withWorkflowStatus(ProposalsRegistering)