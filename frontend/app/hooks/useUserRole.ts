import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi'

import { wagmiContractConfig } from '@/lib/utils'

export const useUserRole = () => {
    const { address, isConnected } = useAccount()
    const [isVoter, setIsVoter] = useState<boolean>(false)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [isUserRoleLoading, setIsLoading] = useState(true)
    const [errorUserRole, setError] = useState<Error | null>(null)
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

    const { data: ownerAddress, error: ownerError } = useReadContract({
        ...wagmiContractConfig,
        functionName: 'owner',
    })
 
    useEffect(() => {
        if (ownerAddress) {
            ownerAddress === address ? setIsAdmin(true) : setIsAdmin(false)
            setIsLoading(false)
        }
        if (ownerError) {
            setError(ownerError)
            setIsLoading(false)
        }
        if(voterAddressList){
            setIsVoter(voterAddressList.some((voter) => voter === address))
        }
    }, [ownerError, isUserRoleLoading, voterAddressList, address, ownerAddress])

    return { ownerAddress, errorUserRole, isAdmin, isConnected, isUserRoleLoading, isVoter }
}
