import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="py-24 text-center">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
    </div>
);
