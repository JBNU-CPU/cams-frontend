import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../../components/feature/TabBar';
import MyAttendanceManagement from './components/MyAttendanceManagement';
import ActivityManagement from './components/ActivityManagement';
import Header from '../../components/common/Header';
// 1. 커스텀 훅과 알림 UI 헬퍼 함수를 import 합니다.
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationIcon, getNotificationColor } from '../../api/NotificationData';
import axiosInstance from '../../api/axiosInstance';
import CountdownTimer from './components/CountdownTimer';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');

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
  const [availableAttendance, setAvailableAttendance] = useState([]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      const fetchOpenSessions = async () => {
        try {
          const response = await axiosInstance.get('/api/session/open-session');
          const sessions = response.data.content.map(session => {
            return {
              id: session.sessionId,
              title: `${session.activityTitle} (${session.sessionNumber}회차)`,
              leader: session.createdBy,
              closedAt: session.closedAt,
            };
          });
          setAvailableAttendance(sessions);
        } catch (error) {
          console.error('출석 가능한 활동을 불러오는 중 오류가 발생했습니다.', error);
          navigate("/login")
        }
      };

      fetchOpenSessions();
    }
  }, [activeTab]);

  const handleAttendanceClick = (activity) => {
    setSelectedActivity(activity);
    setShowCodeInput(true);
  };

  const handleCodeSubmit = async () => {
    setAttendanceError(''); // Clear previous error message
    if (attendanceCode.length === 4 && selectedActivity) {
      try {
        await axiosInstance.post(`/api/attendance/${selectedActivity.id}?attendancesCode=${attendanceCode}`);

        setAvailableAttendance(prev => prev.filter(activity => activity.id !== selectedActivity.id));
        setShowCodeInput(false);
        setShowSuccess(true);
        setAttendanceCode('');
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedActivity(null);
        }, 2000);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setAttendanceError('출석 코드가 일치하지 않습니다.');
        } else {
          console.error('출석 처리 중 오류가 발생했습니다.', error);
          setAttendanceError('출석 처리 중 오류가 발생했습니다.');
        }
        setAttendanceCode('');
      }
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

  const handleActivityExpire = (activityId) => {
    setAvailableAttendance(prev => prev.filter(activity => activity.id !== activityId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="출석"
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
                            <CountdownTimer closedAt={activity.closedAt} onExpire={() => handleActivityExpire(activity.id)} />
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
              {attendanceError && (
                <p className="text-red-500 text-sm mt-2">{attendanceError}</p>
              )}
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