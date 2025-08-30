import { Link, useLocation } from 'react-router-dom';

export default function TabBar() {
  const location = useLocation();

  const tabs = [
    {
      path: '/attendance',
      label: '출석',
      icon: 'ri-calendar-check-line',
      activeIcon: 'ri-calendar-check-fill'
    },
    {
      path: '/',
      label: '홈',
      icon: 'ri-home-line',
      activeIcon: 'ri-home-fill'
    },
    {
      path: '/my',
      label: '마이페이지',
      icon: 'ri-user-line',
      activeIcon: 'ri-user-fill'
    }
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 z-50">
      <div className="grid grid-cols-3 h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <i className={`${isActive ? tab.activeIcon : tab.icon} text-xl`}></i>
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
