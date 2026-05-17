import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 transition-opacity">
            <div
                className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
