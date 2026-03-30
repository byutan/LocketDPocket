
import { X, Wallet, Clock, Tag as TagIcon, CreditCard, AlignLeft, Zap, Trash2 } from 'lucide-react';

export const TransactionDetailModal = ({
  selectedTxnDetail,
  setSelectedTxnDetail,
  accounts,
  tags,
  formatMoney,
  setConfirmDialog,
  executeDeleteTransaction
}) => {
  if (!selectedTxnDetail) return null;
  const txn = selectedTxnDetail;
  const accName = accounts.find(a => a.id === txn.accountId)?.name || 'Không rõ';
  const txnTags = tags.filter(t => (txn.tagIds || []).includes(t.id));

  return (
    <div className="absolute inset-0 z-[80] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 sm:p-6 flex justify-between items-center border-b border-zinc-800/50">
        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Chi tiết Giao dịch</h3>
        <button onClick={() => setSelectedTxnDetail(null)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-10 space-y-6">
        {/* IMAGE */}
        <div className="w-full aspect-square max-h-[40vh] bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center relative">
          {txn.imageUrl ? <img src={txn.imageUrl} className="w-full h-full object-cover" /> : <Wallet size={64} className="text-zinc-700 opacity-30" />}
          {txn.type === 'transfer' && <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-lg border border-blue-400/50">Chuyển Tiền</div>}
        </div>

        {/* AMOUNT & TIME */}
        <div className="text-center space-y-1">
          <div className={`text-4xl sm:text-5xl font-black tracking-tight ${txn.type === 'income' ? 'text-green-400' : txn.type === 'transfer' ? 'text-blue-400' : 'text-red-500'}`}>
            {txn.type === 'income' ? '+' : txn.type === 'transfer' ? '' : '-'}{formatMoney(txn.amount)}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-zinc-500 font-bold text-[12px] sm:text-sm">
            <Clock size={14} /> {txn.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {txn.timestamp.toLocaleDateString('vi-VN')}
          </div>
        </div>

        {/* INFO CARD */}
        <div className="bg-[#1C1C1E] rounded-[2rem] p-5 sm:p-6 border border-zinc-800 shadow-xl space-y-4">
          {/* TAGS */}
          {txnTags.length > 0 && (
            <div className="flex items-start gap-3">
              <TagIcon size={16} className="text-zinc-500 mt-1 shrink-0" />
              <div className="flex flex-wrap gap-2">
                {txnTags.map(t => <span key={t.id} className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black text-white uppercase tracking-wider ${t.color}`}>{t.name}</span>)}
              </div>
            </div>
          )}

          {/* ACCOUNT INFO */}
          <div className="flex items-center gap-3">
            <CreditCard size={16} className="text-zinc-500 shrink-0" />
            {txn.type === 'transfer' ? (
              <div className="text-sm font-bold text-zinc-300">
                Từ <span className="text-white">{accounts.find(a => a.id === txn.fromAccountId)?.name}</span> đến <span className="text-white">{accounts.find(a => a.id === txn.toAccountId)?.name}</span>
              </div>
            ) : (
              <div className="text-sm font-bold text-zinc-300">Tài khoản: <span className="text-white">{accName}</span></div>
            )}
          </div>

          {/* CAPTION */}
          {txn.caption && (
            <div className="flex items-start gap-3">
              <AlignLeft size={16} className="text-zinc-500 mt-0.5 shrink-0" />
              <div className="text-sm font-medium text-zinc-300 italic">"{txn.caption}"</div>
            </div>
          )}

          {/* TOPUP LOGS */}
          {txn.topupLogs && txn.topupLogs.length > 0 && (
            <div className="pt-4 border-t border-zinc-800/50 space-y-2.5">
              <div className="text-[10px] font-black text-yellow-500 uppercase flex items-center gap-1"><Zap size={12} /> Chi tiết tự động bù tiền</div>
              {txn.topupLogs.map((log, i) => (
                <div key={i} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-[12px] sm:text-sm text-zinc-300 font-bold">Rút từ <span className="text-white">{log.fromName}</span></span>
                  <span className="text-sm font-black text-yellow-400">{formatMoney(log.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTION BUTTON */}
        <button onClick={() => setConfirmDialog({ isOpen: true, title: "Xóa?", message: "Xóa giao dịch này và khôi phục số dư?", action: () => executeDeleteTransaction(txn.id) })} className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-red-500/20"><Trash2 size={18} /> Xóa Giao Dịch</button>
      </div>
    </div>
  );
};