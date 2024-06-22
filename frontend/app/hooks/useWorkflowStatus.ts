import { useState, useEffect } from 'react';
import { useAccount,  useReadContract,  type BaseError } from 'wagmi';
import { wagmiContractConfig } from '@/lib/utils';
import { WorkflowStatus, statusMessages } from '@/lib/constants';

export const useWorkflowStatus = () => {
    const { isConnected } = useAccount();
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const [showError, setError] = useState<BaseError | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { data: workflowStatus, error, isLoading: readPending, refetch } = useReadContract({
      ...wagmiContractConfig,
        functionName: 'workflowStatus',
    });

    useEffect(() => {
        if (workflowStatus !== undefined) {
            setCurrentStatus(statusMessages[workflowStatus as WorkflowStatus]);
        }

        setError(error as BaseError | null);
        setIsLoading(readPending);
    }, [workflowStatus, error, readPending]);

    return { currentStatus, showError, isLoading, refetch, isConnected };
};
