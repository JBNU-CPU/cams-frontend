import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabBar from '../../components/feature/TabBar';
import ActivityCard from './components/ActivityCard';
import SearchFilter from './components/SearchFilter';
import Header from '../../components/common/Header';
import { mockActivities } from '../../mocks/activities';
// 1. 커스텀 훅과 알림 UI 헬퍼 함수를 import 합니다.
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationIcon, getNotificationColor } from '../../api/NotificationData'
export default function Home() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState({
    days: [],
    recruiting: null,
    leader: ''
  });

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  // 2. useNotifications 훅을 호출하여 알림 관련 모든 것을 가져옵니다.
  const {
    notificationList,
    unreadCount,
    dismissNotification,
    dismissAllNotifications
  } = useNotifications();

  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const categories = ['전체', '세션', '스터디', '프로젝트', '소모임', '행사'];

  const filteredActivities = useMemo(() => {
    return mockActivities.filter(activity => {
      if (activeCategory !== '전체' && activity.category !== activeCategory) {
        return false;
      }
      if (searchKeyword && !activity.title.toLowerCase().includes(searchKeyword.toLowerCase())) {
        return false;
      }
      if (filters.days.length > 0) {
        const hasMatchingDay = filters.days.some(day => activity.schedule.includes(day));
        if (!hasMatchingDay) return false;
      }
      if (filters.recruiting !== null) {
        const isRecruiting = activity.currentMembers < activity.maxMembers;
        if (filters.recruiting !== isRecruiting) return false;
      }
      if (filters.leader && !activity.leader.toLowerCase().includes(filters.leader.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [activeCategory, searchKeyword, filters]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      <Header
        title="전체 활동"
        unreadCount={unreadCount}
        isLoggedIn={isLoggedIn}
        onNotificationClick={() => {
          if (!isLoggedIn) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
          }
          setShowNotificationModal(true);
        }}
      >
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`w-24 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </Header>

      <SearchFilter
        onSearch={setSearchKeyword}
        onFilter={setFilters}
      />

      <div className="px-4 py-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-inbox-line text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">조건에 맞는 활동이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      <Link
        to="/create-activity"
        className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-all z-30"
      >
        <i className="ri-add-line text-white text-xl"></i>
      </Link>

      {/* 3. MyPage와 동일한 알림 모달 JSX를 추가합니다. */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">알림</h3>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notificationList.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-notification-off-line text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">새로운 알림이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificationList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{notification.title}</h4>
                            {!notification.isRead && (<div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="알림 삭제"
                        >
                          <i className="ri-close-line text-lg"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {notificationList.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => {
                    dismissAllNotifications();
                    setShowNotificationModal(false);
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  모든 알림 지우기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}

