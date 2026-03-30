import { AlertCircle, Check } from 'lucide-react';
export const Toast = ({ toast }) => {
    if (!toast.show) return null;
    return (
    <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 px-3.5 py-2 rounded-full shadow-2xl border border-zinc-800 bg-[#1C1C1E]/95 backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap">
        {toast.type === 'error' ? (
            <AlertCircle size={14} className="text-red-500" />
        ) : (
            <Check size={14} className="text-green-500" />
        )}
        <span className="text-[11px] font-bold text-zinc-200">{toast.message}</span>
    </div>
    )
}