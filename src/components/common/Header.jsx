import { Link, useNavigate } from 'react-router-dom';

export default function Header({ title, unreadCount, isLoggedIn, onNotificationClick, children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            // 실제 앱에서는 토큰 삭제 등 로그아웃 처리
            alert('로그아웃되었습니다.');
            navigate('/login'); // 로그아웃 후 로그인 페이지로 이동
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="px-4 py-4">
                {/* 제목을 중앙에 배치하기 위해 컨테이너를 relative로 설정 */}
                <div className="relative flex items-center justify-between h-10">

                    {/* 왼쪽 영역: 뒤로가기 버튼 등이 위치할 수 있는 공간 확보 */}
                    <div className="w-10"></div>

                    {/* 중앙 제목: absolute 포지셔닝으로 완벽한 중앙 정렬 */}
                    <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-gray-900 whitespace-nowrap">
                        {title}
                    </h1>

                    {/* 오른쪽 버튼 영역 */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onNotificationClick}
                            className="relative w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <i className="ri-notification-line text-gray-600"></i>
                            {isLoggedIn && unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}
                        </button>
                        {/* {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                            >
                                <i className="ri-logout-box-line text-red-600"></i>
                            </button>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                            >
                                <i className="ri-login-box-line text-blue-600"></i>
                            </button>
                        )} */}
                    </div>
                </div>
            </div>
            {children && (
                <div className="px-4 pb-3">
                    {children}
                </div>
            )}
        </div>
    );
}

