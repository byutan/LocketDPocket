import { X, FileEdit, Send, Check, Camera, Image as ImageIcon } from 'lucide-react';

export const CameraView = ({
  isDrafting,
  setIsDrafting,
  draftType,
  setDraftType,
  draftTags,
  setDraftTags,
  draftImage,
  setDraftImage,
  draftAmount,
  setDraftAmount,
  draftCaption,
  setDraftCaption,
  accounts,
  draftAccount,
  setDraftAccount,
  currentBalances,
  formatMoney,
  tags,
  setIsTagModalOpen,
  submitTransaction,
  // isCameraActive,
  // setIsCameraActive,
  cameraError,
  videoRef,
  canvasRef,
  // capturePhoto,
  handleGalleryUpload,
  fileInputRef,
  handleManualEntry
}) => {
  // 1. DRAFTING FORM (FORM ĐIỀN THÔNG TIN CHI PHÍ)
  if (isDrafting) {
    return (
      <div className="flex flex-col h-full bg-black text-white absolute inset-0 z-50 animate-in fade-in slide-in-from-bottom-4">
        <div className="p-3 sm:p-4 flex justify-between items-center bg-zinc-950 border-b border-zinc-900">
          <button onClick={() => setIsDrafting(false)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
          <div className="flex bg-zinc-900 rounded-full p-1 gap-1 border border-zinc-800">
            <button onClick={() => { setDraftType('expense'); setDraftTags([]); }} className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-xs font-bold transition-all ${draftType === 'expense' ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Chi</button>
            <button onClick={() => { setDraftType('income'); setDraftTags([]); }} className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-xs font-bold transition-all ${draftType === 'income' ? 'bg-green-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Thu</button>
            <button onClick={() => { setDraftType('investment'); setDraftTags([]); }} className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-xs font-bold transition-all ${draftType === 'investment' ? 'bg-purple-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Đầu tư</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 pb-32 space-y-4 sm:space-y-6">
          <div className="aspect-4/3 bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl border border-zinc-800 flex justify-center items-center relative">
            {draftImage ? (
              <img src={draftImage} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center opacity-40">
                <FileEdit size={48} className="text-zinc-500 mb-3" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Không đính kèm ảnh</span>
              </div>
            )}
          </div>
          <div className="bg-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-zinc-800 border-l-4 border-l-yellow-400">
            <label className="text-[10px] uppercase font-black text-zinc-500 mb-1 block">Số tiền (VND)</label>
            <input type="number" placeholder="0" value={draftAmount} onChange={e => setDraftAmount(e.target.value)} className="w-full bg-transparent text-4xl sm:text-5xl font-black outline-none text-white tracking-tight" autoFocus />
          </div>
          <input type="text" placeholder="Ghi chú..." value={draftCaption} onChange={e => setDraftCaption(e.target.value)} className="w-full bg-zinc-900 text-white rounded-xl sm:rounded-2xl px-4 py-3.5 sm:py-4 outline-none border border-zinc-800 text-[16px]" />

          <div className="space-y-2.5 sm:space-y-3">
            <label className="text-[12px] sm:text-xs font-bold text-zinc-500 uppercase px-1">Tài khoản</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {accounts.map(acc => (
                <button key={acc.id} onClick={() => setDraftAccount(acc.id)} className={`whitespace-nowrap flex flex-col items-start px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[12px] sm:text-sm transition-all border shadow-sm ${draftAccount === acc.id ? `${acc.color} border-transparent text-white` : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                  {acc.name} <span className="text-[10px] opacity-80 mt-0.5">{formatMoney(currentBalances[acc.id])}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[12px] sm:text-xs font-bold text-zinc-500 uppercase">Tags</label>
              <button onClick={() => setIsTagModalOpen(true)} className="text-[10px] sm:text-xs bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded font-bold">Quản lý</button>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {tags.filter(t => t.type === draftType).map(tag => (
                <button key={tag.id} onClick={() => setDraftTags(draftTags.includes(tag.id) ? draftTags.filter(id => id !== tag.id) : [...draftTags, tag.id])} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[12px] sm:text-xs font-bold border transition-all ${draftTags.includes(tag.id) ? `${tag.color} border-transparent text-white` : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{tag.name}</button>
              ))}
            </div>
          </div>
          <button onClick={submitTransaction} className="w-full py-4 sm:py-5 bg-yellow-400 text-black rounded-2xl sm:rounded-4xl font-black text-[16px] sm:text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform hover:bg-yellow-500"><Send size={18} /> Lưu</button>
        </div>
      </div>
    );
  }

  // 2. IMAGE PREVIEW (FULLSCREEN KHI VỪA CHỌN HOẶC CHỤP ẢNH XONG)
  // 2. IMAGE PREVIEW (NÚT BẤM NẰM NGOÀI BỨC ẢNH)
  if (draftImage && !isDrafting) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0C] flex flex-col items-center justify-center px-5 pb-24 z-20 animate-in fade-in">
        
        {/* 1. KHUNG ẢNH (Chỉ chứa ảnh, không chứa gradient và nút nữa) */}
        <div className="relative w-full max-w-sm aspect-square bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-800">
          <img src={draftImage} className="w-full h-full object-cover absolute inset-0" alt="Preview" />
        </div>

        {/* 2. CỤM NÚT BẤM BÊN NGOÀI (Thay thế cho khối tàng hình lúc nãy) */}
        {/* mt-8 giúp khoảng cách từ ảnh đến nút y hệt như màn hình Camera */}
        <div className="flex items-center justify-center gap-16 mt-8 w-full max-w-sm z-10">
          
          {/* Nút Hủy (Nằm ngoài ảnh nên bỏ backdrop-blur đi cho sạch) */}
          <button
            onClick={() => setDraftImage(null)}
            className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-300 hover:bg-zinc-700 active:scale-90 transition-all shadow-xl"
          >
            <X size={28} />
          </button>

          {/* Nút Xác nhận */}
          <button
            onClick={() => setIsDrafting(true)}
            className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-black active:scale-90 transition-transform shadow-[0_0_30px_rgba(250,204,21,0.3)]"
          >
            <Check size={36} />
          </button>

        </div>
      </div>
    );
  }

  // 3. MÀN HÌNH CHÍNH 
  return (
    <div className="absolute inset-0 bg-[#0A0A0C] flex flex-col items-center justify-center px-5 pb-24 z-0">

      {/* 1. KHUNG CAMERA: Bo góc, tỷ lệ 3:4 */}
      <div className="relative w-full max-w-sm aspect-square bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-800 flex flex-col">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50 z-10">
            <ImageIcon size={48} className="text-zinc-500" />
            <span className="text-zinc-500 font-bold text-sm">Lỗi Camera. Tải ảnh từ thư viện.</span>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover z-0" />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* 2. CỤM NÚT ĐIỀU KHIỂN: Nằm ngoài và phía dưới khung camera (mt-8 tạo khoảng cách) */}
      <div className="flex items-center justify-center gap-8 mt-8 w-full max-w-sm z-10">

        {/* Nút Thư viện */}
        <div className="relative flex items-center justify-center w-14 h-14 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-full active:scale-90 transition-transform shadow-lg cursor-pointer hover:bg-zinc-800">
          <input
            type="file"
            accept="image/*"
            onChange={handleGalleryUpload}
            ref={fileInputRef}
            className="absolute inset-0 opacity-0 z-10 cursor-pointer"
          />
          <ImageIcon size={22} className="text-zinc-300 drop-shadow-md" />
        </div>

        {/* Nút Nhập Tay */}
        <button onClick={handleManualEntry} className="relative flex items-center justify-center w-14 h-14 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-full active:scale-90 transition-transform shadow-lg cursor-pointer hover:bg-zinc-800">
          <FileEdit size={22} className="text-zinc-300 drop-shadow-md" />
        </button>

      </div>

    </div>
  );
};