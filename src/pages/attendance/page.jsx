import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../../components/feature/TabBar';
import MyAttendanceManagement from './components/MyAttendanceManagement';
import ActivityManagement from './components/ActivityManagement';
import Header from '../../components/common/Header';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  // 1. 알림 관련 상태와 데이터를 추가합니다.
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const notifications = [
    { id: '1', type: 'application', title: 'React 스터디 그룹', message: '새로운 신청자가 있습니다.', time: '5분 전', isRead: false },
    { id: '2', type: 'attendance', title: 'AI 프로젝트 팀', message: '출석 시간이 시작되었습니다.', time: '1시간 전', isRead: false },
    { id: '3', type: 'approval', title: '독서 모임', message: '활동 참여가 승인되었습니다.', time: '2시간 전', isRead: true },
    { id: '4', type: 'reminder', title: '창업 아이디어 경진대회', message: '내일 활동이 예정되어 있습니다.', time: '1일 전', isRead: true }
  ];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const availableAttendance = [
    { id: '1', title: 'React 스터디 그룹', leader: '김철수', timeLeft: '23분 남음' },
    { id: '2', title: 'AI 프로젝트 팀', leader: '박영희', timeLeft: '45분 남음' }
  ];

  const handleAttendanceClick = (activity) => {
    setSelectedActivity(activity);
    setShowCodeInput(true);
  };

  const handleCodeSubmit = () => {
    if (attendanceCode.length === 4) {
      setShowCodeInput(false);
      setShowSuccess(true);
      setAttendanceCode('');
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedActivity(null);
      }, 2000);
    }
  };

  const handleCodeInput = (digit) => {
    if (attendanceCode.length < 4) {
      setAttendanceCode(attendanceCode + digit);
    }
  };

  const handleCodeDelete = () => {
    setAttendanceCode(attendanceCode.slice(0, -1));
  };

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
        title="출석"
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
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            출석하기
          </button>
          <button
            onClick={() => setActiveTab('myAttendance')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'myAttendance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            나의 출석 관리
          </button>
          <button
            onClick={() => setActiveTab('activityManagement')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'activityManagement' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            개설 활동 관리
          </button>
        </div>
      </Header>

      <div className="px-4 py-4">
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">출석 가능한 활동</h2>
              {availableAttendance.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center">
                  <i className="ri-calendar-check-line text-3xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">현재 출석 가능한 활동이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableAttendance.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => handleAttendanceClick(activity)}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                          <p className="text-sm text-gray-600">팀장: {activity.leader}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-orange-600 text-sm font-medium mb-1">
                            <i className="ri-time-line"></i>
                            <span>{activity.timeLeft}</span>
                          </div>
                          <button className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-medium">
                            출석하기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'myAttendance' && <MyAttendanceManagement />}
        {activeTab === 'activityManagement' && <ActivityManagement />}
      </div>

      {showCodeInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 코드 입력</h3>
              <p className="text-sm text-gray-600">{selectedActivity?.title}</p>
            </div>
            <div className="flex justify-center space-x-3 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center text-xl font-bold"
                >
                  {attendanceCode[index] || ''}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleCodeInput(digit.toString())}
                  className="h-12 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {digit}
                </button>
              ))}
              <div></div>
              <button
                onClick={() => handleCodeInput('0')}
                className="h-12 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                0
              </button>
              <button
                onClick={handleCodeDelete}
                className="h-12 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <i className="ri-delete-back-line text-lg"></i>
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCodeInput(false);
                  setAttendanceCode('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                취소
              </button>
              <button
                onClick={handleCodeSubmit}
                disabled={attendanceCode.length !== 4}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                출석
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-2xl text-green-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 완료!</h3>
            <p className="text-gray-600">{selectedActivity?.title}</p>
          </div>
        </div>
      )}

      {/* 4. 알림 모달 JSX를 추가합니다. */}
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

