import { useState } from 'react';
import { X } from 'lucide-react';
import { formatMoney } from '../../utils/utils';
export const TransferModal = ({
    isOpen,
    onClose,
    accounts,
    currentBalances,
    handleManualTransfer
}) => {
    const [transferForm, setTransferForm] = useState({ fromId: '', toId: '', amount: '' });
    if (!isOpen) return null;
    const onSubmit = () => {
        handleManualTransfer(transferForm);
        setTransferForm({ fromId: '', toId: '', amount: '' });
        onClose();
    };
    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 sm:p-6 animate-in fade-in">
            <div className="bg-zinc-900 w-full rounded-3xl sm:rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-zinc-800 flex justify-between items-center"><h3 className="font-black text-base sm:text-lg text-white">Chuyển tiền nội bộ</h3>
                    <button onClick={onClose} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                    <select value={transferForm.fromId} onChange={e => setTransferForm({ ...transferForm, fromId: e.target.value })} className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 border border-zinc-800 font-bold text-[16px]"><option value="">Rút từ...</option>{accounts.map(a => (<option key={a.id} value={a.id}>{a.name} ({formatMoney(currentBalances[a.id])})</option>))}</select>
                    <select value={transferForm.toId} onChange={e => setTransferForm({ ...transferForm, toId: e.target.value })} className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 border border-zinc-800 font-bold text-[16px]"><option value="">Nạp vào...</option>{accounts.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}</select>
                    <input type="number" placeholder="Số tiền..." value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} className="w-full bg-zinc-950 text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 font-black text-2xl sm:text-3xl border border-zinc-800 text-[16px]" />
                    <button onClick={onSubmit} className="w-full bg-blue-600 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-[2rem] text-sm sm:text-base">Xác nhận chuyển</button>
                </div>
            </div>
        </div>
    )
}