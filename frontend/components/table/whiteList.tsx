'use client'
import React from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus'

import { VotingSessionProps, WhiteListProps } from '@/lib/types'

type CombinedProps = VotingSessionProps & WhiteListProps;

const WhiteList: React.FC<CombinedProps> = ({ isConnected, isVoter, isAdmin,  voterAddressList }) => {

   
    if (!isConnected || !isVoter && !isAdmin) {
        return <div>Vous n&apos;êtes pas autorisé à voir cette liste</div>
    }

    return (
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
    )
}

export default withWorkflowStatus(WhiteList)