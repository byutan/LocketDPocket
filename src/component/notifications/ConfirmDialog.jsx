import { AlertCircle } from 'lucide-react';

export const ConfirmDialog = ({ confirmDialog, setConfirmDialog }) => {
    if (!confirmDialog.isOpen) return null;
    return (
        <div className="absolute inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 sm:p-8 animate-in fade-in">
            <div className="bg-zinc-900 w-full max-w-[280px] sm:max-w-[320px] rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border border-zinc-800 text-center shadow-2xl">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-red-500"><AlertCircle size={28} className="sm:w-8 sm:h-8" /></div>
                <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-white">{confirmDialog.title}</h3>
                <p className="text-zinc-500 text-[12px] sm:text-sm mb-6 sm:mb-8">{confirmDialog.message}</p>
                <div className="flex gap-3 sm:gap-4">
                    <button onClick={() => setConfirmDialog({ isOpen: false })} className="flex-1 py-3 sm:py-4 bg-zinc-800 rounded-xl sm:rounded-2xl font-black text-white text-sm sm:text-base">Hủy</button>
                    <button onClick={confirmDialog.action} className="flex-1 py-3 sm:py-4 bg-red-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base">Xác nhận</button>
                </div>
            </div>
        </div>
    )
}