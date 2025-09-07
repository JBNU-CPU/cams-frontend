export default function ConfirmDialog({
    open,
    message,              // ✅ message prop 받기
    onConfirm,
    onCancel,
    confirmText = '확인',
    cancelText = '취소',
}) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white px-6 py-4 rounded-lg shadow-xl text-center space-y-4 max-w-sm w-full">
                <p className="text-gray-800 font-medium">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
