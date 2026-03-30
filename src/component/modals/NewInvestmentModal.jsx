import React, { useState } from 'react';

export const NewInvestmentModal = ({
    isOpen,
    onClose,
    handleSaveNewInvestment
}) => {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const onSubmit = () => {
        handleSaveNewInvestment(name);
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 sm:p-6 animate-in fade-in">
            <div className="bg-zinc-900 w-full rounded-3xl sm:rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden p-5 sm:p-6">
                <h3 className="font-black text-base sm:text-lg text-white mb-4 sm:mb-5">Thêm Danh mục Đầu tư</h3>
                
                <input 
                    type="text" 
                    placeholder="Tên danh mục..." 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 font-bold border border-zinc-800 mb-4 sm:mb-5 text-[16px] focus:border-purple-500 transition-colors" 
                />
                
                <button 
                    onClick={onSubmit} 
                    className="w-full bg-purple-600 text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] shadow-lg mb-2 text-sm sm:text-base hover:bg-purple-500 transition-colors active:scale-95"
                >
                    Thêm
                </button>
                
                <button 
                    onClick={onClose} 
                    className="w-full py-3 sm:py-4 text-zinc-500 font-bold text-sm sm:text-base hover:text-zinc-300 transition-colors"
                >
                    Hủy
                </button>
            </div>
        </div>
    );
};