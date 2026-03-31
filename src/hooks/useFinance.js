import { useState, useRef, useEffect, useMemo } from 'react';

export const useFinanceApp = () => {
  // ==========================================
  // 1. KHAI BÁO TOÀN BỘ STATE
  // ==========================================
  
  // --- Điều hướng & Ngày tháng ---
  const [activeTab, setActiveTab] = useState('camera');
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- Báo cáo (Stats Filter) ---
  const [statsMode, setStatsMode] = useState('month');
  const [statsRefDate, setStatsRefDate] = useState(new Date());
  const [statsCustomRange, setStatsCustomRange] = useState({ start: '', end: '' });

  // --- UI Tùy chỉnh (Mở rộng, Ẩn số dư) ---
  const [expandedTags, setExpandedTags] = useState({});
  const [hiddenBalances, setHiddenBalances] = useState({});
  const [isTotalHidden, setIsTotalHidden] = useState(false);
  const [selectedTxnDetail, setSelectedTxnDetail] = useState(null);

  // --- Core Data (Tài khoản, Tag, Giao dịch...) ---
  const [accounts, setAccounts] = useState([
    { id: 'acc1', name: 'Tiền mặt', color: 'bg-emerald-500', initialBalance: 50000, fallbackId: 'acc2' },
    { id: 'acc2', name: 'Ví Momo', color: 'bg-pink-500', initialBalance: 150000, fallbackId: 'acc3' },
    { id: 'acc3', name: 'Vietcombank', color: 'bg-blue-500', initialBalance: 5000000, fallbackId: '' }
  ]);
  const [tags, setTags] = useState([
    { id: '1', name: 'Ăn uống', type: 'expense', color: 'bg-orange-500' },
    { id: '2', name: 'Di chuyển', type: 'expense', color: 'bg-blue-400' },
    { id: '3', name: 'Cafe / Hẹn hò', type: 'expense', color: 'bg-pink-400' },
    { id: '4', name: 'Lương', type: 'income', color: 'bg-green-500' },
    { id: '5', name: 'Chứng khoán VN', type: 'investment', color: 'bg-purple-500' },
    { id: '6', name: 'Vàng SJC', type: 'investment', color: 'bg-yellow-500' },
  ]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({
    '1': { unitValue: 50000, totalFrequency: 60, totalValue: 3000000 },
    '3': { unitValue: 65000, totalFrequency: 10, totalValue: 650000 }
  });
  const [assets, setAssets] = useState({
    '5': { totalInvested: 15000000, pnl: 500000 },
    '6': { totalInvested: 16800000, pnl: 200000, quantity: 2, unit: 'chỉ', customGoldPrice: 8500000 }
  });

  // --- Form Giao Dịch & Camera ---
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftImage, setDraftImage] = useState(null);
  const [draftType, setDraftType] = useState('expense');
  const [draftAmount, setDraftAmount] = useState('');
  const [draftCaption, setDraftCaption] = useState('');
  const [draftTags, setDraftTags] = useState([]);
  const [draftAccount, setDraftAccount] = useState('acc1');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [stream, setStream] = useState(null);

  // --- Thông báo & Popup ---
  // ĐÂY LÀ DÒNG BẠN BỊ THIẾU GÂY RA LỖI:
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', action: null });
  const [liveGoldPrice, setLiveGoldPrice] = useState(8500000);
  const [isFetchingGold, setIsFetchingGold] = useState(false);

  // --- Modals (Popups) ---
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountFormVisible, setIsAccountFormVisible] = useState(false);
  const [accountForm, setAccountForm] = useState({ id: null, name: '', initialBalance: '', fallbackId: '' });
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetForm, setAssetForm] = useState({ tagId: null, totalInvested: 0, isGold: false, currentValue: '', quantity: '', unit: 'chỉ', customGoldPrice: 8500000 });
  const [selectedAssetData, setSelectedAssetData] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [isNewInvestmentModalOpen, setIsNewInvestmentModalOpen] = useState(false);

  // --- Refs ---
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ==========================================
  // 2. LOGIC VÀ CÁC HÀM XỬ LÝ
  // ==========================================

  const formatMoney = (amount) => amount.toLocaleString('vi-VN');

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
  };

  const toggleExpand = (tagId) => setExpandedTags(prev => ({ ...prev, [tagId]: !prev[tagId] }));
  
  const toggleHideBalance = (id, e) => {
    if (e) e.stopPropagation();
    setHiddenBalances(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const currentBalances = useMemo(() => {
    let bals = {};
    accounts.forEach(a => bals[a.id] = a.initialBalance || 0);
    transactions.forEach(t => {
      if (t.type === 'income' || t.type === 'withdraw') bals[t.accountId] += t.amount;
      else if (t.type === 'expense' || t.type === 'investment') bals[t.accountId] -= t.amount;
      else if (t.type === 'transfer') {
        if (bals[t.fromAccountId] !== undefined) bals[t.fromAccountId] -= t.amount;
        if (bals[t.toAccountId] !== undefined) bals[t.toAccountId] += t.amount;
      }
    });
    return bals;
  }, [transactions, accounts]);

  const fetchLiveGoldPrice = async (isManual = false) => {
    setIsFetchingGold(true);
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://sjc.com.vn/xml/tygiavang.xml')}`);
      const json = await res.json();
      const parser = new DOMParser();
      const xml = parser.parseFromString(json.contents, "application/xml");
      const items = xml.getElementsByTagName('item');
      let sellPrice = 0;
      for (let i = 0; i < items.length; i++) {
        if (items[i].getAttribute('type').includes('SJC 1L')) { sellPrice = parseFloat(items[i].getAttribute('sell')); break; }
      }
      if (sellPrice > 0) {
        if (sellPrice < 1000000) sellPrice *= 1000;
        const pricePerChi = sellPrice / 10;
        setLiveGoldPrice(pricePerChi);
        setAssetForm(prev => ({ ...prev, customGoldPrice: pricePerChi }));
        if (isManual) showToastMsg("Đã cập nhật giá Vàng SJC online!", "success");
      } else { throw new Error("API Lỗi"); }
    } catch {
      if (isManual) showToastMsg("Không tải được giá online.", "error");
    } finally { setIsFetchingGold(false); }
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDraftImage(URL.createObjectURL(file));
      setIsCameraActive(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualEntry = () => {
    setDraftImage(null);
    setIsCameraActive(false);
    setIsDrafting(true);
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("No API");
      const constraints = { video: { facingMode: 'environment' }, audio: false };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(e => console.log("Lỗi autoplay", e));
      }
      setCameraError(false);
    } catch { setCameraError(true); showToastMsg("Không thể truy cập Camera", "error"); }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (cameraError) return showToastMsg("Lỗi Camera, vui lòng tải ảnh lên!", "error");
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      setDraftImage(canvasRef.current.toDataURL('image/png'));
      setIsCameraActive(false);
      stopCamera();
    }
  };

  useEffect(() => {
    if (activeTab === 'camera' && !isDrafting && !draftImage) 
      startCamera();
    else stopCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isDrafting, draftImage]);

  useEffect(() => {
    if (activeTab !== 'camera') setIsCameraActive(false);
  }, [activeTab]);

  const submitTransaction = () => {
    if (!draftAmount || parseFloat(draftAmount) <= 0) return showToastMsg("Nhập số tiền hợp lệ", "error");
    if ((draftType === 'investment' || draftType === 'expense') && draftTags.length === 0) return showToastMsg("Vui lòng chọn Tag phân loại", "error");

    const amount = parseFloat(draftAmount);
    let topupMessage = ''; let topupLogs = []; const now = new Date();

    if (draftType === 'expense' || draftType === 'investment') {
      const currentBal = currentBalances[draftAccount];
      let newTxns = [];

      if (currentBal < amount) {
        const shortfall = amount - currentBal;
        let tempBals = { ...currentBalances };
        let resolvedTransfers = [];

        const resolveShortfall = (targetAccId, neededAmount, visitedPaths) => {
          if (neededAmount <= 0) return true;
          if (visitedPaths.includes(targetAccId)) return false;
          const acc = accounts.find(a => a.id === targetAccId);
          if (!acc || !acc.fallbackId) return false;
          const fallbackId = acc.fallbackId;
          let availableInFallback = tempBals[fallbackId] || 0;

          let takenDirectly = Math.min(availableInFallback, neededAmount);
          if (takenDirectly > 0) {
            resolvedTransfers.push({ from: fallbackId, to: targetAccId, amount: takenDirectly });
            tempBals[fallbackId] -= takenDirectly;
            tempBals[targetAccId] += takenDirectly;
            neededAmount -= takenDirectly;
          }

          if (neededAmount > 0) {
            if (resolveShortfall(fallbackId, neededAmount, [...visitedPaths, targetAccId])) {
              resolvedTransfers.push({ from: fallbackId, to: targetAccId, amount: neededAmount });
              tempBals[fallbackId] -= neededAmount;
              tempBals[targetAccId] += neededAmount;
              return true;
            }
            return false;
          }
          return true;
        };

        if (!resolveShortfall(draftAccount, shortfall, [])) return showToastMsg("Ví dự phòng cũng không đủ tiền.", "error");

        const mergedTransfersMap = {};
        resolvedTransfers.forEach(t => {
          const key = `${t.from}_${t.to}`;
          if (!mergedTransfersMap[key]) mergedTransfersMap[key] = { ...t };
          else mergedTransfersMap[key].amount += t.amount;
        });

        const finalTransfers = Object.values(mergedTransfersMap).map((t, idx) => ({
          id: `tf_${Date.now()}_${idx}`, type: 'transfer', fromAccountId: t.from, toAccountId: t.to,
          amount: t.amount, timestamp: new Date(now.getTime() - (100 - idx)), caption: 'Tự động bù tiền (Waterfall)'
        }));

        newTxns = [...finalTransfers];
        topupLogs = finalTransfers.map(t => ({ fromName: accounts.find(a => a.id === t.fromAccountId)?.name || 'Unknown', amount: t.amount }));
        const totalTopup = finalTransfers.filter(t => t.toAccountId === draftAccount).reduce((s, t) => s + t.amount, 0);
        topupMessage = ` (Đã bù ${formatMoney(totalTopup)})`;
      }

      newTxns.push({
        id: Date.now().toString(), type: draftType, amount: amount, imageUrl: draftImage, caption: draftCaption,
        tagIds: draftTags, accountId: draftAccount, timestamp: now, topupLogs: topupLogs
      });

      setTransactions([...newTxns, ...transactions]);

      if (draftType === 'investment') {
        const amountPerTag = amount / draftTags.length;
        let updatedAssets = { ...assets };
        draftTags.forEach(tagId => {
          const currentInvested = updatedAssets[tagId]?.totalInvested || 0;
          updatedAssets[tagId] = { ...updatedAssets[tagId], totalInvested: currentInvested + amountPerTag, pnl: updatedAssets[tagId]?.pnl || 0 };
        });
        setAssets(updatedAssets);
      }
    } else {
      setTransactions([{ id: Date.now().toString(), type: draftType, amount: amount, imageUrl: draftImage, caption: draftCaption, tagIds: draftTags, accountId: draftAccount, timestamp: now }, ...transactions]);
    }

    setIsDrafting(false); setDraftImage(null); setDraftAmount(''); setDraftCaption(''); setDraftTags([]);
    setActiveTab('calendar'); setSelectedDate(now);
    showToastMsg(`Thành công!${topupMessage}`);
  };

  const handleManualTransfer = (formData) => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0 || !formData.fromId || !formData.toId) return showToastMsg("Dữ liệu không hợp lệ", "error");
    if (currentBalances[formData.fromId] < amount) return showToastMsg("Số dư không đủ", "error");
    
    const now = new Date();
    setTransactions([{ id: `mtf_${Date.now()}`, type: 'transfer', fromAccountId: formData.fromId, toAccountId: formData.toId, amount: amount, timestamp: now, caption: `Chuyển nội bộ`, isManualTransfer: true }, ...transactions]);
    setSelectedDate(now); setActiveTab('calendar'); showToastMsg("Đã chuyển tiền");
  };

  const executeDeleteTransaction = (txnId) => {
    const txn = transactions.find(t => t.id === txnId);
    if (txn?.type === 'investment') {
      let updatedAssets = { ...assets };
      const amountPerTag = txn.amount / txn.tagIds.length;
      txn.tagIds.forEach(tagId => {
        if (updatedAssets[tagId]) updatedAssets[tagId].totalInvested = Math.max(0, updatedAssets[tagId].totalInvested - amountPerTag);
      });
      setAssets(updatedAssets);
    }
    setTransactions(prev => prev.filter(t => t.id !== txnId));
    setSelectedTxnDetail(null); setConfirmDialog({ isOpen: false }); showToastMsg("Đã xóa giao dịch");
  };

  const requestDeleteTag = (tagId, tagName) => {
    setConfirmDialog({
      isOpen: true, title: "Xóa danh mục?",
      message: `Xóa danh mục "${tagName}"? Các cài đặt và giao dịch thuộc danh mục này sẽ mất phân loại.`,
      action: () => {
        setTags(tags.filter(t => t.id !== tagId));
        const newBudgets = { ...budgets }; delete newBudgets[tagId]; setBudgets(newBudgets);
        const newAssets = { ...assets }; delete newAssets[tagId]; setAssets(newAssets);
        setTransactions(transactions.map(t => (t.tagIds && t.tagIds.includes(tagId)) ? { ...t, tagIds: t.tagIds.filter(id => id !== tagId) } : t));
        setConfirmDialog({ isOpen: false, title: '', message: '', action: null });
        showToastMsg("Đã xóa danh mục!");
      }
    });
  };

  const handleAddTag = (name, type) => {
    if (!name.trim()) {
      showToastMsg("Nhập tên", "error");
      return false; 
    }
    const color = type === 'expense' ? 'bg-red-500' : type === 'income' ? 'bg-green-500' : 'bg-purple-500';
    setTags([...tags, { id: Date.now().toString(), name: name, type: type, color }]);
    showToastMsg("Đã thêm", "success");
    return true; 
  };

  const swapTags = (id1, id2) => {
    setTags(prevTags => {
      const newTags = [...prevTags];
      const idx1 = newTags.findIndex(t => t.id === id1);
      const idx2 = newTags.findIndex(t => t.id === id2);
      const temp = newTags[idx1];
      newTags[idx1] = newTags[idx2];
      newTags[idx2] = temp;
      return newTags;
    });
  };

  const handleMoveTag = (tagId, direction) => {
    const currentTag = tags.find(t => t.id === tagId);
    if (!currentTag) return;
    const sameTypeTags = tags.filter(t => t.type === currentTag.type);
    const currentIndex = sameTypeTags.findIndex(t => t.id === tagId);
    if (direction === 'up' && currentIndex > 0) swapTags(tagId, sameTypeTags[currentIndex - 1].id);
    else if (direction === 'down' && currentIndex < sameTypeTags.length - 1) swapTags(tagId, sameTypeTags[currentIndex + 1].id);
  };

  const openAssetModal = (tag, ast, isGold) => {
    if (isGold) fetchLiveGoldPrice();
    setSelectedAssetData({ tagId: tag.id, totalInvested: ast?.totalInvested || 0, isGold: isGold, currentValue: (ast?.totalInvested || 0) + (ast?.pnl || 0), quantity: ast?.quantity || '', unit: ast?.unit || 'chỉ', customGoldPrice: ast?.customGoldPrice || liveGoldPrice });
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = () => {
    if (!assetForm.tagId) return;
    let finalPnl = 0; let extraData = {};
    if (assetForm.isGold) {
      const qty = parseFloat(assetForm.quantity) || 0;
      const multiplier = assetForm.unit === 'cây' ? 10 : 1;
      const pricePerChi = parseFloat(assetForm.customGoldPrice) || 0;
      const currentVal = qty * multiplier * pricePerChi;
      finalPnl = currentVal - assetForm.totalInvested;
      extraData = { quantity: qty, unit: assetForm.unit, customGoldPrice: pricePerChi };
      if (pricePerChi !== liveGoldPrice) setLiveGoldPrice(pricePerChi);
    } else {
      finalPnl = (parseFloat(assetForm.currentValue) || 0) - assetForm.totalInvested;
    }
    setAssets({ ...assets, [assetForm.tagId]: { ...assets[assetForm.tagId], pnl: finalPnl, ...extraData } });
    setIsAssetModalOpen(false); showToastMsg("Đã cập nhật Trạng thái");
  };

  const handleWithdrawInvestment = (formData) => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) return showToastMsg("Số tiền không hợp lệ", "error");
    const ast = assets[formData.tagId] || { totalInvested: 0, pnl: 0 };
    const currentVal = ast.totalInvested + ast.pnl;
    if (amount > currentVal) return showToastMsg(`Vượt mức ${formatMoney(currentVal)}`, "error");

    const ratio = amount / currentVal;
    setAssets({ ...assets, [formData.tagId]: { ...ast, totalInvested: Math.max(0, ast.totalInvested - (ast.totalInvested * ratio)), pnl: ast.pnl - (ast.pnl * ratio) } });
    const now = new Date();
    setTransactions([{ id: Date.now().toString(), type: 'withdraw', amount: amount, imageUrl: null, caption: `Thu hồi vốn`, tagIds: [formData.tagId], accountId: formData.accountId, timestamp: now }, ...transactions]);
    setSelectedDate(now); setActiveTab('calendar'); showToastMsg(`Đã thu hồi ${formatMoney(amount)}`);
  };

  const saveAccount = () => {
    if (!accountForm.name.trim() || accountForm.initialBalance === '') return showToastMsg("Nhập đủ Tên và Số dư", "error");
    const iniBal = parseFloat(accountForm.initialBalance);
    if (iniBal < 0) return showToastMsg("Số dư >= 0", "error");
    if (accountForm.fallbackId === accountForm.id) return showToastMsg("Lỗi dự phòng chéo", "error");

    if (accountForm.id) {
      setAccounts(accounts.map(a => a.id === accountForm.id ? { ...a, name: accountForm.name, initialBalance: iniBal, fallbackId: accountForm.fallbackId } : a));
    } else {
      const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500'];
      setAccounts([...accounts, { id: `acc_${Date.now()}`, name: accountForm.name, initialBalance: iniBal, fallbackId: accountForm.fallbackId, color: colors[Math.floor(Math.random() * colors.length)] }]);
    }
    setAccountForm({ id: null, name: '', initialBalance: '', fallbackId: '' });
    setIsAccountFormVisible(false); showToastMsg("Đã lưu Nguồn tiền");
  };

  const deleteAccount = (id) => {
    if (transactions.some(t => t.accountId === id || t.fromAccountId === id || t.toAccountId === id)) {
      setConfirmDialog({
        isOpen: true, title: "Cảnh báo", message: "Ví có giao dịch. Xoá sẽ lỗi lịch sử. Vẫn xóa?",
        action: () => {
          setAccounts(accounts.filter(a => a.id !== id));
          setAccounts(prev => prev.map(a => a.fallbackId === id ? { ...a, fallbackId: '' } : a));
          setConfirmDialog({ isOpen: false }); showToastMsg("Đã xoá");
        }
      }); return;
    }
    setAccounts(accounts.filter(a => a.id !== id)); showToastMsg("Đã xoá");
  };

  const handleEditBudget = (formData) => {
    if (!formData.tagId) return showToastMsg("Lỗi form", "error");
    let finalTotal = parseFloat(formData.totalValue);
    const unit = parseFloat(formData.unitValue);
    const freq = parseInt(formData.totalFrequency);

    if (!finalTotal && unit > 0 && freq > 0) finalTotal = unit * freq;
    if (!finalTotal || finalTotal <= 0) return showToastMsg("Nhập Tổng Ngân Sách", "error");

    setBudgets({ ...budgets, [formData.tagId]: { totalValue: finalTotal, unitValue: isNaN(unit) ? 0 : unit, totalFrequency: isNaN(freq) ? 0 : freq } });
    showToastMsg("Đã lưu chi tiết");
  };

  const handleSaveNewBudget = (formData) => {
    if (!formData.name.trim()) return showToastMsg("Nhập tên danh mục", "error");
    let finalTotal = parseFloat(formData.totalValue);
    const unit = parseFloat(formData.unitValue);
    const freq = parseInt(formData.totalFrequency);

    if (!finalTotal && unit > 0 && freq > 0) finalTotal = unit * freq;
    if (!finalTotal || finalTotal <= 0) return showToastMsg("Nhập Tổng Ngân Sách", "error");

    const newId = Date.now().toString();
    const colors = ['bg-orange-500', 'bg-blue-400', 'bg-pink-400', 'bg-red-500', 'bg-cyan-500'];
    setTags([...tags, { id: newId, name: formData.name, type: 'expense', color: colors[Math.floor(Math.random() * colors.length)] }]);
    setBudgets({ ...budgets, [newId]: { totalValue: finalTotal, unitValue: isNaN(unit) ? 0 : unit, totalFrequency: isNaN(freq) ? 0 : freq } });
    setIsNewBudgetModalOpen(false); showToastMsg("Đã tạo Ngân sách mới!");
  };

  const handleSaveNewInvestment = (name) => {
    if (!name.trim()) return showToastMsg("Nhập tên danh mục", "error");
    const newId = Date.now().toString();
    const colors = ['bg-purple-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-teal-500', 'bg-rose-500'];
    setTags([...tags, { id: newId, name: name, type: 'investment', color: colors[Math.floor(Math.random() * colors.length)] }]);
    setIsNewInvestmentModalOpen(false); showToastMsg("Đã thêm danh mục Đầu tư!");
  };

  // ==========================================
  // 3. XUẤT (EXPORT) TOÀN BỘ DATA CHO APP
  // ==========================================
  return {
    // States
    activeTab, setActiveTab, viewMonth, setViewMonth, selectedDate, setSelectedDate,
    statsMode, setStatsMode, statsRefDate, setStatsRefDate, statsCustomRange, setStatsCustomRange,
    expandedTags, setExpandedTags, hiddenBalances, setHiddenBalances, isTotalHidden, setIsTotalHidden,
    selectedTxnDetail, setSelectedTxnDetail, accounts, setAccounts, tags, setTags,
    transactions, setTransactions, budgets, setBudgets, assets, setAssets,
    isDrafting, setIsDrafting, draftImage, setDraftImage, draftType, setDraftType,
    draftAmount, setDraftAmount, draftCaption, setDraftCaption, draftTags, setDraftTags,
    draftAccount, setDraftAccount, isCameraActive, setIsCameraActive, cameraError, setCameraError,
    stream, setStream, toast, setToast, confirmDialog, setConfirmDialog, liveGoldPrice, setLiveGoldPrice,
    isFetchingGold, setIsFetchingGold, isTransferModalOpen, setIsTransferModalOpen,
    isAccountFormVisible, setIsAccountFormVisible, accountForm, setAccountForm,
    isAssetModalOpen, setIsAssetModalOpen, assetForm, setAssetForm, selectedAssetData, setSelectedAssetData,
    isWithdrawModalOpen, setIsWithdrawModalOpen, isTagModalOpen, setIsTagModalOpen,
    isBudgetModalOpen, setIsBudgetModalOpen, isNewBudgetModalOpen, setIsNewBudgetModalOpen,
    isNewInvestmentModalOpen, setIsNewInvestmentModalOpen,

    // Refs
    fileInputRef, videoRef, canvasRef,

    // Computed
    currentBalances,

    // Functions
    formatMoney, showToastMsg, toggleExpand, toggleHideBalance, fetchLiveGoldPrice,
    handleGalleryUpload, handleManualEntry, startCamera, stopCamera, capturePhoto,
    submitTransaction, handleManualTransfer, executeDeleteTransaction, requestDeleteTag,
    handleAddTag, handleMoveTag, swapTags, openAssetModal, handleSaveAsset, handleWithdrawInvestment,
    saveAccount, deleteAccount, handleEditBudget, handleSaveNewBudget, handleSaveNewInvestment
  };
};