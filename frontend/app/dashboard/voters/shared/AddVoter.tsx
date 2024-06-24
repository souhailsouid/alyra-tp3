'use client'
import React, { useMemo, useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import VotingContract from '@/types/contracts/voting.sol/Voting.json'
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'

type Props = {
    onNewVoterAdded?: (voterAddr: string) => unknown,
    isVoter: boolean,
    isAdmin: boolean,
}


const  AddVoter = (props: Props)  => {
    const [addressToAdd, setAddressToAdd] = useState('')
    const { isConnected } = useAccount()

    const { writeContract, isPending } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setAddressToAdd('')
                toast.success('Nouveau voteur ajouté')
                props.onNewVoterAdded?.(addressToAdd)
            },
            onError: (e: any) => {
                console.error({ e })
                toast.error(e.shortMessage || e.message)
            },
        },
    })

    const onSave = () => {
        writeContract({
            address: process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS,
            abi: VotingContract.abi,
            functionName: 'addVoter',
            args: [addressToAdd],
        })
    }

    const buttonState = useMemo(() => {
        if (!isConnected) {
            return { disabled: true, wording: 'Vous devez connecter votre wallet' }
        }

        if (isPending) {
            return { disabled: true, wording: 'Chargement ...' }
        }

        return { disabled: false, wording: 'Ajouter le voteur' }
    }, [isConnected, isPending])

    if (!isConnected || !props.isAdmin) {
        return null
    }

   
    return (
        <div className="border rounded-xl p-6 mb-10">
            <h2 className="text-xl font-medium mb-6">Ajouter un voteur</h2>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Adresse du voteur</Label>
                <Input
                    type="text"
                    placeholder="0x..."
                    value={addressToAdd}
                    onInput={(e) => setAddressToAdd((e.target as HTMLInputElement).value)}
                    disabled={buttonState.disabled}
                />
            </div>

            <Button className="mt-4" onClick={onSave} disabled={buttonState.disabled}>
                {buttonState.wording}
            </Button>
        </div>
    )
}

export default withWorkflowStatus(AddVoter)


