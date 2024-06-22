
import React, { createContext, useContext } from 'react';
import { useWorkflowStatus } from '@/app/hooks/useWorkflowStatus';

import { WorkflowStatusContextProps } from '@/lib/types';

const WorkflowStatusContext = createContext<WorkflowStatusContextProps | undefined>(undefined);

export const WorkflowStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const workflowStatus = useWorkflowStatus();
    return (
        <WorkflowStatusContext.Provider value={workflowStatus}>
            {children}
        </WorkflowStatusContext.Provider>
    );
};

export const useWorkflowStatusContext = () => {
    const context = useContext(WorkflowStatusContext);
    if (context === undefined) {
        throw new Error('useWorkflowStatusContext must be used within a WorkflowStatusProvider');
    }
    return context;
};
