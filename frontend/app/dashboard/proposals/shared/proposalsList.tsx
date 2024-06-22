'use client'
import React, { useState } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import VotingContract from '@/types/contracts/voting.sol/Voting.json'
import ProposalDescription from './ProposalDescription'

export default function ProposalsTable() {
    const [proposalId, setProposalId] = useState<string[]>([])

    useWatchContractEvent({
        abi: VotingContract.abi,
        address: process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS,
        eventName: 'ProposalRegistered',
        fromBlock: 1n,
        onLogs: (logs: any[]) => {
            setProposalId((prevProposals) => [
                ...new Set([...prevProposals, ...logs.map((log) => log.args.proposalId.toString())]),
            ])
        },
    })

    return (
        <>
            <h2 className="text-xl font-medium mb-6">Propositions</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Proposal ID</TableHead>
                        <TableHead>Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {proposalId.map((idProposal) => (
                        <TableRow key={idProposal}>
                            <TableCell className="w-[100px]">{idProposal}</TableCell>
                            <TableCell>
                                <ProposalDescription proposalId={idProposal} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}
