import { PlusCircle, Target, AlertTriangle, ChevronUp, ChevronDown, Edit2, Trash2 } from 'lucide-react';

export const BudgetView = ({
    tags,
    budgets,
    transactions,
    currentMonthKey,
    expandedTags,
    toggleExpand,
    setIsNewBudgetModalOpen,
    setSelectedBudgetData,
    setIsBudgetModalOpen,
    requestDeleteTag,
    handleMoveTag,
    formatMoney
}) => {
    const expenseTags = tags.filter(t => t.type === 'expense');

    return (
        <div className="flex flex-col h-full bg-black text-white overflow-hidden pb-32 relative z-10">
            <div className="p-4 sm:p-5 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Ngân Sách</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 animate-in slide-in-from-right-4">
                <button onClick={() => setIsNewBudgetModalOpen(true)} className="w-full py-3.5 sm:py-4 border-2 border-dashed border-zinc-700 bg-zinc-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base text-zinc-400 font-bold hover:bg-zinc-800 hover:text-white transition-colors">
                    <PlusCircle size={18} className="sm:w-5 sm:h-5" /> Tạo Mới
                </button>
                <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-zinc-200 mt-2 mb-1 sm:mb-2">
                    <Target size={18} className="text-red-400 sm:w-5 sm:h-5" /> Kế hoạch Tháng {new Date().getMonth() + 1}
                </h3>

                {expenseTags.length === 0 && <div className="text-center py-5 sm:py-6 text-zinc-600 text-xs font-bold italic border border-dashed border-zinc-800 rounded-xl">Chưa có danh mục</div>}

                {expenseTags.map((tag, idx) => {
                    const budget = budgets[tag.id] || {};
                    const totalValue = parseFloat(budget.totalValue) || 0;
                    const unitValue = parseFloat(budget.unitValue) || 0;
                    const totalFreq = parseInt(budget.totalFrequency) || 0;

                    const spentTxns = transactions.filter(t => t.type === 'expense' && (t.tagIds || []).includes(tag.id) && `${t.timestamp.getFullYear()}-${String(t.timestamp.getMonth() + 1).padStart(2, '0')}` === currentMonthKey);
                    const spent = spentTxns.reduce((s, t) => s + t.amount, 0);
                    const freqUsed = spentTxns.length;

                    const isExceeded = spent > totalValue;
                    const isFreqExceeded = freqUsed >= totalFreq;

                    let displayUnitBudget = 0;
                    let unitBudgetLabel = "Chi / Lần (Cho phép)";
                    let isUnitBudgetWarning = false;

                    if (freqUsed < totalFreq) {
                        const remainBudget = Math.max(0, totalValue - spent);
                        displayUnitBudget = remainBudget / (totalFreq - freqUsed);
                        unitBudgetLabel = "Chi / Lần (Cho phép)";
                    } else {
                        displayUnitBudget = spent / (freqUsed || 1);
                        unitBudgetLabel = "Thực tế chi / Lần";
                        isUnitBudgetWarning = displayUnitBudget > unitValue;
                    }

                    const remainBudget = isExceeded ? 0 : (totalValue - spent);
                    const gapCost = isExceeded ? (spent - totalValue) : 0;
                    const usedRatio = totalValue > 0 ? Math.min((spent / totalValue) * 100, 100) : 0;

                    const isExpanded = !!expandedTags[tag.id];

                    return (
                        <div key={tag.id} className="bg-gradient-to-b from-zinc-900 to-[#121212] rounded-2xl sm:rounded-[1.8rem] border border-zinc-800 shadow-xl relative overflow-hidden transition-all duration-300">
                            {isExceeded && totalValue > 0 && <div className="absolute top-0 right-0 bg-red-500/20 text-red-500 text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-bl-lg sm:rounded-bl-xl border-b border-l border-red-500/30 flex items-center gap-1 z-10"><AlertTriangle size={10} /> Vượt Ngân Sách</div>}

                            <div onClick={() => toggleExpand(tag.id)} className="p-4 sm:p-5 cursor-pointer active:bg-zinc-800/30 transition-colors">
                                <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
                                    <div className="flex justify-between items-center">
                                        <span className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider ${tag.color} shadow-sm max-w-[40%] truncate`}>{tag.name}</span>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <span className={`text-[11px] sm:text-xs font-bold ${isExceeded ? 'text-red-500' : 'text-zinc-300'}`}>
                                                {formatMoney(spent)} <span className="text-zinc-500">/</span> {formatMoney(totalValue)}
                                            </span>
                                            {isExpanded ? <ChevronUp size={16} className="text-zinc-500 sm:w-5 sm:h-5" /> : <ChevronDown size={16} className="text-zinc-500 sm:w-5 sm:h-5" />}
                                        </div>
                                    </div>
                                    <div className="w-full h-1 sm:h-1.5 bg-black rounded-full overflow-hidden border border-zinc-800/50 mt-0.5 sm:mt-1">
                                        <div className={`h-full ${isExceeded ? 'bg-red-500' : tag.color} transition-all duration-700 ease-out`} style={{ width: `${usedRatio}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1.5 sm:pt-2 border-t border-zinc-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="flex justify-between items-center mb-3 sm:mb-4 mt-1 sm:mt-2">
                                        <div className="flex gap-1.5 sm:gap-2">
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBudgetData({
                                                    id: budget.id || tag.id, // Đề phòng budget.id rỗng
                                                    unitValue: budget.unitValue || '',
                                                    totalFrequency: budget.totalFrequency || '',
                                                    totalValue: budget.totalValue || ''
                                                });
                                                setIsBudgetModalOpen(true);
                                            }} className="text-[10px] sm:text-[11px] text-zinc-400 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg flex items-center gap-1.5 font-bold transition-colors"><Edit2 size={10} className="sm:w-3.5 sm:h-3.5" /> {totalValue > 0 ? 'Sửa' : 'Cài đặt'}</button>
                                            <button onClick={(e) => { e.stopPropagation(); requestDeleteTag(tag.id, tag.name); }} className="text-[10px] sm:text-[11px] uppercase bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg font-bold border border-red-500/20 transition flex items-center gap-1"><Trash2 size={10} className="sm:w-3.5 sm:h-3.5" /> Xóa</button>
                                        </div>
                                        <div className="flex flex-col bg-zinc-800/50 rounded-md sm:rounded-lg overflow-hidden border border-zinc-700">
                                            <button onClick={(e) => { e.stopPropagation(); handleMoveTag(tag.id, 'up'); }} disabled={idx === 0} className={`p-1 flex items-center justify-center transition-colors ${idx === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}><ChevronUp size={12} className="sm:w-4 sm:h-4" /></button>
                                            <div className="h-[1px] w-full bg-zinc-700"></div>
                                            <button onClick={(e) => { e.stopPropagation(); handleMoveTag(tag.id, 'down'); }} disabled={idx === expenseTags.length - 1} className={`p-1 flex items-center justify-center transition-colors ${idx === expenseTags.length - 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}><ChevronDown size={12} className="sm:w-4 sm:h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-2 gap-2 bg-black/40 p-2.5 sm:p-3 rounded-xl border border-zinc-800/50">
                                            <div className="flex flex-col gap-0.5"><span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase">Tổng Ngân Sách</span><span className="text-xs sm:text-sm font-black text-zinc-300 truncate">{formatMoney(totalValue)}</span></div>
                                            <div className="flex flex-col gap-0.5"><span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase">Đã Tiêu</span><span className={`text-xs sm:text-sm font-black truncate ${isExceeded ? 'text-red-400' : 'text-white'}`}>{formatMoney(spent)}</span></div>
                                            <div className="flex flex-col gap-0.5 mt-1.5 sm:mt-2"><span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase">Số Dư Còn Lại</span><span className="text-xs sm:text-sm font-black text-green-400 truncate">{formatMoney(remainBudget)}</span></div>
                                            <div className="flex flex-col gap-0.5 mt-1.5 sm:mt-2"><span className="text-[9px] sm:text-[10px] text-red-500/80 font-bold uppercase">Phần Chi Trội</span><span className="text-xs sm:text-sm font-black text-red-500 truncate">{gapCost > 0 ? formatMoney(gapCost) : '-'}</span></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-zinc-900/50 p-2 sm:p-2.5 rounded-xl border border-zinc-800 flex flex-col justify-center items-center text-center">
                                                <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase mb-0.5 sm:mb-1">Tần suất</span>
                                                {totalFreq > 0 ? (
                                                    <div className="text-[11px] sm:text-xs font-bold text-zinc-300">
                                                        Dùng: <span className={freqUsed > totalFreq ? 'text-red-500' : 'text-white'}>{freqUsed}</span> <span className="text-zinc-600">/</span> <span className="text-zinc-500">{totalFreq}</span>
                                                    </div>
                                                ) : <span className="text-[10px] sm:text-[11px] text-zinc-600">-</span>}
                                            </div>
                                            <div className="flex-[1.5] bg-zinc-900/50 p-2 sm:p-2.5 rounded-xl border border-zinc-800 flex flex-col justify-center">
                                                <span className={`text-[9px] sm:text-[10px] font-bold uppercase mb-0.5 sm:mb-1 ${isFreqExceeded ? 'text-yellow-500/80' : 'text-zinc-500'}`}>{unitBudgetLabel}</span>
                                                <span className={`text-[11px] sm:text-xs font-black truncate ${isFreqExceeded ? (isUnitBudgetWarning ? 'text-red-400' : 'text-yellow-400') : 'text-blue-400'}`}>{displayUnitBudget > 0 ? formatMoney(displayUnitBudget) : '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};