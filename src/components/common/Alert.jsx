import { useEffect } from "react";

export default function Alert({ message, onClose }) {
    // 3초 뒤 자동 닫기
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
                <i className="ri-check-line text-xl"></i>
                <span>{message}</span>
                <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
                    ✕
                </button>
            </div>
        </div>
    );
}
