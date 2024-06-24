import { BaseError } from 'wagmi'
import { VotingStatusType } from './constants'

export interface VotingSessionProps {
    isConnected: boolean
    workflowStatus: string | null
    refetchWorkflowStatus: () => void
    votingStatus: VotingStatusType
    isAdmin: boolean
    isVoter: boolean
    isUserRoleLoading?: boolean
    address?: string | undefined
    voterRegistered?: any[];
    status?: string
}

export interface WhiteListProps {
    voterAddressList: string[]
}
export interface WorkflowStatusContextProps {
    currentStatus: string | null
    showError: BaseError | null
    refetch: () => void
    isLoading: boolean
}

export interface Proposal {
    voteCount: BigInt
    description: string
}
