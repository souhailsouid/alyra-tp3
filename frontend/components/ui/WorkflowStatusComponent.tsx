import React from 'react';

import { WorkflowStatus, statusMessages } from '@/lib/constants';

import { VotingSessionProps } from '@/lib/types';
import withWorkflowStatus from '@/app/hoc/withWorkflowStatus';


const steps = [
    { id: WorkflowStatus.RegisteringVoters, label: statusMessages[WorkflowStatus.RegisteringVoters] },
    { id: WorkflowStatus.ProposalsRegistrationStarted, label: statusMessages[WorkflowStatus.ProposalsRegistrationStarted] },
    { id: WorkflowStatus.ProposalsRegistrationEnded, label: statusMessages[WorkflowStatus.ProposalsRegistrationEnded] },
    { id: WorkflowStatus.VotingSessionStarted, label: statusMessages[WorkflowStatus.VotingSessionStarted] },
    { id: WorkflowStatus.VotingSessionEnded, label: statusMessages[WorkflowStatus.VotingSessionEnded] },
    { id: WorkflowStatus.VotesTallied, label: statusMessages[WorkflowStatus.VotesTallied] },
];
const WorkflowStatusComponent: React.FC<VotingSessionProps> = ({ isConnected, workflowStatus }) => {


    if (!isConnected) {
        return null
    }
    const currentStepIndex = steps.findIndex(step => step.label === workflowStatus);

    return (
        <ol className="flex items-center w-full text-sm text-gray-500 font-medium sm:text-base flex-wrap">
            {steps.map((step, index) => (
                <li
                    key={step.id}
                    className={`flex md:w-full items-center ${index <= currentStepIndex ? 'text-teal-500' : 'text-gray-600'
                        } sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-4 xl:after:mx-8`}
                >
                    <div className="flex items-center whitespace-nowrap after:content-['/'] sm:after:hidden after:mx-2">
                        <span
                            className={`w-6 h-6 ${index <= currentStepIndex ? 'bg-teal-600 border-teal-200 text-white' : 'bg-gray-100 border-gray-200 text-gray-600'
                                } rounded-full flex justify-center items-center mr-3 text-sm lg:w-10 lg:h-10`}
                        >
                            {index + 1}
                        </span>
                        {step.label}
                    </div>
                </li>
            ))}
        </ol>
    );
};


export default withWorkflowStatus(WorkflowStatusComponent)