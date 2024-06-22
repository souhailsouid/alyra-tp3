import { BaseError } from "wagmi";
import { VotingStatusType } from "./constants";



export interface VotingSessionProps {
    isConnected: boolean;
    workflowStatus: string | null;
    refetchWorkflowStatus: () => void;
    votingStatus: VotingStatusType;
    isAdmin: boolean;
    isVoter: boolean;
   
}

export interface WhiteListProps {
    voterAddressList: string[]

}
export interface WorkflowStatusContextProps {
    currentStatus: string | null;
    showError: BaseError | null;
    refetch: () => void;
    isLoading: boolean;
}
