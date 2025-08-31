import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabBar from '../../components/feature/TabBar';
import ActivityCard from './components/ActivityCard';
import SearchFilter from './components/SearchFilter';
import Header from '../../components/common/Header';
import { mockActivities } from '../../mocks/activities';

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

  // 1. MyPage에서 알림 관련 상태와 데이터를 가져옵니다.
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const notifications = [
    { id: '1', type: 'application', title: 'React 스터디 그룹', message: '새로운 신청자가 있습니다.', time: '5분 전', isRead: false },
    { id: '2', type: 'attendance', title: 'AI 프로젝트 팀', message: '출석 시간이 시작되었습니다.', time: '1시간 전', isRead: false },
    { id: '3', type: 'approval', title: '독서 모임', message: '활동 참여가 승인되었습니다.', time: '2시간 전', isRead: true },
    { id: '4', type: 'reminder', title: '창업 아이디어 경진대회', message: '내일 활동이 예정되어 있습니다.', time: '1일 전', isRead: true }
  ];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const categories = ['전체', '세션', '스터디', '프로젝트', '소모임', '행사'];

  const filteredActivities = useMemo(() => {
    return mockActivities.filter(activity => {
      if (activeCategory !== '전체' && activity.category !== activeCategory) return false;
      if (searchKeyword && !activity.title.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
      if (filters.days.length > 0) {
        const hasMatchingDay = filters.days.some(day => activity.schedule.includes(day));
        if (!hasMatchingDay) return false;
      }
      if (filters.recruiting !== null) {
        const isRecruiting = activity.currentMembers < activity.maxMembers;
        if (filters.recruiting !== isRecruiting) return false;
      }
      if (filters.leader && !activity.leader.toLowerCase().includes(filters.leader.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, searchKeyword, filters]);

  // 2. 알림 아이콘/색상 관련 헬퍼 함수를 추가합니다.
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application': return 'ri-user-add-line';
      case 'attendance': return 'ri-calendar-check-line';
      case 'approval': return 'ri-check-circle-line';
      case 'reminder': return 'ri-alarm-line';
      default: return 'ri-notification-line';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application': return 'text-blue-600 bg-blue-100';
      case 'attendance': return 'text-green-600 bg-green-100';
      case 'approval': return 'text-purple-600 bg-purple-100';
      case 'reminder': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="전체 활동"
        unreadCount={unreadCount}
        isLoggedIn={isLoggedIn}
        onNotificationClick={() => {
          // 3. 로그인 상태일 때만 알림 모달을 엽니다.
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

      <SearchFilter onSearch={setSearchKeyword} onFilter={setFilters} />

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

      {/* 4. MyPage에서 가져온 알림 모달 JSX를 추가합니다. */}
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
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-notification-off-line text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">새로운 알림이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  모든 알림 확인
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

