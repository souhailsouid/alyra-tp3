'use client'
import React from 'react'
import { useReadContract } from 'wagmi'
import { wagmiContractConfig } from '../lib/utils';
import { VotingSessionProps } from '@/lib/types'
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'


const ViewsWinnerProposal: React.FC<VotingSessionProps> = () => {

    const { data } = useReadContract({
        ...wagmiContractConfig,
        functionName: 'winningProposalID',
    });

    return (
        <div className="border rounded-xl p-6 mb-10 space-x-4">
            <div className='flex flex-col items-center'>
                <span className='text-2xl font-bold'>Proposition gagnante</span>
                <span className='text-2xl font-bold'>ID: {data?.toString()}</span>
            </div>
        </div>
    )
}

export default withWorkflowStatus(ViewsWinnerProposal)