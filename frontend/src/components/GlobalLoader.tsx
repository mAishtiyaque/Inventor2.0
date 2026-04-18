import React from 'react';
import { useLoaderStore } from '../store/loaderStore';

export const GlobalLoader: React.FC = () => {
    const isLoading = useLoaderStore((state) => state.isLoading);

    if (!isLoading) return null;

    return (
        <div className="col-span-full py-24 text-center fixed inset-0 z-[60] flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
        </div>
    );
};
