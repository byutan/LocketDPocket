
import { CalendarDays, Wallet, Camera, Target, PieChart } from 'lucide-react';
export const NavigationBar = (
    { activeTab, setActiveTab, isDrafting, draftImage, selectedTxnDetail, capturePhoto }
) => {
    if (isDrafting || draftImage || selectedTxnDetail) {
        return null;
    }
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-zinc-800/50 px-2 xs:px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-end pb-6 sm:pb-4 z-20">
            <button onClick={() => setActiveTab('calendar')} className={`flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0 transition-all duration-300 ${activeTab === 'calendar' ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}><CalendarDays size={20} className="sm:w-6 sm:h-6" strokeWidth={activeTab === 'calendar' ? 2.5 : 2} /><span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">Nhật ký</span></button>
            <button onClick={() => setActiveTab('asset')} className={`flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0 transition-all duration-300 ${activeTab === 'asset' ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}><Wallet size={20} className="sm:w-6 sm:h-6" strokeWidth={activeTab === 'asset' ? 2.5 : 2} /><span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">Tài sản</span></button>
            <button
                onClick={() => {
                    if (activeTab === 'camera') {
                        // Gọi hàm chụp ảnh nếu đang ở tab Camera
                        if (capturePhoto) capturePhoto(); 
                    } else {
                        // Điều hướng sang tab Camera nếu đang ở tab khác
                        setActiveTab('camera');
                    }
                }}
                className="relative -mt-8 sm:-mt-10 mx-1 sm:mx-2 shrink-0 group active:scale-95 transition-transform"
            >
                <div className={`absolute inset-0 bg-yellow-400 rounded-full blur-xl transition-opacity duration-500 ${activeTab === 'camera' ? 'opacity-40' : 'opacity-0'}`}></div>
                <div className="relative p-3 sm:p-4 rounded-full border-4 border-black bg-yellow-400 text-black scale-105 sm:scale-110 shadow-lg flex items-center justify-center">
                    {/* Giao diện nút sẽ tự động thay đổi dựa vào activeTab */}
                    {activeTab === 'camera' ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full border border-yellow-600 shadow-inner"></div> 
                    ) : (
                        <Camera size={22} className="sm:w-6 sm:h-6" />
                    )}
                </div>
            </button>
            <button onClick={() => setActiveTab('budget')} className={`flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0 transition-all duration-300 ${activeTab === 'budget' ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}><Target size={20} className="sm:w-6 sm:h-6" strokeWidth={activeTab === 'budget' ? 2.5 : 2} /><span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">Ngân sách</span></button>
            <button onClick={() => setActiveTab('stats')} className={`flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0 transition-all duration-300 ${activeTab === 'stats' ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}><PieChart size={20} className="sm:w-6 sm:h-6" strokeWidth={activeTab === 'stats' ? 2.5 : 2} /><span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">Báo cáo</span></button>
        </div>
    )
}