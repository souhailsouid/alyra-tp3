'use client'
import React, { useState } from 'react'
import {  useWatchContractEvent } from 'wagmi'
import DashboardHeader from '@/components/ui/DashboardHeader'
import AddVoter from './shared/AddVoter'
import WhiteList from '@/components/table/whiteList'
import { wagmiContractConfig } from '../../../lib/utils';
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'
import { VotingSessionProps } from '@/lib/types'
import withAuthMiddleware from '@/app/hoc/withAuthMiddleware'


const Page: React.FC<VotingSessionProps> = () => {
    const [voterAddressList, setVoterAddressList] = useState<string[]>([])
    useWatchContractEvent({
        ...wagmiContractConfig,
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
                <DashboardHeader >Voteurs</DashboardHeader>
                <AddVoter />
                <h2 className="text-xl font-medium mb-6">Liste des voteurs récents</h2>
                <WhiteList voterAddressList={voterAddressList} />
            </div>
        )
}

export default withWorkflowStatus(withAuthMiddleware(Page))