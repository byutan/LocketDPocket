import { useState } from 'react';
export const WithdrawModal = ({
    isOpen,
    onClose,
    accounts,
    handleWithdrawInvestment,
    tagId
}) => {
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', accountId: '' });

    if (!isOpen)
        return null;
    const onSubmit = () => {
        const dataToSubmit = {
            ...withdrawForm,
            tagId: tagId 
        };
        handleWithdrawInvestment(dataToSubmit);
        setWithdrawForm({ amount: '', accountId: '' });
        onClose();
    };
    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 animate-in fade-in">
            <div className="bg-zinc-950 w-full rounded-3xl sm:rounded-[2rem] border border-zinc-700 p-5 sm:p-6">
                <h3 className="font-black text-base sm:text-lg text-white mb-4 sm:mb-5">Rút vốn đầu tư</h3>

                <input
                    type="number"
                    placeholder="Số tiền muốn rút về"
                    value={withdrawForm.amount}
                    onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 border border-zinc-800 font-bold text-[16px] mb-3 sm:mb-4"
                />

                <select
                    value={withdrawForm.accountId}
                    onChange={e => setWithdrawForm({ ...withdrawForm, accountId: e.target.value })}
                    className="w-full bg-black text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 mb-3 sm:mb-4 border border-zinc-800 text-[16px]"
                >
                    <option value="">Chọn tài khoản nhận...</option>
                    {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
                <button
                    onClick={onSubmit}
                    className="w-full py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base hover:bg-blue-500 transition-colors"
                >
                    Xác nhận Rút Về
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-3 sm:py-4 bg-transparent text-zinc-400 mt-1 sm:mt-2 font-bold text-sm sm:text-base hover:text-white transition-colors"
                >
                    Hủy
                </button>
            </div>
        </div>
    );
}