import { ChevronLeft, ChevronRight, Wallet, Zap } from 'lucide-react';

export const CalendarView = ({
  viewMonth,
  setViewMonth,
  selectedDate,
  setSelectedDate,
  transactions,
  setSelectedTxnDetail,
  formatMoney
}) => {
  const year = viewMonth.getFullYear(); 
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOffset = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1;

  const txnsByDateMap = {};
  transactions.forEach(t => {
    if (t.type === 'transfer' && !t.isManualTransfer) return;
    const dStr = t.timestamp.toLocaleDateString('vi-VN');
    if (!txnsByDateMap[dStr]) txnsByDateMap[dStr] = { list: [] };
    txnsByDateMap[dStr].list.push(t);
  });

  const selectedDateStr = selectedDate.toLocaleDateString('vi-VN');
  const selectedDayData = txnsByDateMap[selectedDateStr] || { list: [] };

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-y-auto pb-32 relative z-10">
      <div className="p-4 sm:p-6 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <h2 className="text-xl sm:text-2xl font-black">Nhật ký Lịch</h2>
      </div>
      <div className="p-4 sm:p-5 space-y-5 sm:space-y-6">
        <div className="bg-[#1C1C1E] rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 border border-zinc-800 shadow-xl">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full hover:bg-zinc-700"><ChevronLeft size={18} /></button>
            <h3 className="text-base sm:text-lg font-black uppercase">Tháng {month + 1}, {year}</h3>
            <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full hover:bg-zinc-700"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2 sm:mb-4 text-center">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
              <div key={d} className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-3 sm:gap-y-5 gap-x-1 sm:gap-x-1.5">
            {Array.from({ length: startDayOffset }).map((_, i) => <div key={i}></div>)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1; 
              const dStr = new Date(year, month, day).toLocaleDateString('vi-VN');
              const isSelected = selectedDateStr === dStr;
              const thumb = txnsByDateMap[dStr]?.list.find(t => t.imageUrl)?.imageUrl;
              return (
                <button key={day} onClick={() => setSelectedDate(new Date(year, month, day))} className="flex flex-col items-center w-full">
                  <div className={`w-full aspect-square rounded-[0.8rem] sm:rounded-2xl flex items-center justify-center border-2 transition-all duration-300 relative ${isSelected ? 'border-yellow-400 scale-110 z-10 shadow-md' : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/80'}`}>
                    {thumb ? <img src={thumb} className="w-full h-full object-cover rounded-[0.6rem] sm:rounded-xl" /> : <span className={`text-[10px] sm:text-[12px] font-black ${isSelected ? 'text-yellow-400' : 'text-zinc-600'}`}>{day}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="animate-in slide-in-from-bottom-2">
          <h3 className="text-base sm:text-lg font-black mb-3 sm:mb-4 flex items-center gap-2">Giao dịch <span className="text-yellow-400 text-xs sm:text-sm">({selectedDate.getDate()}/{selectedDate.getMonth() + 1})</span></h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {selectedDayData.list.map(txn => (
              <div key={txn.id} onClick={() => setSelectedTxnDetail(txn)} className="aspect-square bg-zinc-900 rounded-2xl sm:rounded-[1.8rem] overflow-hidden border border-zinc-800 relative shadow-lg cursor-pointer group hover:border-zinc-600 transition-colors">
                {txn.imageUrl ? <img src={txn.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Wallet size={40} /></div>}
                <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/40 to-transparent">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 items-start max-w-[80%]">
                      {txn.type === 'transfer' && <span className="text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase border border-blue-400/50">Chuyển Tiền</span>}
                      {txn.topupLogs && txn.topupLogs.length > 0 && (
                        <span className="text-[8px] sm:text-[9px] font-bold bg-zinc-900/80 text-yellow-400 px-1.5 sm:px-2 py-0.5 rounded-md border border-yellow-500/30 shadow-sm leading-tight inline-flex items-center gap-0.5 backdrop-blur-sm mb-1 truncate max-w-full">
                          <Zap size={8} className="shrink-0" /> Bù {formatMoney(txn.topupLogs.reduce((s, t) => s + t.amount, 0))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className={`text-sm sm:text-lg font-black tracking-tight drop-shadow-md ${txn.type === 'income' ? 'text-green-400' : txn.type === 'transfer' ? 'text-blue-400' : 'text-red-400'}`}>{formatMoney(txn.amount)}</span>
                    <p className="text-[9px] sm:text-[10px] text-zinc-300 font-medium truncate mt-0.5 sm:mt-1 bg-black/40 px-2 py-0.5 rounded-full inline-block backdrop-blur-sm">{txn.caption || 'Giao dịch'}</p>
                  </div>
                </div>
              </div>
            ))}
            {selectedDayData.list.length === 0 && <div className="col-span-2 py-10 sm:py-12 text-center text-zinc-600 text-xs italic border-2 border-dashed border-zinc-900 rounded-2xl sm:rounded-3xl">Trống trơn...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};