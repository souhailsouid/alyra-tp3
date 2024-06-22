'use client'
import React, { useMemo, useState } from 'react'
import { useWriteContract } from 'wagmi'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { wagmiContractConfig } from '../../lib/utils';
import { VotingSessionProps } from '@/lib/types'
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'


const ProposalForm: React.FC<VotingSessionProps> = ({ isConnected, refetchWorkflowStatus, isAdmin, isVoter }) => {
    const [description, setDescription] = useState('')
    const { writeContract, isPending } = useWriteContract({
        mutation: {
            onSuccess: async () => {
                setDescription('')
                toast.success(`Nouvel proposition: ${description} ajouté`)
                await refetchWorkflowStatus()
            },
            onError: (e: any) => {
                console.error({ e })
                toast.error(e.shortMessage || e.message)
                setDescription('')
            },
        },
    })

    const handleSubmit = () => {
        writeContract({
            ...wagmiContractConfig,
            functionName: 'addProposal',
            args: [description],
        })
    }

    const buttonState = useMemo(() => {
        if (!isConnected) {
            return { disabled: true, wording: 'Vous devez connecter votre wallet' }
        }


        if (isPending) {
            return { disabled: true, wording: 'Chargement ...' }
        }

        return { disabled: false, wording: 'Ajouter la proposition' }
    }, [isConnected, isPending,])

    if (!isConnected || isAdmin || !isVoter) {
        return null
    }
    return (
        <div className="border rounded-xl p-6 mb-10 space-x-4">
            <div className="border rounded-xl p-6 mb-10">
                <h2 className="text-xl font-medium mb-6">Ajouter une proposition</h2>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Description de la proposition</Label>
                    <Input
                        type="text"
                        placeholder="Description de la proposition"
                        value={description}
                        onInput={(e) => setDescription((e.target as HTMLInputElement).value)}
                        disabled={buttonState.disabled}
                    />
                </div>
                <Button className="mt-4" onClick={handleSubmit} disabled={buttonState.disabled}>
                    {buttonState.wording}
                </Button>
            </div>
        </div>
    )

}

export default withWorkflowStatus(ProposalForm)