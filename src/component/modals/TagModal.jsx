import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
export const TagModal = ({
    isOpen,
    onClose,
    tags,
    handleAddTag,       
    requestDeleteTag
}) => {
    const [newTagName, setNewTagName] = useState('');
    const [newTagType, setNewTagType] = useState('expense');
    if (!isOpen) 
        return null;
    const onAddClick = () => {
        const isSuccess = handleAddTag(newTagName, newTagType);
        if (isSuccess) {
            setNewTagName('');
        }
    };
    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center items-end animate-in fade-in">
            <div className="bg-zinc-950 w-full h-[85%] rounded-t-3xl sm:rounded-t-[2rem] flex flex-col shadow-2xl border-t border-zinc-800">
                <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-black text-base sm:text-lg text-white">Quản lý Tags</h3>
                    {/* Đổi thành onClose */}
                    <button onClick={onClose} className="p-1.5 sm:p-2 bg-zinc-900 rounded-full hover:bg-zinc-800">
                        <X size={18}/>
                    </button>
                </div>
                
                <div className="p-4 sm:p-5 overflow-y-auto flex-1 pb-20">
                    <div className="flex gap-2 mb-5 sm:mb-6">
                        <input 
                            type="text" 
                            placeholder="Tên thẻ mới..." 
                            value={newTagName} 
                            onChange={e => setNewTagName(e.target.value)} 
                            className="flex-1 bg-black text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-800 text-[16px]" 
                        />
                        <select 
                            value={newTagType} 
                            onChange={e => setNewTagType(e.target.value)} 
                            className="w-24 sm:w-28 bg-black text-white rounded-lg sm:rounded-xl px-2 py-2.5 sm:py-3 border border-zinc-800 text-[16px]"
                        >
                            <option value="expense">Chi tiêu</option>
                            <option value="income">Thu</option>
                            <option value="investment">Đầu tư</option>
                        </select>
                        {/* Gọi hàm onAddClick đã xử lý ở trên */}
                        <button onClick={onAddClick} className="bg-yellow-400 px-3 sm:px-4 rounded-lg sm:rounded-xl text-black font-black hover:bg-yellow-500 transition-colors">
                            <Plus size={18} className="sm:w-5 sm:h-5"/>
                        </button>
                    </div>
                    
                    <div className="space-y-2.5 sm:space-y-3">
                        {tags.map(tag => (
                            <div key={tag.id} className="flex justify-between items-center bg-black p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-800">
                                <span className={`px-2.5 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold text-white max-w-[70%] truncate ${tag.color}`}>
                                    {tag.name}
                                </span>
                                <button onClick={() => requestDeleteTag(tag.id, tag.name)} className="text-zinc-500 hover:text-red-500 p-1 transition-colors">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}