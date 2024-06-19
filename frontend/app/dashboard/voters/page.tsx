'use client'
import React, { useEffect, useState } from 'react'
import { usePublicClient, useWatchContractEvent } from 'wagmi'
import DashboardHeader from '@/components/ui/DashboardHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import AddVoter from './shared/AddVoter'
import VotingContract from '@/../backend/artifacts/contracts/voting.sol/Voting.json'

type Props = {}

export default function Page(props: Props) {
    const [voterAddressList, setVoterAddressList] = useState<string[]>([])

    useWatchContractEvent({
        abi: VotingContract.abi,
        address: process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS,
        eventName: 'VoterRegistered',
        fromBlock: 1n,
        onLogs: (logs: any[]) => {
            setVoterAddressList((voters) => {
                return [...new Set([...voters, ...logs.map((log) => log.args.voterAddress)])]
            })
        },
    })

    return (
        <div>
            <DashboardHeader>Voteurs</DashboardHeader>

            <AddVoter />

            <h2 className="text-xl font-medium mb-6">Liste des voteurs récents</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Adresse</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {voterAddressList.map((address) => (
                        <TableRow key={address}>
                            <TableCell className="font-medium">{address}</TableCell>
                            <TableCell className="w-[40px]">
                                <CheckCircleIcon className=" w-[30px] text-green-600" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
