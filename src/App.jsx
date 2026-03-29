import { useState, useRef, useMemo, useEffect } from 'react'
import { 
  Camera, Send, X, Plus, Trash2, Target, CalendarDays,
  TrendingUp, Wallet, PieChart, ArrowRightLeft, 
  Edit2, AlertCircle, Zap, RefreshCw, ChevronLeft, ChevronRight, 
  Image as ImageIcon, Check, ChevronUp, ChevronDown, PlusCircle,
  ArrowDownToLine, AlertTriangle, Calendar, Filter, Eye, EyeOff,
  Clock, Tag as TagIcon, CreditCard, AlignLeft, FileEdit
} from 'lucide-react';
import './App.css'

const formatMoney = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getCurrentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function App() {
 // --- STATE ĐIỀU HƯỚNG ---
   const [activeTab, setActiveTab] = useState('camera'); 
   const [viewMonth, setViewMonth] = useState(new Date()); 
   const [selectedDate, setSelectedDate] = useState(new Date()); 
   const currentMonthKey = getCurrentMonthKey();
 
   // --- STATE BÁO CÁO (STATS FILTER) ---
   const [statsMode, setStatsMode] = useState('month'); 
   const [statsRefDate, setStatsRefDate] = useState(new Date());
   const [statsCustomRange, setStatsCustomRange] = useState({ start: '', end: '' });
 
   // --- STATE MỞ RỘNG / THU GỌN & ẨN SỐ DƯ ---
   const [expandedTags, setExpandedTags] = useState({});
   const [hiddenBalances, setHiddenBalances] = useState({});
   const [isTotalHidden, setIsTotalHidden] = useState(false);
  // --- STATE CHI TIẾT GIAO DỊCH ---
   const [selectedTxnDetail, setSelectedTxnDetail] = useState(null);
 
   const toggleExpand = (tagId) => {
     setExpandedTags(prev => ({ ...prev, [tagId]: !prev[tagId] }));
   };
 
   const toggleHideBalance = (id, e) => {
     if (e) e.stopPropagation();
     setHiddenBalances(prev => ({ ...prev, [id]: !prev[id] }));
   };
 
   // --- DỮ LIỆU CỐT LÕI ---
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
 
   // --- STATE FORM GIAO DỊCH ---
   const [isDrafting, setIsDrafting] = useState(false);
   const [draftImage, setDraftImage] = useState(null);
   const [draftType, setDraftType] = useState('expense');
   const [draftAmount, setDraftAmount] = useState('');
   const [draftCaption, setDraftCaption] = useState('');
   const [draftTags, setDraftTags] = useState([]);
   const [draftAccount, setDraftAccount] = useState('acc1');
 
   // --- STATE POPUPS ---
   const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
   const [transferForm, setTransferForm] = useState({ fromId: '', toId: '', amount: '' });
 
   const [isAccountFormVisible, setIsAccountFormVisible] = useState(false);
   const [accountForm, setAccountForm] = useState({ id: null, name: '', initialBalance: '', fallbackId: '' });
 
   const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
   const [assetForm, setAssetForm] = useState({ tagId: null, totalInvested: 0, isGold: false, currentValue: '', quantity: '', unit: 'chỉ', customGoldPrice: 8500000 });
 
   const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
   const [withdrawForm, setWithdrawForm] = useState({ tagId: null, amount: '', accountId: 'acc1' });
 
   const [isTagModalOpen, setIsTagModalOpen] = useState(false);
   const [newTagName, setNewTagName] = useState('');
   const [newTagType, setNewTagType] = useState('expense');
 
   const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
   const [budgetForm, setBudgetForm] = useState({ tagId: null, unitValue: '', totalFrequency: '', totalValue: '' });
 
   const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
   const [newBudgetForm, setNewBudgetForm] = useState({ name: '', unitValue: '', totalFrequency: '', totalValue: '' });
 
   const [isNewInvestmentModalOpen, setIsNewInvestmentModalOpen] = useState(false);
   const [newInvestmentName, setNewInvestmentName] = useState('');
 
   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', action: null });
   const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
 
   // --- LOGIC API & CAMERA ---
   const fileInputRef = useRef(null);
   const videoRef = useRef(null);
   const canvasRef = useRef(null);
   const [stream, setStream] = useState(null);
   const [cameraError, setCameraError] = useState(false);
   const [isCameraActive, setIsCameraActive] = useState(false); // Trạng thái mở camera full screen
   const [liveGoldPrice, setLiveGoldPrice] = useState(8500000); 
   const [isFetchingGold, setIsFetchingGold] = useState(false);
 
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
        setIsCameraActive(false); // Ẩn camera nếu đang bật
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
  
    useEffect(() => {
      if (isCameraActive && activeTab === 'camera' && !isDrafting && !draftImage) {
        startCamera();
      } else {
        stopCamera();
      }
      return () => stopCamera();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCameraActive, activeTab, isDrafting, draftImage]);
  
    // Tắt camera khi chuyển sang tab khác
    useEffect(() => {
        if (activeTab !== 'camera') {
            setIsCameraActive(false);
        }
    }, [activeTab]);
  
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
  
    // --- LOGIC XỬ LÝ DỮ LIỆU ---
    const showToastMsg = (message, type = 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
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
  
    const handleMoveTag = (tagId, direction) => {
      const currentTag = tags.find(t => t.id === tagId);
      if (!currentTag) return;
      const sameTypeTags = tags.filter(t => t.type === currentTag.type);
      const currentIndex = sameTypeTags.findIndex(t => t.id === tagId);
  
      if (direction === 'up' && currentIndex > 0) swapTags(tagId, sameTypeTags[currentIndex - 1].id);
      else if (direction === 'down' && currentIndex < sameTypeTags.length - 1) swapTags(tagId, sameTypeTags[currentIndex + 1].id);
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
  
    const handleManualTransfer = () => {
      const amount = parseFloat(transferForm.amount);
      if (!amount || amount <= 0 || !transferForm.fromId || !transferForm.toId) return showToastMsg("Dữ liệu không hợp lệ", "error");
      if (currentBalances[transferForm.fromId] < amount) return showToastMsg("Số dư không đủ", "error");
      const now = new Date();
      setTransactions([{ id: `mtf_${Date.now()}`, type: 'transfer', fromAccountId: transferForm.fromId, toAccountId: transferForm.toId, amount: amount, timestamp: now, caption: `Chuyển nội bộ`, isManualTransfer: true }, ...transactions]);
      setIsTransferModalOpen(false); setTransferForm({ fromId: '', toId: '', amount: '' });
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
      setSelectedTxnDetail(null);
      setConfirmDialog({ isOpen: false }); showToastMsg("Đã xóa giao dịch");
    };
  
    const openAssetModal = (tag, ast, isGold) => {
      if (isGold) fetchLiveGoldPrice();
      setAssetForm({ tagId: tag.id, totalInvested: ast.totalInvested || 0, isGold: isGold, currentValue: (ast.totalInvested || 0) + (ast.pnl || 0), quantity: ast.quantity || '', unit: ast.unit || 'chỉ', customGoldPrice: ast.customGoldPrice || liveGoldPrice });
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
  
    const handleWithdrawInvestment = () => {
      const amount = parseFloat(withdrawForm.amount);
      if (!amount || amount <= 0) return showToastMsg("Số tiền không hợp lệ", "error");
      const ast = assets[withdrawForm.tagId] || { totalInvested: 0, pnl: 0 };
      const currentVal = ast.totalInvested + ast.pnl;
      if (amount > currentVal) return showToastMsg(`Vượt mức ${formatMoney(currentVal)}`, "error");
  
      const ratio = amount / currentVal;
      setAssets({ ...assets, [withdrawForm.tagId]: { ...ast, totalInvested: Math.max(0, ast.totalInvested - (ast.totalInvested * ratio)), pnl: ast.pnl - (ast.pnl * ratio) } });
      const now = new Date();
      setTransactions([{ id: Date.now().toString(), type: 'withdraw', amount: amount, imageUrl: null, caption: `Thu hồi vốn`, tagIds: [withdrawForm.tagId], accountId: withdrawForm.accountId, timestamp: now }, ...transactions]);
      setIsWithdrawModalOpen(false); setSelectedDate(now); setActiveTab('calendar'); showToastMsg(`Đã thu hồi ${formatMoney(amount)}`);
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
  
    // --- LOGIC TỰ ĐỘNG TÍNH NGÂN SÁCH ---
    const handleNewBudgetChange = (field, value) => {
      setNewBudgetForm(prev => {
          const updated = { ...prev, [field]: value };
          const u = parseFloat(updated.unitValue) || 0;
          const f = parseInt(updated.totalFrequency) || 0;
          if (u > 0 && f > 0) {
              updated.totalValue = (u * f).toString();
          }
          return updated;
      });
    };
  
    const handleBudgetChange = (field, value) => {
      setBudgetForm(prev => {
          const updated = { ...prev, [field]: value };
          const u = parseFloat(updated.unitValue) || 0;
          const f = parseInt(updated.totalFrequency) || 0;
          if (u > 0 && f > 0) {
              updated.totalValue = (u * f).toString();
          }
          return updated;
      });
    };
  
    const handleEditBudget = () => {
      if (!budgetForm.tagId) return showToastMsg("Lỗi form", "error");
      let finalTotal = parseFloat(budgetForm.totalValue);
      const unit = parseFloat(budgetForm.unitValue);
      const freq = parseInt(budgetForm.totalFrequency);
  
      if (!finalTotal && unit > 0 && freq > 0) finalTotal = unit * freq;
      if (!finalTotal || finalTotal <= 0) return showToastMsg("Nhập Tổng Ngân Sách", "error");
  
      setBudgets({ ...budgets, [budgetForm.tagId]: { totalValue: finalTotal, unitValue: isNaN(unit) ? 0 : unit, totalFrequency: isNaN(freq) ? 0 : freq } });
      setIsBudgetModalOpen(false); showToastMsg("Đã lưu chi tiết");
    };
  
    const handleSaveNewBudget = () => {
      if (!newBudgetForm.name.trim()) return showToastMsg("Nhập tên danh mục", "error");
      let finalTotal = parseFloat(newBudgetForm.totalValue);
      const unit = parseFloat(newBudgetForm.unitValue);
      const freq = parseInt(newBudgetForm.totalFrequency);
  
      if (!finalTotal && unit > 0 && freq > 0) finalTotal = unit * freq;
      if (!finalTotal || finalTotal <= 0) return showToastMsg("Nhập Tổng Ngân Sách", "error");
  
      const newId = Date.now().toString();
      const colors = ['bg-orange-500', 'bg-blue-400', 'bg-pink-400', 'bg-red-500', 'bg-cyan-500'];
      setTags([...tags, { id: newId, name: newBudgetForm.name, type: 'expense', color: colors[Math.floor(Math.random() * colors.length)] }]);
      setBudgets({ ...budgets, [newId]: { totalValue: finalTotal, unitValue: isNaN(unit) ? 0 : unit, totalFrequency: isNaN(freq) ? 0 : freq } });
      setIsNewBudgetModalOpen(false); setNewBudgetForm({ name: '', unitValue: '', totalFrequency: '', totalValue: '' });
      showToastMsg("Đã tạo Ngân sách mới!");
    };
  
    const handleSaveNewInvestment = () => {
      if (!newInvestmentName.trim()) return showToastMsg("Nhập tên danh mục", "error");
      const newId = Date.now().toString();
      const colors = ['bg-purple-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-teal-500', 'bg-rose-500'];
      setTags([...tags, { id: newId, name: newInvestmentName, type: 'investment', color: colors[Math.floor(Math.random() * colors.length)] }]);
      setIsNewInvestmentModalOpen(false); setNewInvestmentName(''); showToastMsg("Đã thêm danh mục Đầu tư!");
    };
  
    // --- RENDER VIEWS ---
    const renderCameraView = () => {
      // 1. DRAFTING FORM (FORM ĐIỀN THÔNG TIN CHI PHÍ)
      if (isDrafting) {
        return (
          <div className="flex flex-col h-full bg-black text-white absolute inset-0 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-3 sm:p-4 flex justify-between items-center bg-zinc-950 border-b border-zinc-900">
              <button onClick={() => setIsDrafting(false)} className="p-2 bg-zinc-800 rounded-full text-zinc-400"><X size={20}/></button>
              <div className="flex bg-zinc-900 rounded-full p-1 gap-1 border border-zinc-800">
                <button onClick={() => {setDraftType('expense'); setDraftTags([]);}} className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-xs font-bold transition-all ${draftType === 'expense' ? 'bg-red-500 text-white' : 'text-zinc-500'}`}>Chi</button>
                <button onClick={() => {setDraftType('income'); setDraftTags([]);}} className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-xs font-bold transition-all ${draftType === 'income' ? 'bg-green-500 text-white' : 'text-zinc-500'}`}>Thu</button>
                <button onClick={() => {setDraftType('investment'); setDraftTags([]);}} className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-xs font-bold transition-all ${draftType === 'investment' ? 'bg-purple-500 text-white' : 'text-zinc-500'}`}>Đầu tư</button>
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
              <button onClick={submitTransaction} className="w-full py-4 sm:py-5 bg-yellow-400 text-black rounded-2xl sm:rounded-[2rem] font-black text-[16px] sm:text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"><Send size={18}/> Lưu</button>
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
                <button onClick={() => setDraftImage(null)} className="w-16 h-16 bg-zinc-800/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-xl"><X size={28}/></button>
                <button onClick={() => setIsDrafting(true)} className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-black active:scale-90 transition-transform shadow-[0_0_40px_rgba(250,204,21,0.4)]"><Check size={36}/></button>
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
              <button onClick={() => setIsCameraActive(false)} className="absolute top-12 left-6 w-12 h-12 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 active:scale-90 transition-transform shadow-lg"><X size={24}/></button>
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
                      <ImageIcon size={22} className="text-zinc-300 drop-shadow-md"/>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Thư viện</span>
              </div>
  
              {/* Nút Nhập tay */}
              <div className="flex flex-col items-center gap-2">
                  <button 
                      onClick={handleManualEntry}
                      className="relative flex items-center justify-center w-[56px] h-[56px] bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-full active:scale-90 transition-transform shadow-lg cursor-pointer hover:bg-zinc-800"
                  >
                      <FileEdit size={22} className="text-zinc-300 drop-shadow-md"/>
                  </button>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nhập tay</span>
              </div>
          </div>
        </div>
      );
    };
  
    const renderCalendarView = () => {
      const year = viewMonth.getFullYear(); const month = viewMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDayOffset = new Date(year, month, 1).getDay() === 0 ? 6 : new Date(year, month, 1).getDay() - 1;
  
      const txnsByDateMap = {};
      transactions.forEach(t => {
        if(t.type === 'transfer' && !t.isManualTransfer) return;
        const dStr = t.timestamp.toLocaleDateString('vi-VN');
        if (!txnsByDateMap[dStr]) txnsByDateMap[dStr] = { list: [] };
        txnsByDateMap[dStr].list.push(t);
      });
  
      const selectedDateStr = selectedDate.toLocaleDateString('vi-VN');
      const selectedDayData = txnsByDateMap[selectedDateStr] || { list: [] };
  
      return (
        <div className="flex flex-col h-full bg-black text-white overflow-y-auto pb-32 relative z-10">
          <div className="p-4 sm:p-6 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-20"><h2 className="text-xl sm:text-2xl font-black">Nhật ký Lịch</h2></div>
          <div className="p-4 sm:p-5 space-y-5 sm:space-y-6">
            <div className="bg-[#1C1C1E] rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 border border-zinc-800 shadow-xl">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                 <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full"><ChevronLeft size={18}/></button>
                 <h3 className="text-base sm:text-lg font-black uppercase">Tháng {month + 1}, {year}</h3>
                 <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full"><ChevronRight size={18}/></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2 sm:mb-4 text-center">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (<div key={d} className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase">{d}</div>))}</div>
              <div className="grid grid-cols-7 gap-y-3 sm:gap-y-5 gap-x-1 sm:gap-x-1.5">
                {Array.from({ length: startDayOffset }).map((_, i) => <div key={i}></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1; const dStr = new Date(year, month, day).toLocaleDateString('vi-VN');
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
              <h3 className="text-base sm:text-lg font-black mb-3 sm:mb-4 flex items-center gap-2">Giao dịch <span className="text-yellow-400 text-xs sm:text-sm">({selectedDate.getDate()}/{selectedDate.getMonth()+1})</span></h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {selectedDayData.list.map(txn => (
                  <div key={txn.id} onClick={() => setSelectedTxnDetail(txn)} className="aspect-square bg-zinc-900 rounded-2xl sm:rounded-[1.8rem] overflow-hidden border border-zinc-800 relative shadow-lg cursor-pointer group hover:border-zinc-600 transition-colors">
                    {txn.imageUrl ? <img src={txn.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Wallet size={40}/></div>}
                    <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between bg-gradient-to-t from-black via-black/40 to-transparent">
                      <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1 items-start max-w-[80%]">
                              {txn.type === 'transfer' && <span className="text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase border border-blue-400/50">Chuyển Tiền</span>}
                              {txn.topupLogs && txn.topupLogs.length > 0 && (
                                 <span className="text-[8px] sm:text-[9px] font-bold bg-zinc-900/80 text-yellow-400 px-1.5 sm:px-2 py-0.5 rounded-md border border-yellow-500/30 shadow-sm leading-tight inline-flex items-center gap-0.5 backdrop-blur-sm mb-1 truncate max-w-full">
                                    <Zap size={8} className="shrink-0"/> Bù {formatMoney(txn.topupLogs.reduce((s,t)=>s+t.amount,0))}
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
  
    const renderTransactionDetailModal = () => {
      if (!selectedTxnDetail) return null;
      const txn = selectedTxnDetail;
      const accName = accounts.find(a => a.id === txn.accountId)?.name || 'Không rõ';
      const txnTags = tags.filter(t => (txn.tagIds || []).includes(t.id));
      
      return (
        <div className="absolute inset-0 z-[80] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 sm:p-6 flex justify-between items-center border-b border-zinc-800/50">
             <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Chi tiết Giao dịch</h3>
             <button onClick={() => setSelectedTxnDetail(null)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-10 space-y-6">
             {/* IMAGE */}
             <div className="w-full aspect-square max-h-[40vh] bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center relative">
                {txn.imageUrl ? <img src={txn.imageUrl} className="w-full h-full object-cover" /> : <Wallet size={64} className="text-zinc-700 opacity-30"/>}
                {txn.type === 'transfer' && <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-lg border border-blue-400/50">Chuyển Tiền</div>}
             </div>
  
             {/* AMOUNT & TIME */}
             <div className="text-center space-y-1">
                <div className={`text-4xl sm:text-5xl font-black tracking-tight ${txn.type === 'income' ? 'text-green-400' : txn.type === 'transfer' ? 'text-blue-400' : 'text-red-500'}`}>
                   {txn.type === 'income' ? '+' : txn.type === 'transfer' ? '' : '-'}{formatMoney(txn.amount)}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-zinc-500 font-bold text-[12px] sm:text-sm">
                   <Clock size={14}/> {txn.timestamp.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {txn.timestamp.toLocaleDateString('vi-VN')}
                </div>
             </div>
  
             {/* INFO CARD */}
             <div className="bg-[#1C1C1E] rounded-[2rem] p-5 sm:p-6 border border-zinc-800 shadow-xl space-y-4">
                {/* TAGS */}
                {txnTags.length > 0 && (
                  <div className="flex items-start gap-3">
                     <TagIcon size={16} className="text-zinc-500 mt-1 shrink-0"/>
                     <div className="flex flex-wrap gap-2">
                        {txnTags.map(t => <span key={t.id} className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-black text-white uppercase tracking-wider ${t.color}`}>{t.name}</span>)}
                     </div>
                  </div>
                )}
  
                {/* ACCOUNT INFO */}
                <div className="flex items-center gap-3">
                   <CreditCard size={16} className="text-zinc-500 shrink-0"/>
                   {txn.type === 'transfer' ? (
                       <div className="text-sm font-bold text-zinc-300">
                           Từ <span className="text-white">{accounts.find(a=>a.id===txn.fromAccountId)?.name}</span> đến <span className="text-white">{accounts.find(a=>a.id===txn.toAccountId)?.name}</span>
                       </div>
                   ) : (
                       <div className="text-sm font-bold text-zinc-300">Tài khoản: <span className="text-white">{accName}</span></div>
                   )}
                </div>
  
                {/* CAPTION */}
                {txn.caption && (
                  <div className="flex items-start gap-3">
                     <AlignLeft size={16} className="text-zinc-500 mt-0.5 shrink-0"/>
                     <div className="text-sm font-medium text-zinc-300 italic">"{txn.caption}"</div>
                  </div>
                )}
  
                {/* TOPUP LOGS */}
                {txn.topupLogs && txn.topupLogs.length > 0 && (
                  <div className="pt-4 border-t border-zinc-800/50 space-y-2.5">
                     <div className="text-[10px] font-black text-yellow-500 uppercase flex items-center gap-1"><Zap size={12}/> Chi tiết tự động bù tiền</div>
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
             <button onClick={() => setConfirmDialog({ isOpen: true, title: "Xóa?", message: "Xóa giao dịch này và khôi phục số dư?", action: () => executeDeleteTransaction(txn.id) })} className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"><Trash2 size={18}/> Xóa Giao Dịch</button>
          </div>
        </div>
      );
    };
  
    const renderAssetView = () => {
      const investmentTags = tags.filter(t => t.type === 'investment');
      const totalCashOnHand = accounts.reduce((sum, acc) => sum + currentBalances[acc.id], 0);
      const totalInvestmentValue = investmentTags.reduce((sum, t) => sum + ((assets[t.id]?.totalInvested || 0) + (assets[t.id]?.pnl || 0)), 0);
      const totalNetWorth = totalCashOnHand + totalInvestmentValue;
  
      return (
        <div className="flex flex-col h-full bg-black text-white overflow-hidden pb-32 relative z-10">
          <div className="p-4 sm:p-5 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-20"><h2 className="text-xl sm:text-2xl font-black tracking-tight">Tài Sản & Ví</h2></div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 sm:space-y-8 animate-in slide-in-from-left-4">
              
              <div className="bg-gradient-to-br from-zinc-800 to-black rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-zinc-700 shadow-2xl relative">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] sm:text-[11px] text-zinc-400 font-black uppercase tracking-widest bg-zinc-900/80 px-2.5 sm:px-3 py-1 rounded-full">Tổng tài sản</span>
                   <button onClick={() => setIsTotalHidden(!isTotalHidden)} className="p-1.5 sm:p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900 rounded-full border border-zinc-700">
                      {isTotalHidden ? <EyeOff size={16} className="sm:w-5 sm:h-5"/> : <Eye size={16} className="sm:w-5 sm:h-5"/>}
                   </button>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 truncate">
                   {isTotalHidden ? '******' : formatMoney(totalNetWorth)}
                </div>
              </div>
  
              <div>
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                     <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-zinc-200"><Wallet size={18} className="text-blue-400 sm:w-5 sm:h-5" /> Nguồn tiền (Ví)</h3>
                     <div className="flex gap-2">
                        <button onClick={() => setIsTransferModalOpen(true)} className="p-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg shadow-sm"><ArrowRightLeft size={14} className="sm:w-4 sm:h-4"/></button>
                        {!isAccountFormVisible && <button onClick={() => { setAccountForm({ id: null, name: '', initialBalance: '', fallbackId: '' }); setIsAccountFormVisible(true); }} className="text-[10px] sm:text-[11px] bg-zinc-800 px-2.5 py-1.5 rounded-lg text-zinc-300 font-bold flex items-center gap-1"><Plus size={12}/> Thêm</button>}
                     </div>
                  </div>
  
                  {isAccountFormVisible ? (
                     <div className="bg-zinc-900 rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-5 border border-zinc-700 shadow-xl animate-in fade-in">
                        <h4 className="font-black text-sm sm:text-base text-white mb-3 sm:mb-4">{accountForm.id ? 'Sửa Ví' : 'Thêm Ví'}</h4>
                        <div className="space-y-2.5 sm:space-y-3">
                           <input type="text" placeholder="Tên ví..." value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} className="w-full bg-black text-white text-[16px] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-800 font-bold" />
                           <input type="number" placeholder="Số dư..." value={accountForm.initialBalance} onChange={e => setAccountForm({...accountForm, initialBalance: e.target.value})} className="w-full bg-black text-white text-[16px] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-800 font-bold" />
                           <div className="bg-black p-2.5 sm:p-3 rounded-xl border border-zinc-800 mt-2">
                               <label className="text-[10px] sm:text-[11px] uppercase font-bold text-zinc-500 mb-1.5 sm:mb-2 flex items-center gap-1"><Zap size={12} className="text-yellow-500 sm:w-3.5 sm:h-3.5"/> Ví Dự Phòng (Auto-Topup)</label>
                               <select value={accountForm.fallbackId} onChange={e => setAccountForm({...accountForm, fallbackId: e.target.value})} className="w-full bg-zinc-900 text-white rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-zinc-800 font-bold text-[16px]">
                                   <option value="">-- Không có --</option>
                                   {accounts.filter(a => a.id !== accountForm.id).map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
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
                                  <div className="flex items-center gap-2 max-w-[65%]"><div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${acc.color} shadow-md`}></div><span className="font-bold text-sm sm:text-base text-white truncate">{acc.name}</span></div>
                                  <div className="flex gap-1.5 shrink-0">
                                     <button onClick={() => { setAccountForm({...acc}); setIsAccountFormVisible(true); }} className="p-1.5 bg-zinc-900 text-zinc-400 rounded-lg"><Edit2 size={12}/></button>
                                     <button onClick={() => deleteAccount(acc.id)} className="p-1.5 bg-zinc-900 text-red-400 rounded-lg"><Trash2 size={12}/></button>
                                  </div>
                               </div>
                               <div className="flex justify-between items-end">
                                  {fallback ? <div className="text-[9px] sm:text-[10px] font-bold text-blue-400 flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 max-w-[40%] truncate"><Zap size={10} className="shrink-0"/> Backup: {fallback.name}</div> : <div></div>}
                                  
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                      <span className="font-black text-lg sm:text-xl text-white tracking-tight">{isHidden ? '******' : formatMoney(currentBalances[acc.id])}</span>
                                      <button onClick={(e) => toggleHideBalance(acc.id, e)} className="text-zinc-500 hover:text-white transition-colors p-1">
                                          {isHidden ? <EyeOff size={14} className="sm:w-4 sm:h-4"/> : <Eye size={14} className="sm:w-4 sm:h-4"/>}
                                      </button>
                                  </div>
                               </div>
                             </div>
                           )
                        })}
                     </div>
                  )}
              </div>
  
              <div>
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                   <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-zinc-200"><TrendingUp size={18} className="text-purple-500 sm:w-5 sm:h-5" /> Đầu Tư</h3>
                   <button onClick={() => setIsNewInvestmentModalOpen(true)} className="text-[10px] sm:text-[11px] bg-purple-500/20 px-2 sm:px-2.5 py-1.5 rounded-lg text-purple-400 font-bold flex items-center gap-1 border border-purple-500/30"><Plus size={12}/> Thêm DM</button>
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
                                        {tag.name} {isGold && <Zap size={10} className="text-yellow-200 shrink-0"/>}
                                      </span>
                                      <div className="flex items-center gap-2 sm:gap-3">
                                         <div className="text-right flex items-center gap-1.5 sm:gap-2">
                                            <span className="text-sm sm:text-base font-black text-white block">{isHidden ? '******' : formatMoney(currentVal)}</span>
                                            <button onClick={(e) => toggleHideBalance(tag.id, e)} className="text-zinc-500 hover:text-white transition-colors">
                                                {isHidden ? <EyeOff size={14} className="sm:w-4 sm:h-4"/> : <Eye size={14} className="sm:w-4 sm:h-4"/>}
                                            </button>
                                         </div>
                                         {isExpanded ? <ChevronUp size={16} className="text-zinc-500 sm:w-5 sm:h-5"/> : <ChevronDown size={16} className="text-zinc-500 sm:w-5 sm:h-5"/>}
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
                                       <button onClick={(e) => { e.stopPropagation(); openAssetModal(tag, ast, isGold); }} className="text-[10px] sm:text-[11px] uppercase bg-zinc-800 hover:bg-zinc-700 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg text-purple-400 font-bold border border-zinc-700 transition">Cập nhật</button>
                                       {currentVal > 0 && <button onClick={(e) => { e.stopPropagation(); setWithdrawForm({ tagId: tag.id, amount: '', accountId: accounts[0]?.id }); setIsWithdrawModalOpen(true); }} className="text-[10px] sm:text-[11px] uppercase bg-blue-500/10 text-blue-400 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg font-bold border border-blue-500/20 transition flex items-center gap-1"><ArrowDownToLine size={12} className="sm:w-3.5 sm:h-3.5"/> Rút</button>}
                                       <button onClick={(e) => { e.stopPropagation(); requestDeleteTag(tag.id, tag.name); }} className="text-[10px] sm:text-[11px] uppercase bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg font-bold border border-red-500/20 transition flex items-center gap-1"><Trash2 size={12} className="sm:w-3.5 sm:h-3.5"/> Xóa</button>
                                    </div>
                                    <div className="flex flex-col bg-zinc-800/50 rounded-md sm:rounded-lg overflow-hidden border border-zinc-700">
                                       <button onClick={(e) => { e.stopPropagation(); handleMoveTag(tag.id, 'up'); }} disabled={idx === 0} className={`p-1 flex items-center justify-center transition-colors ${idx === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}><ChevronUp size={14} className="sm:w-4 sm:h-4"/></button>
                                       <div className="h-[1px] w-full bg-zinc-700"></div>
                                       <button onClick={(e) => { e.stopPropagation(); handleMoveTag(tag.id, 'down'); }} disabled={idx === investmentTags.length - 1} className={`p-1 flex items-center justify-center transition-colors ${idx === investmentTags.length - 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}><ChevronDown size={14} className="sm:w-4 sm:h-4"/></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div className="bg-black/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-zinc-800"><span className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase">Vốn đầu tư</span><span className="text-xs sm:text-sm font-black text-zinc-300 block mt-0.5 sm:mt-1 truncate">{isHidden ? '******' : formatMoney(ast.totalInvested)}</span></div>
                                    <div className="bg-black/30 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-zinc-800"><span className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase">Giá trị hiện tại</span><span className="text-xs sm:text-sm font-black text-white block mt-0.5 sm:mt-1 truncate">{isHidden ? '******' : formatMoney(currentVal)}</span></div>
                                    <div className="col-span-2 bg-zinc-900/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-700/50 flex justify-between items-center mt-0.5 sm:mt-1">
                                      <span className="text-[11px] sm:text-[12px] font-black text-zinc-400 uppercase">Lãi / Lỗ</span><span className={`font-black text-base sm:text-lg ${ast.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{isHidden ? '******' : `${ast.pnl >= 0 ? '+' : ''}${formatMoney(ast.pnl)}`}</span>
                                    </div>
                                </div>
                                {isGold && ast.quantity && (
                                   <div className="mt-2.5 sm:mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 flex justify-between items-center"><span className="text-[11px] sm:text-[12px] text-zinc-400 font-medium">Kho Vàng đang trữ:</span><span className="text-xs sm:text-sm font-black text-yellow-400">{ast.quantity} {ast.unit}</span></div>
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
  
    const renderBudgetView = () => {
      const expenseTags = tags.filter(t => t.type === 'expense');
  
      return (
        <div className="flex flex-col h-full bg-black text-white overflow-hidden pb-32 relative z-10">
          <div className="p-4 sm:p-5 border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-20"><h2 className="text-xl sm:text-2xl font-black tracking-tight">Ngân Sách</h2></div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 animate-in slide-in-from-right-4">
             <button onClick={() => setIsNewBudgetModalOpen(true)} className="w-full py-3.5 sm:py-4 border-2 border-dashed border-zinc-700 bg-zinc-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base text-zinc-400 font-bold hover:bg-zinc-800 hover:text-white transition-colors"><PlusCircle size={18} className="sm:w-5 sm:h-5"/> Tạo Mới</button>
             <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-zinc-200 mt-2 mb-1 sm:mb-2"><Target size={18} className="text-red-400 sm:w-5 sm:h-5" /> Kế hoạch Tháng {new Date().getMonth()+1}</h3>
             
             {expenseTags.length === 0 && <div className="text-center py-5 sm:py-6 text-zinc-600 text-xs font-bold italic border border-dashed border-zinc-800 rounded-xl">Chưa có danh mục</div>}
             
             {expenseTags.map((tag, idx) => {
                const budget = budgets[tag.id] || {};
                const totalValue = parseFloat(budget.totalValue) || 0;
                const unitValue = parseFloat(budget.unitValue) || 0;
                const totalFreq = parseInt(budget.totalFrequency) || 0;
  
                const spentTxns = transactions.filter(t => t.type === 'expense' && (t.tagIds || []).includes(tag.id) && `${t.timestamp.getFullYear()}-${String(t.timestamp.getMonth() + 1).padStart(2, '0')}` === currentMonthKey);
                const spent = spentTxns.reduce((s,t) => s + t.amount, 0);
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
                      {isExceeded && totalValue > 0 && <div className="absolute top-0 right-0 bg-red-500/20 text-red-500 text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-bl-lg sm:rounded-bl-xl border-b border-l border-red-500/30 flex items-center gap-1 z-10"><AlertTriangle size={10}/> Vượt Ngân Sách</div>}
  
                      <div onClick={() => toggleExpand(tag.id)} className="p-4 sm:p-5 cursor-pointer active:bg-zinc-800/30 transition-colors">
                         <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
                             <div className="flex justify-between items-center">
                                 <span className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider ${tag.color} shadow-sm max-w-[40%] truncate`}>{tag.name}</span>
                                 <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className={`text-[11px] sm:text-xs font-bold ${isExceeded ? 'text-red-500' : 'text-zinc-300'}`}>
                                        {formatMoney(spent)} <span className="text-zinc-500">/</span> {formatMoney(totalValue)}
                                    </span>
                                    {isExpanded ? <ChevronUp size={16} className="text-zinc-500 sm:w-5 sm:h-5"/> : <ChevronDown size={16} className="text-zinc-500 sm:w-5 sm:h-5"/>}
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
                                    <button onClick={(e) => { e.stopPropagation(); setBudgetForm({ tagId: tag.id, totalValue: totalValue || '', unitValue: unitValue || '', totalFrequency: totalFreq || '' }); setIsBudgetModalOpen(true); }} className="text-[10px] sm:text-[11px] text-zinc-400 bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg flex items-center gap-1.5 font-bold transition-colors"><Edit2 size={10} className="sm:w-3.5 sm:h-3.5"/> {totalValue > 0 ? 'Sửa' : 'Cài đặt'}</button>
                                    <button onClick={(e) => { e.stopPropagation(); requestDeleteTag(tag.id, tag.name); }} className="text-[10px] sm:text-[11px] uppercase bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg font-bold border border-red-500/20 transition flex items-center gap-1"><Trash2 size={10} className="sm:w-3.5 sm:h-3.5"/> Xóa</button>
                                 </div>
                                 <div className="flex flex-col bg-zinc-800/50 rounded-md sm:rounded-lg overflow-hidden border border-zinc-700">
                                    <button onClick={(e) => { e.stopPropagation(); handleMoveTag(tag.id, 'up'); }} disabled={idx === 0} className={`p-1 flex items-center justify-center transition-colors ${idx === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}><ChevronUp size={12} className="sm:w-4 sm:h-4"/></button>
                                    <div className="h-[1px] w-full bg-zinc-700"></div>
                                    <button onClick={(e) => { e.stopPropagation(); handleMoveTag(tag.id, 'down'); }} disabled={idx === expenseTags.length - 1} className={`p-1 flex items-center justify-center transition-colors ${idx === expenseTags.length - 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}><ChevronDown size={12} className="sm:w-4 sm:h-4"/></button>
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
  
    const renderStatsView = () => {
      // 1. CHUYỂN NGÀY THÁNG NAVIGATOR
      const handlePrevPeriod = () => {
         const d = new Date(statsRefDate);
         if(statsMode === 'day') d.setDate(d.getDate() - 1);
         else if(statsMode === 'month') d.setMonth(d.getMonth() - 1);
         else if(statsMode === 'year') d.setFullYear(d.getFullYear() - 1);
         setStatsRefDate(d);
      };
  
      const handleNextPeriod = () => {
         const d = new Date(statsRefDate);
         if(statsMode === 'day') d.setDate(d.getDate() + 1);
         else if(statsMode === 'month') d.setMonth(d.getMonth() + 1);
         else if(statsMode === 'year') d.setFullYear(d.getFullYear() + 1);
         setStatsRefDate(d);
      };
  
      const getPeriodLabel = () => {
         if(statsMode === 'day') return `${statsRefDate.getDate()}/${statsRefDate.getMonth()+1}/${statsRefDate.getFullYear()}`;
         if(statsMode === 'month') return `Tháng ${statsRefDate.getMonth()+1}, ${statsRefDate.getFullYear()}`;
         if(statsMode === 'year') return `Năm ${statsRefDate.getFullYear()}`;
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
             if(!statsCustomRange.start || !statsCustomRange.end) return true;
             const s = new Date(statsCustomRange.start); s.setHours(0,0,0,0);
             const e = new Date(statsCustomRange.end); e.setHours(23,59,59,999);
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
          chartData = Array.from({length: 7}, (_, i) => {
              const d = new Date(statsRefDate);
              d.setDate(d.getDate() - (6 - i));
              const dStr = d.toLocaleDateString('vi-VN');
              const spent = transactions.filter(t => t.type === 'expense' && t.timestamp.toLocaleDateString('vi-VN') === dStr).reduce((s,t) => s + t.amount, 0);
              return { label: `${d.getDate()}/${d.getMonth()+1}`, spent, isHighlight: i === 6 };
          });
      } else if (statsMode === 'month') {
          const weeks = [ {l: 'Tuần 1', s:1, e:7}, {l: 'Tuần 2', s:8, e:14}, {l: 'Tuần 3', s:15, e:21}, {l: 'Tuần 4', s:22, e:31} ];
          chartData = weeks.map(w => {
              const spent = filteredTxns.filter(t => t.type === 'expense' && t.timestamp.getDate() >= w.s && t.timestamp.getDate() <= w.e).reduce((s,t)=> s+t.amount, 0);
              return { label: w.l, spent, isHighlight: false };
          });
      } else if (statsMode === 'year') {
          chartData = Array.from({length: 12}, (_, i) => {
              const spent = filteredTxns.filter(t => t.type === 'expense' && t.timestamp.getMonth() === i).reduce((s,t)=> s+t.amount, 0);
              return { label: `T${i+1}`, spent, isHighlight: new Date().getMonth() === i && statsRefDate.getFullYear() === new Date().getFullYear() };
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
                     <button onClick={handlePrevPeriod} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full active:scale-90 transition-transform"><ChevronLeft size={18} className="sm:w-5 sm:h-5"/></button>
                     <h3 className="text-xs sm:text-sm font-black uppercase text-yellow-400 flex items-center gap-1.5 sm:gap-2"><Calendar size={14} className="sm:w-4 sm:h-4"/> {getPeriodLabel()}</h3>
                     <button onClick={handleNextPeriod} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full active:scale-90 transition-transform"><ChevronRight size={18} className="sm:w-5 sm:h-5"/></button>
                   </>
                ) : (
                   <div className="w-full flex flex-col gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Filter size={14} className="text-zinc-500 sm:w-4 sm:h-4"/>
                        <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase">Khoảng thời gian</span>
                      </div>
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <input type="date" value={statsCustomRange.start} onChange={e => setStatsCustomRange({...statsCustomRange, start: e.target.value})} className="flex-1 bg-black text-white text-[16px] sm:text-sm rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 border border-zinc-800 font-bold" />
                        <input type="date" value={statsCustomRange.end} onChange={e => setStatsCustomRange({...statsCustomRange, end: e.target.value})} className="flex-1 bg-black text-white text-[16px] sm:text-sm rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 border border-zinc-800 font-bold" />
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
                        if(amount === 0) return null; 
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
  
    // --- RENDERING TỔNG THỂ ---
    return (
      <div className="fixed inset-0 flex justify-center bg-zinc-950 font-sans selection:bg-yellow-400 overscroll-none">
        <div className="w-full max-w-md h-[100dvh] bg-black relative overflow-hidden sm:border-x sm:border-zinc-900 flex flex-col shadow-2xl">
          
          {/* TOAST NOTIFICATION */}
          {toast.show && (
            <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 px-3.5 py-2 rounded-full shadow-2xl border border-zinc-800 bg-[#1C1C1E]/95 backdrop-blur-xl animate-in slide-in-from-top-4 fade-in duration-300 whitespace-nowrap">
              {toast.type === 'error' ? (
                <AlertCircle size={14} className="text-red-500" />
              ) : (
                <Check size={14} className="text-green-500" />
              )}
              <span className="text-[11px] font-bold text-zinc-200">{toast.message}</span>
            </div>
          )}
  
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'camera' && renderCameraView()}
            {activeTab === 'calendar' && renderCalendarView()}
            {activeTab === 'asset' && renderAssetView()}
            {activeTab === 'budget' && renderBudgetView()}
            {activeTab === 'stats' && renderStatsView()}
          </div>
  
          {/* BOTTOM NAV BAR */}
          {!isDrafting && !draftImage && !selectedTxnDetail && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-zinc-800/50 px-2 xs:px-4 sm:px-6 py-2.5 sm:py-3 flex justify-between items-end pb-6 sm:pb-4 z-20">
              <button onClick={() => setActiveTab('calendar')} className={`flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0 transition-all duration-300 ${activeTab === 'calendar' ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}><CalendarDays size={20} className="sm:w-6 sm:h-6" strokeWidth={activeTab === 'calendar' ? 2.5 : 2}/><span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">Nhật ký</span></button>
              <button onClick={() => setActiveTab('asset')} className={`flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0 transition-all duration-300 ${activeTab === 'asset' ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}><Wallet size={20} className="sm:w-6 sm:h-6" strokeWidth={activeTab === 'asset' ? 2.5 : 2}/><span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">Tài sản</span></button>
              <button 
                  onClick={() => setActiveTab('camera')} 
                  className="relative -mt-8 sm:-mt-10 mx-1 sm:mx-2 shrink-0 group"
              >
                  <div className={`absolute inset-0 bg-yellow-400 rounded-full blur-xl transition-opacity duration-500 ${activeTab === 'camera' ? 'opacity-40' : 'opacity-0'}`}></div>
                  <div className="relative p-3 sm:p-4 rounded-full border-4 border-black bg-yellow-400 text-black scale-105 sm:scale-110 shadow-lg flex items-center justify-center">
                      {activeTab === 'camera' ? <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full border border-yellow-600 shadow-inner"></div> : <Camera size={22} className="sm:w-6 sm:h-6" />}
                  </div>
              </button>
              <button onClick={() => setActiveTab('budget')} className={`flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0 transition-all duration-300 ${activeTab === 'budget' ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}><Target size={20} className="sm:w-6 sm:h-6" strokeWidth={activeTab === 'budget' ? 2.5 : 2}/><span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">Ngân sách</span></button>
              <button onClick={() => setActiveTab('stats')} className={`flex-1 flex flex-col items-center gap-1 sm:gap-1.5 min-w-0 transition-all duration-300 ${activeTab === 'stats' ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}><PieChart size={20} className="sm:w-6 sm:h-6" strokeWidth={activeTab === 'stats' ? 2.5 : 2}/><span className="text-[9px] sm:text-[10px] font-bold truncate w-full text-center">Báo cáo</span></button>
            </div>
          )}
  
          {/* MODAL CHI TIẾT GIAO DỊCH LỊCH TRÌNH */}
          {renderTransactionDetailModal()}
  
          {/* CÁC MODALS TẠO MỚI / CẬP NHẬT */}
          {isNewInvestmentModalOpen && (
            <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 sm:p-6 animate-in fade-in">
              <div className="bg-zinc-900 w-full rounded-3xl sm:rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden p-5 sm:p-6">
                <h3 className="font-black text-base sm:text-lg text-white mb-4 sm:mb-5">Thêm Danh mục Đầu tư</h3>
                <input type="text" placeholder="Tên danh mục..." value={newInvestmentName} onChange={e => setNewInvestmentName(e.target.value)} className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 font-bold border border-zinc-800 mb-4 sm:mb-5 text-[16px]" />
                <button onClick={handleSaveNewInvestment} className="w-full bg-purple-600 text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] shadow-lg mb-2 text-sm sm:text-base">Thêm</button>
                <button onClick={() => setIsNewInvestmentModalOpen(false)} className="w-full py-3 sm:py-4 text-zinc-500 font-bold text-sm sm:text-base">Hủy</button>
              </div>
            </div>
          )}
  
          {isNewBudgetModalOpen && (() => {
            const isAutoCalculated = (parseFloat(newBudgetForm.unitValue) || 0) > 0 && (parseInt(newBudgetForm.totalFrequency) || 0) > 0;
            return (
              <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 sm:p-6 animate-in fade-in">
                <div className="bg-zinc-950 w-full rounded-3xl sm:rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden p-5 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6"><h3 className="font-black text-base sm:text-lg text-white">Khởi tạo Ngân sách</h3><button onClick={() => setIsNewBudgetModalOpen(false)} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full"><X size={16}/></button></div>
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      <div><label className="text-[10px] sm:text-[11px] uppercase text-zinc-400 font-bold mb-1 sm:mb-1.5 block">Tên Danh mục *</label><input type="text" placeholder="VD: Shopping..." value={newBudgetForm.name} onChange={e => handleNewBudgetChange('name', e.target.value)} className="w-full bg-black text-white rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold text-[16px]" /></div>
                      <div className="flex gap-2 sm:gap-3">
                        <div className="flex-1"><label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 font-bold mb-1 sm:mb-1.5 block">Giá 1 lần</label><input type="number" placeholder="50000" value={newBudgetForm.unitValue} onChange={e => handleNewBudgetChange('unitValue', e.target.value)} className="w-full bg-black text-white rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold text-[16px]" /></div>
                        <div className="flex-1"><label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 font-bold mb-1 sm:mb-1.5 block">Tần suất</label><input type="number" placeholder="30" value={newBudgetForm.totalFrequency} onChange={e => handleNewBudgetChange('totalFrequency', e.target.value)} className="w-full bg-black text-white rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold text-[16px]" /></div>
                      </div>
                      <div>
                          <label className="text-[10px] sm:text-[11px] uppercase text-red-400 font-bold mb-1 sm:mb-1.5 block">Tổng Ngân sách *</label>
                          <input type="number" placeholder="Tổng..." value={newBudgetForm.totalValue} onChange={e => !isAutoCalculated && handleNewBudgetChange('totalValue', e.target.value)} readOnly={isAutoCalculated} className={`w-full text-red-400 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-5 font-black text-xl sm:text-2xl border border-zinc-800 text-[16px] transition-colors ${isAutoCalculated ? 'bg-zinc-900/50 opacity-70 cursor-not-allowed' : 'bg-black'}`} />
                          {isAutoCalculated && <span className="text-[9px] sm:text-[10px] text-zinc-500 mt-1 block font-medium flex items-center gap-1"><Zap size={10} className="text-yellow-500"/> Đã tự động tính toán</span>}
                      </div>
                  </div>
                  <button onClick={handleSaveNewBudget} className="w-full bg-yellow-500 text-black font-black py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform text-sm sm:text-base">Lưu Cài Đặt</button>
                </div>
              </div>
            );
          })()}
  
          {isBudgetModalOpen && (() => {
             const isAutoCalculated = (parseFloat(budgetForm.unitValue) || 0) > 0 && (parseInt(budgetForm.totalFrequency) || 0) > 0;
             return (
              <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 sm:p-6 animate-in fade-in">
                <div className="bg-zinc-950 w-full rounded-3xl sm:rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden p-5 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6"><h3 className="font-black text-base sm:text-lg text-white">Sửa mức chi tiêu</h3><button onClick={() => setIsBudgetModalOpen(false)} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full"><X size={16}/></button></div>
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      <div className="flex gap-2 sm:gap-3">
                        <div className="flex-1"><label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 font-bold mb-1 sm:mb-1.5 block">Giá 1 lần</label><input type="number" placeholder="50000" value={budgetForm.unitValue} onChange={e => handleBudgetChange('unitValue', e.target.value)} className="w-full bg-black text-white rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold text-[16px]" /></div>
                        <div className="flex-1"><label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 font-bold mb-1 sm:mb-1.5 block">Tần suất</label><input type="number" placeholder="30" value={budgetForm.totalFrequency} onChange={e => handleBudgetChange('totalFrequency', e.target.value)} className="w-full bg-black text-white rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold text-[16px]" /></div>
                      </div>
                      <div>
                          <label className="text-[10px] sm:text-[11px] uppercase text-red-400 font-bold mb-1 sm:mb-1.5 block">Tổng Ngân sách *</label>
                          <input type="number" placeholder="Tổng..." value={budgetForm.totalValue} onChange={e => !isAutoCalculated && handleBudgetChange('totalValue', e.target.value)} readOnly={isAutoCalculated} className={`w-full text-red-400 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-5 font-black text-xl sm:text-2xl border border-zinc-800 text-[16px] transition-colors ${isAutoCalculated ? 'bg-zinc-900/50 opacity-70 cursor-not-allowed' : 'bg-black'}`} />
                          {isAutoCalculated && <span className="text-[9px] sm:text-[10px] text-zinc-500 mt-1 block font-medium flex items-center gap-1"><Zap size={10} className="text-yellow-500"/> Đã tự động tính toán</span>}
                      </div>
                  </div>
                  <button onClick={handleEditBudget} className="w-full bg-zinc-100 text-black font-black py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] shadow-lg active:scale-95 transition-transform text-sm sm:text-base">Cập Nhật</button>
                </div>
              </div>
             );
          })()}
  
          {isTransferModalOpen && (
            <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 sm:p-6 animate-in fade-in">
              <div className="bg-zinc-900 w-full rounded-3xl sm:rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-zinc-800 flex justify-between items-center"><h3 className="font-black text-base sm:text-lg text-white">Chuyển tiền nội bộ</h3><button onClick={() => setIsTransferModalOpen(false)} className="p-1.5 sm:p-2 bg-zinc-800 rounded-full"><X size={16}/></button></div>
                <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                  <select value={transferForm.fromId} onChange={e => setTransferForm({...transferForm, fromId: e.target.value})} className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 border border-zinc-800 font-bold text-[16px]"><option value="">Rút từ...</option>{accounts.map(a => (<option key={a.id} value={a.id}>{a.name} ({formatMoney(currentBalances[a.id])})</option>))}</select>
                  <select value={transferForm.toId} onChange={e => setTransferForm({...transferForm, toId: e.target.value})} className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 border border-zinc-800 font-bold text-[16px]"><option value="">Nạp vào...</option>{accounts.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}</select>
                  <input type="number" placeholder="Số tiền..." value={transferForm.amount} onChange={e => setTransferForm({...transferForm, amount: e.target.value})} className="w-full bg-zinc-950 text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 font-black text-2xl sm:text-3xl border border-zinc-800 text-[16px]" />
                  <button onClick={handleManualTransfer} className="w-full bg-blue-600 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-[2rem] text-sm sm:text-base">Xác nhận chuyển</button>
                </div>
              </div>
            </div>
          )}
  
          {isAssetModalOpen && (
            <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 animate-in fade-in">
               <div className="bg-zinc-950 w-full rounded-3xl sm:rounded-[2rem] border border-zinc-700 p-5 sm:p-6 shadow-2xl">
                  <h3 className="font-black text-base sm:text-lg text-white mb-4 sm:mb-5">Cập nhật Tài sản</h3>
                  {assetForm.isGold ? (
                    <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                       <div className="flex gap-2 sm:gap-3">
                         <div className="flex-[2]"><label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 mb-1 block font-bold">Số lượng đang trữ</label><input type="number" placeholder="VD: 2.5" value={assetForm.quantity} onChange={e => setAssetForm({...assetForm, quantity: e.target.value})} className="w-full bg-black text-yellow-400 rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-black text-[16px]" /></div>
                         <div className="flex-[1]"><label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 mb-1 block font-bold">Đơn vị</label><select value={assetForm.unit} onChange={e => setAssetForm({...assetForm, unit: e.target.value})} className="w-full bg-black text-white rounded-lg sm:rounded-xl px-2 sm:px-4 py-3 sm:py-3.5 border border-zinc-800 font-bold appearance-none text-[16px]"><option value="chỉ">Chỉ</option><option value="cây">Cây</option></select></div>
                       </div>
                       <div>
                         <div className="flex justify-between items-center mb-1"><label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 block font-bold">Đơn giá (1 Chỉ) - VND</label><button onClick={() => fetchLiveGoldPrice(true)} className="text-[10px] sm:text-[11px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 sm:px-2 py-1 rounded flex items-center gap-1">{isFetchingGold ? <RefreshCw size={10} className="animate-spin"/> : 'Lấy giá SJC'}</button></div>
                         <input type="number" value={assetForm.customGoldPrice} onChange={e => setAssetForm({...assetForm, customGoldPrice: e.target.value})} className="w-full bg-black text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-800 font-bold text-[16px]" />
                       </div>
                    </div>
                  ) : (
                    <div className="mb-5 sm:mb-6"><label className="text-[10px] sm:text-[11px] uppercase text-zinc-500 mb-1.5 sm:mb-2 block font-bold">Tổng giá trị (VND)</label><input type="number" placeholder="Nhập..." value={assetForm.currentValue} onChange={e => setAssetForm({...assetForm, currentValue: e.target.value})} className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 border border-zinc-800 font-bold text-[16px]" /></div>
                  )}
                  <button onClick={handleSaveAsset} className="w-full py-3.5 sm:py-4 bg-purple-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base">Lưu Trạng Thái</button>
                  <button onClick={() => setIsAssetModalOpen(false)} className="w-full py-3 sm:py-4 bg-transparent text-zinc-500 mt-1 sm:mt-2 font-bold hover:text-white text-sm sm:text-base">Hủy</button>
               </div>
            </div>
          )}
  
          {isWithdrawModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center items-center p-4 animate-in fade-in">
               <div className="bg-zinc-950 w-full rounded-3xl sm:rounded-[2rem] border border-zinc-700 p-5 sm:p-6">
                  <h3 className="font-black text-base sm:text-lg text-white mb-4 sm:mb-5">Rút vốn đầu tư</h3>
                  <input type="number" placeholder="Số tiền muốn rút về" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} className="w-full bg-black text-white rounded-xl sm:rounded-2xl px-4 sm:px-5 py-4 sm:py-5 border border-zinc-800 font-bold text-[16px] mb-3 sm:mb-4" />
                  <select value={withdrawForm.accountId} onChange={e => setWithdrawForm({...withdrawForm, accountId: e.target.value})} className="w-full bg-black text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-3 sm:py-4 mb-3 sm:mb-4 border border-zinc-800 text-[16px]">{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
                  <button onClick={handleWithdrawInvestment} className="w-full py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base">Xác nhận Rút Về</button>
                  <button onClick={() => setIsWithdrawModalOpen(false)} className="w-full py-3 sm:py-4 bg-transparent text-zinc-400 mt-1 sm:mt-2 font-bold text-sm sm:text-base">Hủy</button>
               </div>
            </div>
          )}
  
          {isTagModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center items-end animate-in fade-in">
              <div className="bg-zinc-950 w-full h-[85%] rounded-t-3xl sm:rounded-t-[2rem] flex flex-col shadow-2xl border-t border-zinc-800">
                <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center"><h3 className="font-black text-base sm:text-lg text-white">Quản lý Tags</h3><button onClick={() => setIsTagModalOpen(false)} className="p-1.5 sm:p-2 bg-zinc-900 rounded-full"><X size={18}/></button></div>
                <div className="p-4 sm:p-5 overflow-y-auto flex-1 pb-20">
                  <div className="flex gap-2 mb-5 sm:mb-6">
                    <input type="text" placeholder="Tên thẻ mới..." value={newTagName} onChange={e => setNewTagName(e.target.value)} className="flex-1 bg-black text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-800 text-[16px]" />
                    <select value={newTagType} onChange={e => setNewTagType(e.target.value)} className="w-24 sm:w-28 bg-black text-white rounded-lg sm:rounded-xl px-2 py-2.5 sm:py-3 border border-zinc-800 text-[16px]"><option value="expense">Chi tiêu</option><option value="income">Thu</option><option value="investment">Đầu tư</option></select>
                    <button onClick={() => {
                        if(!newTagName.trim()) return showToastMsg("Nhập tên", "error");
                        const color = newTagType === 'expense' ? 'bg-red-500' : newTagType === 'income' ? 'bg-green-500' : 'bg-purple-500';
                        setTags([...tags, { id: Date.now().toString(), name: newTagName, type: newTagType, color }]);
                        setNewTagName(''); showToastMsg("Đã thêm");
                    }} className="bg-yellow-400 px-3 sm:px-4 rounded-lg sm:rounded-xl text-black font-black"><Plus size={18} className="sm:w-5 sm:h-5"/></button>
                  </div>
                  <div className="space-y-2.5 sm:space-y-3">
                    {tags.map(tag => (
                      <div key={tag.id} className="flex justify-between items-center bg-black p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-800"><span className={`px-2.5 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold text-white max-w-[70%] truncate ${tag.color}`}>{tag.name}</span><button onClick={() => requestDeleteTag(tag.id, tag.name)} className="text-zinc-500 hover:text-red-500 p-1"><Trash2 size={16}/></button></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
  
          {confirmDialog.isOpen && (
            <div className="absolute inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 sm:p-8 animate-in fade-in">
              <div className="bg-zinc-900 w-full max-w-[280px] sm:max-w-[320px] rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border border-zinc-800 text-center shadow-2xl">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-red-500"><AlertCircle size={28} className="sm:w-8 sm:h-8"/></div>
                <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-white">{confirmDialog.title}</h3>
                <p className="text-zinc-500 text-[12px] sm:text-sm mb-6 sm:mb-8">{confirmDialog.message}</p>
                <div className="flex gap-3 sm:gap-4">
                  <button onClick={() => setConfirmDialog({ isOpen: false })} className="flex-1 py-3 sm:py-4 bg-zinc-800 rounded-xl sm:rounded-2xl font-black text-white text-sm sm:text-base">Hủy</button>
                  <button onClick={confirmDialog.action} className="flex-1 py-3 sm:py-4 bg-red-600 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base">Xác nhận</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}

export default App
