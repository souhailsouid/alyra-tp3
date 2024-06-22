'use client'
import React, { useMemo, useState } from 'react'
import { useWatchContractEvent, useWriteContract } from 'wagmi'
import { toast } from 'sonner'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { wagmiContractConfig } from '../../lib/utils';
import { VotingSessionProps } from '@/lib/types'
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'


const VotingForm: React.FC<VotingSessionProps> = ({ isConnected, refetchWorkflowStatus, isAdmin, isVoter }) => {

    const [proposalId, setProposalId] = useState<string[]>([]);
    const [selectedValue, setSelectedValue] = useState<string>('');
    useWatchContractEvent({
        ...wagmiContractConfig,
        eventName: 'ProposalRegistered',
        fromBlock: 1n,
        onLogs: (logs: any[]) => {
            setProposalId((prevProposals) =>
                [...new Set([...prevProposals, ...logs.map((log) => log.args.proposalId.toString())])]
            );
        },
    });

    const formattedProposals = proposalId.map((proposal: string, index: number) => ({
        value: (index + 1).toString(),
        label: proposal,
    }));

    const { writeContract, isPending } = useWriteContract({
        mutation: {
            onSuccess: async () => {
                toast.success(`Vote enregistré pour la proposition numéro ${selectedValue}`)
                await refetchWorkflowStatus()
            },
            onError: (e: any) => {
                console.error({ e })
                toast.error(e.shortMessage || e.message,)

            },
        },
    })


    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value);
    };

    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        const proposalIndex = parseInt(selectedValue);

        writeContract({
            ...wagmiContractConfig,
            functionName: "setVote",
            args: [proposalIndex],
        })
    }

    const buttonState = useMemo(() => {
        if (!isConnected) {
            return { disabled: true, wording: 'Vous devez connecter votre wallet' }
        }

        if (isPending) {
            return { disabled: true, wording: 'Chargement ...' }
        }

        return { disabled: false, wording: 'Voter' }
    }, [isConnected, isPending])

    if (!isConnected || isAdmin || !isVoter) {
        return null
    }
    return (
        <div className="border rounded-xl p-6 mb-10 space-x-4">
            <div className="border rounded-xl p-6 mb-10">
                <h2 className="text-xl font-medium mb-6">Voter une proposition</h2>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">ID de la proposition</Label>
                    <Select
                        required
                        name="selectProposal"
                        value={selectedValue}
                        options={formattedProposals}
                        onChange={handleSelectChange}
                        placeholder="Veuillez selectioner une proposition"
                    />
                </div>
                {selectedValue && <span className='text-2xl font-bold'>Vous avez choisi la proposition numéro {selectedValue}</span>}
                <br />
                <Button className="mt-4" onClick={(e) => handleSubmit(e as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>)} disabled={buttonState.disabled}>
                    {buttonState.wording}
                </Button>
            </div>
        </div>
    )

}

export default withWorkflowStatus(VotingForm)