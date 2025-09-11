import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import { useDispatch } from "react-redux";
import Alert from "./Alert";
import ConfirmDialog from "./ConfirmDialog";
import { useState } from "react";

export default function Header({
  title,
  unreadCount,
  isLoggedIn,
  onNotificationClick,
  children,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [alertMessage, setAlertMessage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    setShowConfirm(true); // ✅ confirm 모달 열기
  };

  const confirmLogout = async () => {
    setShowConfirm(false);
    try {
      await dispatch(logout()).unwrap();
      setAlertMessage("로그아웃되었습니다."); // ✅ Alert 띄우기
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      setAlertMessage("로그아웃 중 오류가 발생했습니다.");
      setTimeout(() => {
        navigate("/login");
      }, 500);
    }
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
      {/* ✅ Alert */}
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {/* ✅ ConfirmDialog */}
      <ConfirmDialog
        open={showConfirm}
        message="로그아웃 하시겠습니까?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <div className="px-4 py-4">
        <div className="relative flex items-center justify-between h-10">
          <div className="w-10"></div>
          <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-gray-900 whitespace-nowrap">
            {title}
          </h1>
          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                {/* <button
                                    onClick={onNotificationClick}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <div className="relative">
                                        <i className="ri-notification-3-line text-gray-600"></i>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button> */}
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                >
                  <i className="ri-logout-box-line text-red-600"></i>
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
              >
                <i className="ri-login-box-line text-blue-600"></i>
              </button>
            )}
          </div>
        </div>
      </div>
      {children && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}
