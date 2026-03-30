import { useState } from 'react';
import { X, Zap } from 'lucide-react';

export const NewBudgetModal = ({
    isOpen,
    onClose,
    handleSaveNewBudget
}) => {
    const [newBudgetForm, setNewBudgetForm] = useState({
        name: '',
        unitValue: '',
        totalFrequency: '',
        totalValue: ''
    });

    if (!isOpen) return null;

    const handleNewBudgetChange = (field, value) => {
        const newForm = { ...newBudgetForm, [field]: value };

        const unit = parseFloat(newForm.unitValue) || 0;
        const freq = parseInt(newForm.totalFrequency) || 0;

        if (field === 'unitValue' || field === 'totalFrequency') {
            if (unit > 0 && freq > 0) {
                newForm.totalValue = (unit * freq).toString();
            }
        }

        setNewBudgetForm(newForm);
    };

    const isAutoCalculated = (parseFloat(newBudgetForm.unitValue) || 0) > 0 && (parseInt(newBudgetForm.totalFrequency) || 0) > 0;

    const onSubmit = () => {
        handleSaveNewBudget(newBudgetForm);


    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 sm:p-6 animate-in fade-in">
            <div className="bg-zinc-950 w-full rounded-3xl sm:rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden p-5 sm:p-6">
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <h3 className="font-black text-base sm:text-lg text-white">Khởi tạo Ngân sách</h3>
                    <button onClick={onClose} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors">
                        <X size={16} className="text-zinc-400 hover:text-white" />
                    </button>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div>
                        <label className="text-[10px] sm:text-[11px] uppercase text-zinc-400 font-bold mb-1 sm:mb-1.5 block">Tên Danh mục *</label>
                        <input type="text" placeholder="VD: Shopping..." value={newBudgetForm.name} onChange={e => handleNewBudgetChange('name', e.target.value)} className="w-full bg-black text-white rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold text-[16px]" />
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 font-bold mb-1 sm:mb-1.5 block">Giá 1 lần</label>
                            <input type="number" placeholder="50000" value={newBudgetForm.unitValue} onChange={e => handleNewBudgetChange('unitValue', e.target.value)} className="w-full bg-black text-white rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold text-[16px]" />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 font-bold mb-1 sm:mb-1.5 block">Tần suất</label>
                            <input type="number" placeholder="30" value={newBudgetForm.totalFrequency} onChange={e => handleNewBudgetChange('totalFrequency', e.target.value)} className="w-full bg-black text-white rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold text-[16px]" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] sm:text-[11px] uppercase text-red-400 font-bold mb-1 sm:mb-1.5 block">Tổng Ngân sách *</label>
                        <input type="number" placeholder="Tổng..." value={newBudgetForm.totalValue} onChange={e => !isAutoCalculated && handleNewBudgetChange('totalValue', e.target.value)} readOnly={isAutoCalculated} className={`w-full text-red-400 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-5 font-black text-xl sm:text-2xl border border-zinc-800 text-[16px] transition-colors ${isAutoCalculated ? 'bg-zinc-900/50 opacity-70 cursor-not-allowed' : 'bg-black'}`} />
                        {isAutoCalculated && <span className="text-[9px] sm:text-[10px] text-zinc-500 mt-1 block font-medium flex items-center gap-1"><Zap size={10} className="text-yellow-500" /> Đã tự động tính toán</span>}
                    </div>
                </div>

                <button onClick={onSubmit} className="w-full bg-yellow-500 text-black font-black py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform hover:bg-yellow-400 text-sm sm:text-base">
                    Lưu Cài Đặt
                </button>
            </div>
        </div>
    );
};