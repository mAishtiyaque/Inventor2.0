import React, { useEffect, useState } from 'react';
import { manufacturingApi } from '../api/manufacturingApi';
import type { ProcessDefinition } from '../api/manufacturingApi';

import { uiLoader } from '../store/loaderStore';
import { uiAlert } from '../store/alertStore';
import { ExecutionFlow } from './ExecutionFlow';
import { CreateProcessModal } from './CreateProcessModal';

export const ProcessManager: React.FC = () => {
    const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<ProcessDefinition | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadDefinitions();
    }, []);

    const loadDefinitions = async () => {
        uiLoader.show();
        try {
            const response = await manufacturingApi.getDefinitions();
            setDefinitions(response.data);
        } catch (error) {
            uiAlert.error("Failed to load process definitions");
        } finally {
            uiLoader.hide();
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Manufacturing Processes</h3>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        New Definition
                    </button>
                </div>
                <div className="p-6">
                    {definitions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No processes defined yet.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {definitions.map((def) => (
                                <li key={def.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-slate-900">{def.name}</h4>
                                        <p className="text-sm text-slate-500">{def.description}</p>
                                    </div>
                                    <button
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        onClick={() => setSelectedProcess(def)}
                                    >
                                        Execute
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selectedProcess && (
                <ExecutionFlow
                    definition={selectedProcess}
                    onCancel={() => setSelectedProcess(null)}
                    onSuccess={() => {
                        setSelectedProcess(null);
                        loadDefinitions();
                    }}
                />
            )}

            {isCreating && (
                <CreateProcessModal
                    onCancel={() => setIsCreating(false)}
                    onSuccess={() => {
                        setIsCreating(false);
                        loadDefinitions();
                    }}
                />
            )}
        </>
    );
};


