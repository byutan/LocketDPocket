import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';

export const StatsView = ({
  statsMode, setStatsMode,
  statsRefDate, setStatsRefDate,
  statsCustomRange, setStatsCustomRange,
  transactions,
  tags,
  formatMoney
}) => {
  // 1. CHUYỂN NGÀY THÁNG NAVIGATOR
  const handlePrevPeriod = () => {
    const d = new Date(statsRefDate);
    if (statsMode === 'day') d.setDate(d.getDate() - 1);
    else if (statsMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (statsMode === 'year') d.setFullYear(d.getFullYear() - 1);
    setStatsRefDate(d);
  };

  const handleNextPeriod = () => {
    const d = new Date(statsRefDate);
    if (statsMode === 'day') d.setDate(d.getDate() + 1);
    else if (statsMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (statsMode === 'year') d.setFullYear(d.getFullYear() + 1);
    setStatsRefDate(d);
  };

  const getPeriodLabel = () => {
    if (statsMode === 'day') return `${statsRefDate.getDate()}/${statsRefDate.getMonth() + 1}/${statsRefDate.getFullYear()}`;
    if (statsMode === 'month') return `Tháng ${statsRefDate.getMonth() + 1}, ${statsRefDate.getFullYear()}`;
    if (statsMode === 'year') return `Năm ${statsRefDate.getFullYear()}`;
    return '';
  };

  // 2. LỌC GIAO DỊCH THEO KHOẢNG THỜI GIAN
  const filteredTxns = transactions.filter(t => {
    const d = new Date(t.timestamp);
    if (statsMode === 'day') {
      return d.getDate() === statsRefDate.getDate() && d.getMonth() === statsRefDate.getMonth() && d.getFullYear() === statsRefDate.getFullYear();
    } else if (statsMode === 'month') {
      return d.getMonth() === statsRefDate.getMonth() && d.getFullYear() === statsRefDate.getFullYear();
    } else if (statsMode === 'year') {
      return d.getFullYear() === statsRefDate.getFullYear();
    } else if (statsMode === 'custom') {
      if (!statsCustomRange.start || !statsCustomRange.end) return true;
      const s = new Date(statsCustomRange.start); s.setHours(0, 0, 0, 0);
      const e = new Date(statsCustomRange.end); e.setHours(23, 59, 59, 999);
      return d >= s && d <= e;
    }
    return true;
  });

  const expenseTags = tags.filter(t => t.type === 'expense');
  const totalExpense = filteredTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = filteredTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  // 3. TẠO BIỂU ĐỒ ADAPTIVE
  let chartData = [];
  if (statsMode === 'day') {
    chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(statsRefDate);
      d.setDate(d.getDate() - (6 - i));
      const dStr = d.toLocaleDateString('vi-VN');
      const spent = transactions.filter(t => t.type === 'expense' && t.timestamp.toLocaleDateString('vi-VN') === dStr).reduce((s, t) => s + t.amount, 0);
      return { label: `${d.getDate()}/${d.getMonth() + 1}`, spent, isHighlight: i === 6 };
    });
  } else if (statsMode === 'month') {
    const weeks = [{ l: 'Tuần 1', s: 1, e: 7 }, { l: 'Tuần 2', s: 8, e: 14 }, { l: 'Tuần 3', s: 15, e: 21 }, { l: 'Tuần 4', s: 22, e: 31 }];
    chartData = weeks.map(w => {
      const spent = filteredTxns.filter(t => t.type === 'expense' && t.timestamp.getDate() >= w.s && t.timestamp.getDate() <= w.e).reduce((s, t) => s + t.amount, 0);
      return { label: w.l, spent, isHighlight: false };
    });
  } else if (statsMode === 'year') {
    chartData = Array.from({ length: 12 }, (_, i) => {
      const spent = filteredTxns.filter(t => t.type === 'expense' && t.timestamp.getMonth() === i).reduce((s, t) => s + t.amount, 0);
      return { label: `T${i + 1}`, spent, isHighlight: new Date().getMonth() === i && statsRefDate.getFullYear() === new Date().getFullYear() };
    });
  }
  const maxChartSpend = Math.max(...chartData.map(d => d.spent), 1);

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-y-auto pb-32 relative z-10">
      <div className="p-4 sm:p-6 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-10">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-center">Báo cáo</h2>
      </div>

      <div className="p-4 sm:p-5 space-y-4 sm:space-y-6">
        {/* THANH MENU CHỌN FILTER */}
        <div className="flex bg-zinc-900 rounded-xl sm:rounded-2xl p-1 gap-1 border border-zinc-800 relative z-0 shadow-lg">
          {['day', 'month', 'year', 'custom'].map(mode => (
            <button
              key={mode}
              onClick={() => setStatsMode(mode)}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all ${statsMode === mode ? 'bg-yellow-400 text-black shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {mode === 'day' ? 'Ngày' : mode === 'month' ? 'Tháng' : mode === 'year' ? 'Năm' : 'Tùy chọn'}
            </button>
          ))}
        </div>

        {/* NAVIGATOR KHOẢNG THỜI GIAN */}
        <div className="bg-[#1C1C1E] rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 border border-zinc-800 shadow-xl flex items-center justify-between">
          {statsMode !== 'custom' ? (
            <>
              <button onClick={handlePrevPeriod} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full active:scale-90 transition-transform"><ChevronLeft size={18} className="sm:w-5 sm:h-5" /></button>
              <h3 className="text-xs sm:text-sm font-black uppercase text-yellow-400 flex items-center gap-1.5 sm:gap-2"><Calendar size={14} className="sm:w-4 sm:h-4" /> {getPeriodLabel()}</h3>
              <button onClick={handleNextPeriod} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full active:scale-90 transition-transform"><ChevronRight size={18} className="sm:w-5 sm:h-5" /></button>
            </>
          ) : (
            <div className="w-full flex flex-col gap-2.5 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Filter size={14} className="text-zinc-500 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase">Khoảng thời gian</span>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <input type="date" value={statsCustomRange.start} onChange={e => setStatsCustomRange({ ...statsCustomRange, start: e.target.value })} className="flex-1 bg-black text-white text-[16px] sm:text-sm rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 border border-zinc-800 font-bold" />
                <input type="date" value={statsCustomRange.end} onChange={e => setStatsCustomRange({ ...statsCustomRange, end: e.target.value })} className="flex-1 bg-black text-white text-[16px] sm:text-sm rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 border border-zinc-800 font-bold" />
              </div>
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <div className="bg-gradient-to-br from-[#1C1C1E] to-black rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="font-black text-xs sm:text-sm text-zinc-400 uppercase tracking-widest mb-3 sm:mb-4">Dòng tiền (Cashflow)</h3>
          <div className="flex justify-between items-end mb-1.5 sm:mb-2">
            <div className="max-w-[45%]"><span className="text-[10px] sm:text-[11px] text-zinc-500 font-bold block">Tổng Thu (IN)</span><span className="text-base sm:text-xl font-black text-green-400 tracking-tight truncate block">{formatMoney(totalIncome)}</span></div>
            <div className="text-right max-w-[45%]"><span className="text-[10px] sm:text-[11px] text-zinc-500 font-bold block">Tổng Chi (OUT)</span><span className="text-base sm:text-xl font-black text-red-500 tracking-tight truncate block">{formatMoney(totalExpense)}</span></div>
          </div>
          <div className="w-full h-2.5 sm:h-3 flex rounded-full overflow-hidden mt-2.5 sm:mt-3 bg-zinc-900 border border-zinc-800 shadow-inner">
            {totalIncome === 0 && totalExpense === 0 ? <div className="w-full h-full bg-zinc-800"></div> : <><div className="h-full bg-green-500" style={{ width: `${(totalIncome / (totalIncome + totalExpense)) * 100}%` }}></div><div className="h-full bg-red-500" style={{ width: `${(totalExpense / (totalIncome + totalExpense)) * 100}%` }}></div></>}
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-800/50 flex justify-between items-center"><span className="text-[11px] sm:text-xs text-zinc-400 font-bold">Thực nhận (Net):</span><span className={`text-lg sm:text-xl font-black tracking-tight truncate max-w-[60%] text-right ${totalIncome - totalExpense >= 0 ? 'text-white' : 'text-red-400'}`}>{totalIncome - totalExpense > 0 ? '+' : ''}{formatMoney(totalIncome - totalExpense)}</span></div>
        </div>

        {/* BIỂU ĐỒ ADAPTIVE */}
        {statsMode !== 'custom' && (
          <div className="bg-[#1C1C1E] rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 border border-zinc-800 shadow-xl">
            <h3 className="font-black text-xs sm:text-sm text-zinc-400 uppercase tracking-widest mb-4 sm:mb-6">Xu hướng chi tiêu</h3>
            <div className={`h-32 sm:h-40 flex items-end gap-1.5 sm:gap-2 ${statsMode === 'year' ? 'overflow-x-auto pb-2 -mx-2 px-2 snap-x' : 'justify-between'}`}>
              {chartData.map((d, i) => {
                const height = (d.spent / maxChartSpend) * 100;
                return (
                  <div key={i} className={`flex flex-col items-center gap-1.5 sm:gap-2 group snap-center ${statsMode === 'year' ? 'min-w-[36px] sm:min-w-[40px]' : 'flex-1'}`}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6 sm:-mt-8 text-[8px] sm:text-[9px] font-bold bg-zinc-800 px-1 sm:px-1.5 py-0.5 rounded text-white pointer-events-none whitespace-nowrap z-10">{formatMoney(d.spent)}</div>
                    <div className="w-full bg-zinc-900 rounded-t-[4px] sm:rounded-t-md relative flex items-end justify-center h-full max-h-24 sm:max-h-32"><div className={`w-full rounded-t-[4px] sm:rounded-t-md transition-all duration-700 ease-out ${d.isHighlight ? 'bg-yellow-400' : 'bg-red-500/80 hover:bg-red-400'}`} style={{ height: `${height}%`, minHeight: d.spent > 0 ? '4px' : '0' }}></div></div>
                    <span className={`text-[9px] sm:text-[10px] font-bold ${d.isHighlight ? 'text-yellow-400' : 'text-zinc-500'}`}>{d.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-[#1C1C1E] rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 border border-zinc-800 shadow-xl">
          <h3 className="font-black text-xs sm:text-sm text-zinc-400 uppercase tracking-widest mb-3 sm:mb-4">Cơ cấu Chi Tiêu</h3>
          {totalExpense === 0 ? <div className="text-center py-5 sm:py-6 text-zinc-600 text-xs font-bold italic border border-dashed border-zinc-800 rounded-xl">Chưa có dữ liệu</div> : (
            <div className="space-y-3 sm:space-y-4">
              {expenseTags.map(tag => {
                const amount = filteredTxns.filter(t => t.type === 'expense' && (t.tagIds || []).includes(tag.id)).reduce((s, t) => s + t.amount, 0);
                const ratio = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                if (amount === 0) return null;
                return (
                  <div key={tag.id} className="relative">
                    <div className="flex justify-between items-end mb-1 sm:mb-1.5"><span className="font-bold text-[11px] sm:text-[12px] text-zinc-300 flex items-center gap-1.5 truncate max-w-[50%]"><div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${tag.color}`}></div>{tag.name}</span><div className="text-right"><span className="font-black text-xs sm:text-sm text-white block leading-none mb-0.5">{formatMoney(amount)}</span><span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold">{ratio.toFixed(1)}%</span></div></div>
                    <div className="w-full bg-zinc-900 h-1 sm:h-1.5 rounded-full overflow-hidden"><div className={`h-full ${tag.color}`} style={{ width: `${ratio}%` }}></div></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};