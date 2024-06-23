'use client'
import React, { useMemo } from 'react'
import { useWriteContract } from 'wagmi'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { wagmiContractConfig } from '@/lib/utils'
import { useWorkflowStatusContext } from '@/app/context/WorkflowStatusContext'
import { VotingSessionProps } from '@/lib/types'
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'
import { useUserRole } from '@/app/hooks/useUserRole'

const TallyVotes: React.FC<VotingSessionProps> = ({ isConnected }) => {
    const { isAdmin } = useUserRole()
    const { refetch } = useWorkflowStatusContext()
    const { writeContract, isPending } = useWriteContract({
        mutation: {
            onSuccess: async () => {
                toast.success('Vote comptabilisé')
                await refetch()
            },
            onError: (e: any) => {
                console.error({ e })
                toast.error(e.shortMessage || e.message)
            },
        },
    })

    const tallyVotesSession = () => {
        writeContract({
            ...wagmiContractConfig,
            functionName: 'tallyVotes',
            args: [],
        })
    }
    const btnVotingState = useMemo(() => {
        if (!isConnected) {
            return { disabled: true, wording: 'Vous devez connecter votre wallet' }
        }

        if (isPending) {
            return { disabled: true, wording: 'Chargement ...' }
        }

        return { disabled: !isAdmin, wording: 'Comptabiliser les votes' }
    }, [isConnected, isPending, isAdmin])

    return (
        <div className="border rounded-xl p-6 mb-10 space-x-4">
            <Button className="mt-4" onClick={tallyVotesSession} disabled={btnVotingState.disabled}>
                {btnVotingState.wording}
            </Button>
        </div>
    )
}
export default withWorkflowStatus(TallyVotes)
