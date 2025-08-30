import { useState } from 'react';
import TabBar from '../../components/feature/TabBar';
import MyAttendanceManagement from './components/MyAttendanceManagement';
import ActivityManagement from './components/ActivityManagement';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const availableAttendance = [
    { id: '1', title: 'React 스터디 그룹', leader: '김철수', timeLeft: '23분 남음' },
    { id: '2', title: 'AI 프로젝트 팀', leader: '박영희', timeLeft: '45분 남음' }
  ];

  const myActivities = [
    { id: '1', title: 'React 스터디 그룹', attendanceRate: 85, totalSessions: 12, attendedSessions: 10 },
    { id: '2', title: 'AI 프로젝트 팀', attendanceRate: 92, totalSessions: 8, attendedSessions: 7 },
    { id: '3', title: '독서 모임', attendanceRate: 100, totalSessions: 4, attendedSessions: 4 }
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">출석</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              출석하기
            </button>
            <button
              onClick={() => setActiveTab('myAttendance')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'myAttendance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              나의 출석 관리
            </button>
            <button
              onClick={() => setActiveTab('activityManagement')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'activityManagement' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              개설 활동 관리
            </button>
          </div>
        </div>
      </div>

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

      <TabBar />
    </div>
  );
}
