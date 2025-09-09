import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function TabBar() {
  const location = useLocation();
  const isModalOpen = useSelector(state => state.ui.isModalOpen);

  const tabs = [
    { path: '/attendance', label: '출석', icon: 'ri-calendar-check-line', activeIcon: 'ri-calendar-check-fill' },
    { path: '/home', label: '홈', icon: 'ri-home-line', activeIcon: 'ri-home-fill' },
    { path: '/my', label: '마이페이지', icon: 'ri-user-line', activeIcon: 'ri-user-fill' }
  ];

  return (
    // 뷰포트 하단 고정 + 중앙정렬 + 최대폭 500px
    <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] 
                    bg-white border-t border-gray-100 z-40 transition-all duration-300 
                    ${isModalOpen ? 'filter blur-sm opacity-50' : ''}`}>
      <div className="grid grid-cols-3 h-16 px-6 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className={`${isActive ? tab.activeIcon : tab.icon} text-xl`} />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
