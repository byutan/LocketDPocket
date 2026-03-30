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
  isCameraActive,
  setIsCameraActive,
  cameraError,
  videoRef,
  canvasRef,
  capturePhoto,
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
          <div className="aspect-[4/3] bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl border border-zinc-800 flex justify-center items-center relative">
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
          <button onClick={submitTransaction} className="w-full py-4 sm:py-5 bg-yellow-400 text-black rounded-2xl sm:rounded-[2rem] font-black text-[16px] sm:text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform hover:bg-yellow-500"><Send size={18} /> Lưu</button>
        </div>
      </div>
    );
  }

  // 2. IMAGE PREVIEW (FULLSCREEN KHI VỪA CHỌN HOẶC CHỤP ẢNH XONG)
  if (draftImage && !isDrafting) {
    return (
      <div className="absolute inset-0 bg-black z-40 animate-in fade-in">
        <img src={draftImage} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 h-48 flex items-end justify-center gap-16 pb-12 bg-gradient-to-t from-black via-black/60 to-transparent">
          <button onClick={() => setDraftImage(null)} className="w-16 h-16 bg-zinc-800/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl"><X size={28} /></button>
          <button onClick={() => setIsDrafting(true)} className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-black active:scale-90 transition-transform shadow-[0_0_40px_rgba(250,204,21,0.4)]"><Check size={36} /></button>
        </div>
      </div>
    );
  }

  // 3. LIVE CAMERA KHI ĐƯỢC KÍCH HOẠT (SAU KHI BẤM LOGO)
  if (isCameraActive) {
    return (
      <div className="absolute inset-0 bg-black z-40 animate-in fade-in">
        {cameraError ? (
          <div className="flex items-center justify-center h-full"><span className="text-zinc-500 font-bold text-sm">Lỗi truy cập Camera. Hãy tải ảnh từ thư viện.</span></div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {/* Nút chụp ảnh tròn trơn màu trắng */}
            <div className="absolute bottom-24 left-0 right-0 flex justify-center pb-8 bg-gradient-to-t from-black/80 to-transparent">
              <button onClick={capturePhoto} className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full border-4 border-white flex items-center justify-center p-1.5 active:scale-95 transition-transform">
                <div className="w-full h-full bg-white rounded-full"></div>
              </button>
            </div>
          </>
        )}
        <button onClick={() => setIsCameraActive(false)} className="absolute top-12 left-6 w-12 h-12 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-transform shadow-lg"><X size={24} /></button>
      </div>
    );
  }

  // 4. MÀN HÌNH CHÍNH (IDLE CAMERA TAB - TIẾT KIỆM PIN)
  return (
    <div className="absolute inset-0 bg-[#0A0A0C] z-0 flex flex-col items-center justify-center px-6">
      {/* Vòng sáng trang trí nền */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Cụm Logo Camera & Title */}
      <div className="relative z-10 flex flex-col items-center -mt-20">
        <button
          onClick={() => setIsCameraActive(true)}
          className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-[0_0_60px_rgba(234,179,8,0.35)] flex items-center justify-center mb-8 border-[4px] border-yellow-700/30 active:scale-95 transition-transform group"
        >
          <Camera size={56} className="text-black/90 drop-shadow-md group-hover:scale-105 transition-transform" strokeWidth={2} />
        </button>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Finance <span className="text-yellow-400">Locket</span></h1>
        <p className="text-zinc-500 font-medium text-sm text-center">Chạm để chụp hóa đơn</p>
      </div>

      {/* Cụm Nút Công cụ (Thư viện & Nhập tay) */}
      <div className="absolute bottom-[130px] z-20 flex justify-center w-full gap-5">
        {/* Nút Thư viện */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex items-center justify-center w-[56px] h-[56px] bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-full active:scale-90 transition-transform shadow-lg cursor-pointer hover:bg-zinc-800">
            <input
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              ref={fileInputRef}
              className="absolute inset-0 opacity-0 z-10 cursor-pointer"
            />
            <ImageIcon size={22} className="text-zinc-300 drop-shadow-md" />
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Thư viện</span>
        </div>

        {/* Nút Nhập tay */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleManualEntry}
            className="relative flex items-center justify-center w-[56px] h-[56px] bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-full active:scale-90 transition-transform shadow-lg cursor-pointer hover:bg-zinc-800"
          >
            <FileEdit size={22} className="text-zinc-300 drop-shadow-md" />
          </button>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nhập tay</span>
        </div>
      </div>
    </div>
  );
};