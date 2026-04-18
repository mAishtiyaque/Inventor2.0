import React, { useState } from 'react';
import { manufacturingApi } from '../api/manufacturingApi';
import { uiAlert } from '../store/alertStore';
import { uiLoader } from '../store/loaderStore';

interface CreateProcessModalProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateProcessModal: React.FC<CreateProcessModalProps> = ({ onSuccess, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            uiAlert.warning("Name is required");
            return;
        }

        uiLoader.show();
        try {
            await manufacturingApi.createDefinition({ name, description });
            uiAlert.success("Process definition created successfully");
            onSuccess();
        } catch (error) {
            uiAlert.error("Failed to create process definition");
        } finally {
            uiLoader.hide();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">New Process Definition</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Process Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                            placeholder="e.g. Cutting & Stitching"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all h-24"
                            placeholder="Brief description of the process..."
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
