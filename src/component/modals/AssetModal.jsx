import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
export const AssetModal = ({
    isOpen,
    onClose,
    initialData,
    handleSaveAsset,
    fetchLiveGoldPrice,
    isFetchingGold
}) => {
    const [assetForm, setAssetForm] = useState(initialData || { 
        isGold: false, 
        quantity: '', 
        unit: 'chỉ', 
        customGoldPrice: '', 
        currentValue: '' 
    });

    if (!isOpen) return null;

    const onSubmit = () => {
        handleSaveAsset(assetForm);
        onClose();
    };

    const onFetchGoldClick = async () => {

        const livePrice = await fetchLiveGoldPrice(true);
        if (livePrice) {

            setAssetForm({ ...assetForm, customGoldPrice: livePrice });
        }
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 animate-in fade-in">
            <div className="bg-zinc-950 w-full rounded-3xl sm:rounded-[2rem] border border-zinc-700 p-5 sm:p-6 shadow-2xl">
                <h3 className="font-black text-base sm:text-lg text-white mb-4 sm:mb-5">Cập nhật Tài sản</h3>

                {assetForm.isGold ? (
                    <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                        <div className="flex gap-2 sm:gap-3">
                            <div className="flex-[2]">
                                <label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 mb-1 block font-bold">Số lượng đang trữ</label>
                                <input type="number" placeholder="VD: 2.5" value={assetForm.quantity} onChange={e => setAssetForm({ ...assetForm, quantity: e.target.value })} className="w-full bg-black text-yellow-400 rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-black text-[16px]" />
                            </div>
                            <div className="flex-[1]">
                                <label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 mb-1 block font-bold">Đơn vị</label>
                                <select value={assetForm.unit} onChange={e => setAssetForm({ ...assetForm, unit: e.target.value })} className="w-full bg-black text-white rounded-lg sm:rounded-xl px-2 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold appearance-none text-[16px]">
                                    <option value="chỉ">Chỉ</option>
                                    <option value="cây">Cây</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 block font-bold">Đơn giá (1 Chỉ) - VND</label>
                                <button onClick={onFetchGoldClick} className="text-[10px] sm:text-[11px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 sm:px-2 py-1 rounded flex items-center gap-1 hover:bg-yellow-500/20 transition-colors">
                                    {isFetchingGold ? <RefreshCw size={10} className="animate-spin" /> : 'Lấy giá SJC'}
                                </button>
                            </div>
                            <input type="number" value={assetForm.customGoldPrice} onChange={e => setAssetForm({ ...assetForm, customGoldPrice: e.target.value })} className="w-full bg-black text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-800 font-bold text-[16px]" />
                        </div>
                    </div>
                ) : (
                    <div className="mb-5 sm:mb-6">
                        <label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 mb-1.5 sm:mb-2 block font-bold">Tổng giá trị (VND)</label>
                        <input type="number" placeholder="Nhập..." value={assetForm.currentValue} onChange={e => setAssetForm({ ...assetForm, currentValue: e.target.value })} className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 border border-zinc-800 font-bold text-[16px]" />
                    </div>
                )}
                <button onClick={onSubmit} className="w-full py-3.5 sm:py-4 bg-purple-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base hover:bg-purple-500 transition-colors">
                    Lưu Trạng Thái
                </button>
                <button onClick={onClose} className="w-full py-3 sm:py-4 bg-transparent text-zinc-500 mt-1 sm:mt-2 font-bold hover:text-white text-sm sm:text-base transition-colors">
                    Hủy
                </button>
            </div>
        </div>
    );
};