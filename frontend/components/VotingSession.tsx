'use client'
import React, { useMemo } from 'react'
import { useWriteContract } from 'wagmi'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { wagmiContractConfig } from '@/lib/utils'
import { VotingSessionProps } from '@/lib/types'
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'



const VotingSession: React.FC<VotingSessionProps> = ({ isConnected, workflowStatus, isAdmin, refetchWorkflowStatus, votingStatus }) => {

    const showToastMsgWithContext = () => {
        switch (workflowStatus) {
            case votingStatus.PROPOSALS_SESSION_ENDED:
                return toast.success('Session de vote démarée')
            case votingStatus.VOTING_SESSION_STARTED:
                return toast.success('Session de vote terminé')
        }
    }
    const { writeContract, isPending } = useWriteContract({
        mutation: {
            onSuccess: async () => {
                showToastMsgWithContext()
                await refetchWorkflowStatus();
            },
            onError: (e: any) => {
                console.error({ e })
                toast.error(e.shortMessage || e.message)
            }
        },
    })

    const handleVotingSession = () => {
        switch (workflowStatus) {
            case votingStatus.PROPOSALS_SESSION_ENDED:
                return writeContract({
                    ...wagmiContractConfig,
                    functionName: "startVotingSession",
                })
            case votingStatus.VOTING_SESSION_STARTED:
                return writeContract({
                    ...wagmiContractConfig,
                    functionName: "endVotingSession",
                })
        }
    }

    const btnVotingState = useMemo(() => {
        if (!isConnected) {
            return { disabled: true, wording: 'Vous devez connecter votre wallet' }
        }

        if (isPending) {
            return { disabled: true, wording: 'Chargement ...' }
        }

        if (workflowStatus === votingStatus.VOTING_SESSION_STARTED) {
            return { disabled: false, wording: 'Terminer la session de vote' }
        }
        if (workflowStatus === votingStatus.VOTING_SESSION_ENDED) {
            return { disabled: false, wording: 'Session de vote cloturée' }
        }

        return { disabled: false, wording: 'Démarrer la session de vote' }

    }, [isConnected, isPending, workflowStatus, votingStatus])


    if (!isConnected || !isAdmin) {
        return null
    }

    return (
        <div className="border rounded-xl p-6 mb-10 space-x-4">
            <Button className="mt-4" onClick={handleVotingSession} disabled={btnVotingState.disabled}>
                {btnVotingState.wording}
            </Button>
        </div>
    )

}

export default withWorkflowStatus(VotingSession)