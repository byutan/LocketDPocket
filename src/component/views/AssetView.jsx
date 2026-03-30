import { 
  EyeOff, Eye, Wallet, ArrowRightLeft, Plus, Zap, 
  Edit2, Trash2, TrendingUp, ChevronUp, ChevronDown, ArrowDownToLine 
} from 'lucide-react';

export const AssetView = ({
  tags,
  accounts,
  currentBalances,
  assets,
  isTotalHidden,
  setIsTotalHidden,
  formatMoney,
  setIsTransferModalOpen,
  isAccountFormVisible,
  setIsAccountFormVisible,
  accountForm,
  setAccountForm,
  saveAccount,
  deleteAccount,
  hiddenBalances,
  toggleHideBalance,
  setIsNewInvestmentModalOpen,
  expandedTags,
  toggleExpand,
  openAssetModal,
  setSelectedWithdrawTagId,
  setIsWithdrawModalOpen,
  requestDeleteTag,
  handleMoveTag
}) => {
  const investmentTags = tags.filter(t => t.type === 'investment');
  const totalCashOnHand = accounts.reduce((sum, acc) => sum + (currentBalances[acc.id] || 0), 0);
  const totalInvestmentValue = investmentTags.reduce((sum, t) => sum + ((assets[t.id]?.totalInvested || 0) + (assets[t.id]?.pnl || 0)), 0);
  const totalNetWorth = totalCashOnHand + totalInvestmentValue;

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden pb-32 relative z-10">
      <div className="p-4 sm:p-5 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-20">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">Tài Sản & Ví</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 sm:space-y-8 animate-in slide-in-from-left-4">

        {/* Tổng tài sản */}
        <div className="bg-gradient-to-br from-zinc-800 to-black rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-zinc-700 shadow-2xl relative">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-black uppercase tracking-widest bg-zinc-900/80 px-2.5 sm:px-3 py-1 rounded-full">Tổng tài sản</span>
            <button onClick={() => setIsTotalHidden(!isTotalHidden)} className="p-1.5 sm:p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900 rounded-full border border-zinc-700">
              {isTotalHidden ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 truncate">
            {isTotalHidden ? '******' : formatMoney(totalNetWorth)}
          </div>
        </div>

        {/* Nguồn tiền (Ví) */}
        <div>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-zinc-200">
              <Wallet size={18} className="text-blue-400 sm:w-5 sm:h-5" /> Nguồn tiền (Ví)
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setIsTransferModalOpen(true)} className="p-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg shadow-sm">
                <ArrowRightLeft size={14} className="sm:w-4 sm:h-4" />
              </button>
              {!isAccountFormVisible && (
                <button onClick={() => { 
                  setAccountForm({ id: null, name: '', initialBalance: '', fallbackId: '' }); 
                  setIsAccountFormVisible(true); 
                }} className="text-[10px] sm:text-[11px] bg-zinc-800 px-2.5 py-1.5 rounded-lg text-zinc-300 font-bold flex items-center gap-1">
                  <Plus size={12} /> Thêm
                </button>
              )}
            </div>
          </div>

          {isAccountFormVisible ? (
            <div className="bg-zinc-900 rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-5 border border-zinc-700 shadow-xl animate-in fade-in">
              <h4 className="font-black text-sm sm:text-base text-white mb-3 sm:mb-4">{accountForm.id ? 'Sửa Ví' : 'Thêm Ví'}</h4>
              <div className="space-y-2.5 sm:space-y-3">
                <input type="text" placeholder="Tên ví..." value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} className="w-full bg-black text-white text-[16px] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-800 font-bold" />
                <input type="number" placeholder="Số dư..." value={accountForm.initialBalance} onChange={e => setAccountForm({ ...accountForm, initialBalance: e.target.value })} className="w-full bg-black text-white text-[16px] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-800 font-bold" />
                <div className="bg-black p-2.5 sm:p-3 rounded-xl border border-zinc-800 mt-2">
                  <label className="text-[10px] sm:text-[11px] uppercase font-bold text-zinc-500 mb-1.5 sm:mb-2 flex items-center gap-1">
                    <Zap size={12} className="text-yellow-500 sm:w-3.5 sm:h-3.5" /> Ví Dự Phòng (Auto-Topup)
                  </label>
                  <select value={accountForm.fallbackId} onChange={e => setAccountForm({ ...accountForm, fallbackId: e.target.value })} className="w-full bg-zinc-900 text-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-zinc-800 font-bold text-[16px]">
                    <option value="">-- Không có --</option>
                    {accounts.filter(a => a.id !== accountForm.id).map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsAccountFormVisible(false)} className="flex-1 bg-zinc-800 py-2.5 sm:py-3 rounded-xl text-sm font-black text-white">Hủy</button>
                  <button onClick={saveAccount} className="flex-1 bg-blue-600 py-2.5 sm:py-3 rounded-xl text-sm font-black text-white">Lưu</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {accounts.map(acc => {
                const fallback = accounts.find(a => a.id === acc.fallbackId);
                const isHidden = hiddenBalances[acc.id] || isTotalHidden;

                return (
                  <div key={acc.id} className="bg-black/50 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-zinc-800 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2 max-w-[65%]">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${acc.color} shadow-md`}></div>
                        <span className="font-bold text-sm sm:text-base text-white truncate">{acc.name}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => { setAccountForm({ ...acc }); setIsAccountFormVisible(true); }} className="p-1.5 bg-zinc-900 text-zinc-400 rounded-lg hover:text-white transition-colors"><Edit2 size={12} /></button>
                        <button onClick={() => deleteAccount(acc.id)} className="p-1.5 bg-zinc-900 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      {fallback ? <div className="text-[9px] sm:text-[10px] font-bold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 max-w-[40%] truncate"><Zap size={10} className="shrink-0" /> Backup: {fallback.name}</div> : <div></div>}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-black text-lg sm:text-xl text-white tracking-tight">{isHidden ? '******' : formatMoney(currentBalances[acc.id])}</span>
                        <button onClick={(e) => toggleHideBalance(acc.id, e)} className="text-zinc-500 hover:text-white transition-colors p-1">
                          {isHidden ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Đầu Tư */}
        <div>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-zinc-200">
              <TrendingUp size={18} className="text-purple-500 sm:w-5 sm:h-5" /> Đầu Tư
            </h3>
            <button onClick={() => setIsNewInvestmentModalOpen(true)} className="text-[10px] sm:text-[11px] bg-purple-500/20 px-2 sm:px-2.5 py-1.5 rounded-lg text-purple-400 font-bold flex items-center gap-1 border border-purple-500/30">
              <Plus size={12} /> Thêm DM
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {investmentTags.length === 0 && <div className="text-center py-5 sm:py-6 text-zinc-600 text-xs font-bold italic border border-dashed border-zinc-800 rounded-xl">Chưa có danh mục</div>}

            {investmentTags.map((tag, idx) => {
              const ast = assets[tag.id] || { totalInvested: 0, pnl: 0 };
              const currentVal = ast.totalInvested + ast.pnl;
              const isGold = (tag.name || '').toLowerCase().includes('vàng');
              const isExpanded = !!expandedTags[tag.id];
              const isHidden = hiddenBalances[tag.id] || isTotalHidden;

              return (
                <div key={tag.id} className="bg-[#1C1C1E] rounded-2xl sm:rounded-[2rem] border border-zinc-800 shadow-xl relative overflow-hidden transition-all duration-300">
                  <div onClick={() => toggleExpand(tag.id)} className="p-4 sm:p-5 cursor-pointer flex justify-between items-center active:bg-zinc-800/30 transition-colors">
                    <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider ${tag.color} flex items-center gap-1 shadow-sm max-w-[50%] truncate`}>
                          {tag.name} {isGold && <Zap size={10} className="text-yellow-200 shrink-0" />}
                        </span>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="text-right flex items-center gap-1.5 sm:gap-2">
                            <span className="text-sm sm:text-base font-black text-white block">{isHidden ? '******' : formatMoney(currentVal)}</span>
                            <button onClick={(e) => toggleHideBalance(tag.id, e)} className="text-zinc-500 hover:text-white transition-colors">
                              {isHidden ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                            </button>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className="text-zinc-500 sm:w-5 sm:h-5" /> : <ChevronDown size={16} className="text-zinc-500 sm:w-5 sm:h-5" />}
                        </div>
                      </div>
                      {!isExpanded && (
                        <div className="flex justify-end mt-0.5">
                          <span className={`text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded ${ast.pnl >= 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {isHidden ? '***' : `${ast.pnl >= 0 ? 'Lãi +' : 'Lỗ '}${formatMoney(ast.pnl)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 border-t border-zinc-800/50 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="flex justify-between items-center mb-3 sm:mb-4 mt-1 sm:mt-2">
                        <div className="flex gap-1.5 sm:gap-2">
                          <button onClick={(e) => { 
                            e.stopPropagation(); 
                            openAssetModal(tag, ast, isGold); 
                          }} className="text-[10px] sm:text-[11px] uppercase bg-zinc-800 hover:bg-zinc-700 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-purple-400 font-bold border border-zinc-700 transition">
                            Cập nhật
                          </button>
                          {currentVal > 0 && 
                            <button onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedWithdrawTagId(tag.id);
                              setIsWithdrawModalOpen(true); 
                            }} className="text-[10px] sm:text-[11px] uppercase bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg font-bold border border-blue-500/20 transition flex items-center gap-1">
                              <ArrowDownToLine size={12} className="sm:w-3.5 sm:h-3.5" /> Rút
                            </button>
                          }
                          <button onClick={(e) => { e.stopPropagation(); requestDeleteTag(tag.id, tag.name); }} className="text-[10px] sm:text-[11px] uppercase bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg font-bold border border-red-500/20 transition flex items-center gap-1">
                            <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" /> Xóa
                          </button>
                        </div>
                        <div className="flex flex-col bg-zinc-800/50 rounded-md sm:rounded-lg overflow-hidden border border-zinc-700">
                          <button onClick={(e) => { e.stopPropagation(); handleMoveTag(tag.id, 'up'); }} disabled={idx === 0} className={`p-1 flex items-center justify-center transition-colors ${idx === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}><ChevronUp size={14} className="sm:w-4 sm:h-4" /></button>
                          <div className="h-[1px] w-full bg-zinc-700"></div>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveTag(tag.id, 'down'); }} disabled={idx === investmentTags.length - 1} className={`p-1 flex items-center justify-center transition-colors ${idx === investmentTags.length - 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}><ChevronDown size={14} className="sm:w-4 sm:h-4" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="bg-black/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-zinc-800">
                          <span className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase">Vốn đầu tư</span>
                          <span className="text-xs sm:text-sm font-black text-zinc-300 block mt-0.5 sm:mt-1 truncate">{isHidden ? '******' : formatMoney(ast.totalInvested)}</span>
                        </div>
                        <div className="bg-black/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-zinc-800">
                          <span className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase">Giá trị hiện tại</span>
                          <span className="text-xs sm:text-sm font-black text-white block mt-0.5 sm:mt-1 truncate">{isHidden ? '******' : formatMoney(currentVal)}</span>
                        </div>
                        <div className="col-span-2 bg-zinc-900/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-700/50 flex justify-between items-center mt-0.5 sm:mt-1">
                          <span className="text-[11px] sm:text-[12px] font-black text-zinc-400 uppercase">Lãi / Lỗ</span>
                          <span className={`font-black text-base sm:text-lg ${ast.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{isHidden ? '******' : `${ast.pnl >= 0 ? '+' : ''}${formatMoney(ast.pnl)}`}</span>
                        </div>
                      </div>
                      {isGold && ast.quantity && (
                        <div className="mt-2.5 sm:mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 flex justify-between items-center">
                          <span className="text-[11px] sm:text-[12px] text-zinc-400 font-medium">Kho Vàng đang trữ:</span>
                          <span className="text-xs sm:text-sm font-black text-yellow-400">{ast.quantity} {ast.unit}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};