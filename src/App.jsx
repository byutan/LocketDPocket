import './App.css';

import { useState } from 'react';

import { getCurrentMonthKey } from './utils/utils';

import { Toast } from './component/notifications/Toast';
import { NavigationBar } from './component/navigations/NavigationBar';
import { ConfirmDialog } from './component/notifications/ConfirmDialog';

import { TransferModal } from './component/modals/TransferModal';
import { TagModal } from './component/modals/TagModal';
import { WithdrawModal } from './component/modals/WithdrawModal';
import { AssetModal } from './component/modals/AssetModal';
import { BudgetModal } from './component/modals/BudgetModal';
import { NewBudgetModal } from './component/modals/NewBudgetModal';
import { NewInvestmentModal } from './component/modals/NewInvestmentModal';

import { StatsView } from './component/views/StatView';
import { BudgetView } from './component/views/BudgetView';
import { AssetView } from './component/views/AssetView';
import { CameraView } from './component/views/CameraView';
import { CalendarView } from './component/views/CaledarView';
import { TransactionDetailModal } from './component/views/TransactionDetailView';
import { useFinanceApp } from './hooks/useFinance'; 

function App() {
  const {
    // 1. STATE ĐIỀU HƯỚNG & NGÀY THÁNG
    activeTab, setActiveTab, viewMonth, setViewMonth, selectedDate, setSelectedDate,

    // 2. STATE BÁO CÁO (STATS)
    statsMode, setStatsMode, statsRefDate, setStatsRefDate, statsCustomRange, setStatsCustomRange,

    // 3. STATE UI & TÙY CHỈNH
    expandedTags, hiddenBalances, isTotalHidden, setIsTotalHidden, selectedTxnDetail, setSelectedTxnDetail,

    // 4. CORE DATA (DỮ LIỆU LÕI)
    accounts, tags, transactions, budgets, assets, currentBalances, 

    // 5. STATE FORM GIAO DỊCH & CAMERA
    isDrafting, setIsDrafting, draftImage, setDraftImage, draftType, setDraftType, 
    draftAmount, setDraftAmount, draftCaption, setDraftCaption, draftTags, setDraftTags, 
    draftAccount, setDraftAccount, isCameraActive, setIsCameraActive, cameraError, 

    // 6. THÔNG BÁO & DỮ LIỆU ONLINE (VÀNG)
    toast, confirmDialog, setConfirmDialog, isFetchingGold,

    // 7. STATE ĐÓNG/MỞ CÁC MODAL VÀ DATA CỦA FORM TRONG MODAL
    isTransferModalOpen, setIsTransferModalOpen, isAccountFormVisible, setIsAccountFormVisible, 
    accountForm, setAccountForm, isAssetModalOpen, setIsAssetModalOpen, 
    selectedAssetData,
    isWithdrawModalOpen, setIsWithdrawModalOpen, isTagModalOpen, setIsTagModalOpen,
    isBudgetModalOpen, setIsBudgetModalOpen, isNewBudgetModalOpen, setIsNewBudgetModalOpen,
    isNewInvestmentModalOpen, setIsNewInvestmentModalOpen,

    // 8. REFS
    fileInputRef, videoRef, canvasRef,

    // 9. FUNCTIONS (Đã loại bỏ showToastMsg, startCamera, stopCamera, swapTags vì không xài trực tiếp ở App.jsx)
    formatMoney, toggleExpand, toggleHideBalance, fetchLiveGoldPrice,
    handleGalleryUpload, handleManualEntry, capturePhoto, submitTransaction, 
    handleManualTransfer, executeDeleteTransaction, requestDeleteTag, handleAddTag, 
    handleMoveTag, openAssetModal, handleSaveAsset, handleWithdrawInvestment,
    saveAccount, deleteAccount, handleEditBudget, handleSaveNewBudget, handleSaveNewInvestment
  } = useFinanceApp();

  // ==========================================
  // BỔ SUNG CÁC STATE/BIẾN CÒN THIẾU TỪ UI CŨ
  // ==========================================
  const [selectedWithdrawTagId, setSelectedWithdrawTagId] = useState(null);
  const [selectedBudgetData, setSelectedBudgetData] = useState(null);
  const currentMonthKey = getCurrentMonthKey(); 

  // --- RENDERING TỔNG THỂ ---
  return (
    <div className="fixed inset-0 flex justify-center bg-zinc-950 font-sans selection:bg-yellow-400 overscroll-none">
      <div className="w-full max-w-md h-[100dvh] bg-black relative overflow-hidden sm:border-x sm:border-zinc-900 flex flex-col shadow-2xl">

        <Toast toast={toast} />

        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'camera' && 
          <CameraView
            isDrafting={isDrafting}
            setIsDrafting={setIsDrafting}
            draftType={draftType}
            setDraftType={setDraftType}
            draftTags={draftTags}
            setDraftTags={setDraftTags}
            draftImage={draftImage}
            setDraftImage={setDraftImage}
            draftAmount={draftAmount}
            setDraftAmount={setDraftAmount}
            draftCaption={draftCaption}
            setDraftCaption={setDraftCaption}
            accounts={accounts}
            draftAccount={draftAccount}
            setDraftAccount={setDraftAccount}
            currentBalances={currentBalances}
            formatMoney={formatMoney}
            tags={tags}
            setIsTagModalOpen={setIsTagModalOpen}
            submitTransaction={submitTransaction}
            isCameraActive={isCameraActive}
            setIsCameraActive={setIsCameraActive}
            cameraError={cameraError}
            videoRef={videoRef}
            canvasRef={canvasRef}
            capturePhoto={capturePhoto}
            handleGalleryUpload={handleGalleryUpload}
            fileInputRef={fileInputRef}
            handleManualEntry={handleManualEntry}
          />}

          {activeTab === 'calendar' &&
          <CalendarView
            viewMonth={viewMonth}
            setViewMonth={setViewMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            transactions={transactions}
            setSelectedTxnDetail={setSelectedTxnDetail}
            formatMoney={formatMoney}
          />}

          {activeTab === 'asset' && 
          <AssetView 
            tags={tags}
            accounts={accounts}
            currentBalances={currentBalances}
            assets={assets}
            isTotalHidden={isTotalHidden}
            setIsTotalHidden={setIsTotalHidden}
            formatMoney={formatMoney}
            setIsTransferModalOpen={setIsTransferModalOpen}
            isAccountFormVisible={isAccountFormVisible}
            setIsAccountFormVisible={setIsAccountFormVisible}
            accountForm={accountForm}
            setAccountForm={setAccountForm}
            saveAccount={saveAccount}
            deleteAccount={deleteAccount}
            hiddenBalances={hiddenBalances}
            toggleHideBalance={toggleHideBalance}
            setIsNewInvestmentModalOpen={setIsNewInvestmentModalOpen}
            expandedTags={expandedTags}
            toggleExpand={toggleExpand}
            openAssetModal={openAssetModal}
            setSelectedWithdrawTagId={setSelectedWithdrawTagId}
            setIsWithdrawModalOpen={setIsWithdrawModalOpen}
            requestDeleteTag={requestDeleteTag}
            handleMoveTag={handleMoveTag}
          />}

          {activeTab === 'budget' && 
          <BudgetView 
            tags={tags}
            budgets={budgets}
            transactions={transactions}
            currentMonthKey={currentMonthKey}
            expandedTags={expandedTags}
            toggleExpand={toggleExpand}
            setIsNewBudgetModalOpen={setIsNewBudgetModalOpen}
            setSelectedBudgetData={setSelectedBudgetData}
            setIsBudgetModalOpen={setIsBudgetModalOpen}
            requestDeleteTag={requestDeleteTag}
            handleMoveTag={handleMoveTag}
            formatMoney={formatMoney}
          />}

          {activeTab === 'stats' && 
          <StatsView 
            statsMode={statsMode}
            setStatsMode={setStatsMode}
            statsRefDate={statsRefDate}
            setStatsRefDate={setStatsRefDate}
            statsCustomRange={statsCustomRange}
            setStatsCustomRange={setStatsCustomRange}
            transactions={transactions}
            tags={tags}
            formatMoney={formatMoney}
          />}
        </div>

        <NavigationBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDrafting={isDrafting}
          draftImage={draftImage}
          selectedTxnDetail={selectedTxnDetail}
        />

        {/* MODAL CHI TIẾT GIAO DỊCH LỊCH TRÌNH */}
        <TransactionDetailModal
          selectedTxnDetail={selectedTxnDetail}
          setSelectedTxnDetail={setSelectedTxnDetail}
          accounts={accounts}
          tags={tags}
          formatMoney={formatMoney}
          setConfirmDialog={setConfirmDialog}
          executeDeleteTransaction={executeDeleteTransaction}
        />

        {/* CÁC MODALS TẠO MỚI / CẬP NHẬT */}
        {isNewInvestmentModalOpen && (
        <NewInvestmentModal 
          isOpen={isNewInvestmentModalOpen}
          onClose={() => setIsNewInvestmentModalOpen(false)}
          handleSaveNewInvestment={handleSaveNewInvestment}
        />
        )}

        {isNewBudgetModalOpen && (
        <NewBudgetModal 
          isOpen={isNewBudgetModalOpen}
          onClose={() => setIsNewBudgetModalOpen(false)}
          handleSaveNewBudget={handleSaveNewBudget}
        />
        )}

        {isBudgetModalOpen && (
        <BudgetModal 
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          initialData={selectedBudgetData} 
          handleEditBudget={handleEditBudget}
        />
        )}

        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          accounts={accounts}
          currentBalances={currentBalances}
          handleManualTransfer={handleManualTransfer}
        />

        {isAssetModalOpen && (
          <AssetModal 
            isOpen={isAssetModalOpen}
            onClose={() => setIsAssetModalOpen(false)}
            initialData={selectedAssetData}
            handleSaveAsset={handleSaveAsset}
            fetchLiveGoldPrice={fetchLiveGoldPrice}
            isFetchingGold={isFetchingGold}
        />
        )}

        <WithdrawModal 
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          accounts={accounts}
          handleWithdrawInvestment={handleWithdrawInvestment}
          tagId={selectedWithdrawTagId} 
        />

        <TagModal 
          isOpen={isTagModalOpen} 
          onClose={() => setIsTagModalOpen(false)}  
          tags={tags} 
          handleAddTag={handleAddTag} 
          requestDeleteTag={requestDeleteTag}  
        />

        <ConfirmDialog
          confirmDialog={confirmDialog}
          setConfirmDialog={setConfirmDialog}
        />
      </div>
    </div>
  )
}

export default App;