'use client'
import React from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircleIcon } from '@heroicons/react/24/outline'


import { WhiteListProps } from '@/lib/types'


type CombinedProps = WhiteListProps;

const WhiteList: React.FC<CombinedProps> = ({ voterAddressList }) => {

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

export default WhiteList