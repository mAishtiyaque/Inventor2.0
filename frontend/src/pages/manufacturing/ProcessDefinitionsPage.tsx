import React, { useEffect, useState } from 'react';
import { manufacturingApi } from '../../api/manufacturingApi';
import type { ProcessDefinition } from '../../api/manufacturingApi';
import { uiLoader } from '../../store/loaderStore';
import { uiAlert } from '../../store/alertStore';
import { useModal } from '../../store/modalStore';
import { Plus, BookOpen, Settings2, ChevronRight, Activity, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProcessDefinitionsPage: React.FC = () => {
    const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const modal = useModal();

    useEffect(() => {
        loadDefinitions();
    }, []);

    const loadDefinitions = async () => {
        uiLoader.show();
        try {
            const resp = await manufacturingApi.getDefinitions();
            setDefinitions(resp.data);
        } catch (e) {
            uiAlert.error("Failed to load manufacturing processes");
        } finally {
            uiLoader.hide();
        }
    };

    const filteredDefinitions = definitions.filter(def =>
        def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        def.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Process Definitions</h2>
                    <p className="text-slate-500 font-medium">Manage manufacturing recipes, BOMs, and production rules.</p>
                </div>
                <button
                    onClick={() => modal.open('CREATE_PROCESS')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    <Plus size={18} />
                    New Definition
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm flex items-center gap-2 max-w-md">
                <div className="pl-2 text-slate-400">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search definitions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 py-1 bg-transparent outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDefinitions.map((def) => (
                    <div key={def.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                <Settings2 size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{def.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{def.versions?.length || 0} Revisions</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10 font-medium leading-relaxed">
                            {def.description || "No description provided for this manufacturing process."}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/manufacturing/definitions/${def.id}`)}
                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black tracking-widest hover:bg-slate-800 transition-colors uppercase flex items-center justify-center gap-2"
                            >
                                Manage Versions
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredDefinitions.length === 0 && searchQuery && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl text-slate-300 mb-4">
                            <Search size={32} />
                        </div>
                        <p className="text-slate-400 font-bold tracking-tight uppercase text-xs">No definitions matching "{searchQuery}"</p>
                    </div>
                )}

                {definitions.length === 0 && !searchQuery && (
                    <button
                        onClick={() => modal.open('CREATE_PROCESS')}
                        className="lg:col-span-3 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-slate-300 hover:bg-slate-50 transition-all flex flex-col items-center gap-4"
                    >
                        <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 mb-2">
                            <Activity size={32} />
                        </div>
                        <div>
                            <p className="text-slate-900 font-bold mb-1">No Processes Defined</p>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Build your production rules and BOMs here.</p>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};
