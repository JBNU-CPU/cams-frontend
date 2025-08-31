import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabBar from '../../components/feature/TabBar';
import Header from '../../components/common/Header';
// 1. 커스텀 훅과 알림 UI 헬퍼 함수를 import 합니다.
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationIcon, getNotificationColor } from '../../api/NotificationData';
export default function MyPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeInterval, setTimeInterval] = useState(null);
  const [attendanceOpen, setAttendanceOpen] = useState({});
  const [customTime, setCustomTime] = useState('');
  const [presetCode, setPresetCode] = useState('');
  const [showTimeEndModal, setShowTimeEndModal] = useState(false);

  // 실제 앱에서는 로그인 여부를 Context API나 Redux 등 전역 상태로 관리합니다.
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const navigate = useNavigate();

  // useNotifications 훅을 호출하여 알림 관련 모든 로직과 상태를 가져옵니다.
  const {
    notificationList,
    unreadCount,
    dismissNotification,
    dismissAllNotifications
  } = useNotifications();

  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // --- Mock Data ---
  const [userProfile, setUserProfile] = useState({
    name: '김민수',
    email: 'minsu.kim@student.ac.kr',
    phone: '010-1234-5678',
    major: '컴퓨터공학과',
    grade: '3학년',
    introduction: '안녕하세요! 개발에 관심이 많은 컴퓨터공학과 학생입니다. 특히 웹 개발과 AI 분야에 관심이 있어 관련 스터디와 프로젝트에 적극 참여하고 있습니다.',
    interests: ['웹 개발', 'AI/머신러닝', 'React', 'Node.js', '알고리즘']
  });

  const [editForm, setEditForm] = useState(userProfile);

  const myOpenedActivities = [{ id: '1', title: 'React 스터디 그룹', status: '진행 중', members: 8, maxMembers: 12, applicants: 3, applicantsList: [{ id: 'app1', name: '홍길동', email: 'hong@student.ac.kr', appliedDate: '2024-01-20', studentId: '24220015', department: '컴퓨터공학과' }, { id: 'app2', name: '김영수', email: 'kim@student.ac.kr', appliedDate: '2024-01-19', studentId: '24220016', department: '소프트웨어학과' }, { id: 'app3', name: '박미래', email: 'park@student.ac.kr', appliedDate: '2024-01-18', studentId: '24220017', department: '디자인학과' }] }, { id: '2', title: 'UI/UX 디자인 워크숍', status: '승인 대기', members: 0, maxMembers: 15, applicants: 5, applicantsList: [{ id: 'app4', name: '이지은', email: 'lee@student.ac.kr', appliedDate: '2024-01-21', studentId: '24220018', department: '시각디자인학과' }, { id: 'app5', name: '정민호', email: 'jung@student.ac.kr', appliedDate: '2024-01-20', studentId: '24220019', department: '경영학과' }, { id: 'app6', name: '최서영', email: 'choi@student.ac.kr', appliedDate: '2024-01-19', studentId: '24220020', department: '심리학과' }, { id: 'app7', name: '강태준', email: 'kang@student.ac.kr', appliedDate: '2024-01-18', studentId: '24220021', department: '컴퓨터공학과' }, { id: 'app8', name: '윤서진', email: 'yoon@student.ac.kr', appliedDate: '2024-01-17', studentId: '24220022', department: '국어국문학과' }] }];
  const myAppliedActivities = [{ id: '3', title: 'AI 프로젝트 팀', leader: '박영희', status: '참여 중', canCancel: true, schedule: '매주 화/목 19:00', location: '공학관 301호', currentMembers: 8, maxMembers: 10 }, { id: '4', title: '독서 모임', leader: '이민수', status: '참여 중', canCancel: true, schedule: '매주 토 14:00', location: '도서관 세미나실', currentMembers: 12, maxMembers: 15 }, { id: '5', title: '창업 아이디어 경진대회', leader: '정태현', status: '승인 대기', canCancel: true, schedule: '매주 수 18:30', location: '창업지원센터', currentMembers: 5, maxMembers: 8 }];
  const [activitiesData, setActivitiesData] = useState(myOpenedActivities);

  // --- 핸들러 함수들 ---
  const getStatusColor = (status) => { switch (status) { case '진행 중': case '참여 중': return 'bg-green-100 text-green-700'; case '승인 대기': return 'bg-yellow-100 text-yellow-700'; case '불가': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-700'; } };
  const handleShowApplicants = (e, activity) => { e.preventDefault(); e.stopPropagation(); setSelectedActivity(activity); setShowApplicantsModal(true); };
  const handleRemoveApplicant = (applicantId) => { if (confirm('이 신청자를 삭제하시겠습니까?')) { setActivitiesData(prevData => prevData.map(activity => activity.id === selectedActivity.id ? { ...activity, applicantsList: activity.applicantsList.filter(app => app.id !== applicantId), applicants: activity.applicants - 1 } : activity)); setSelectedActivity(prev => ({ ...prev, applicantsList: prev.applicantsList.filter(app => app.id !== applicantId), applicants: prev.applicants - 1 })); } };
  const generateAttendanceCode = () => { return Math.floor(1000 + Math.random() * 9000).toString(); };
  const formatTimeLeft = (seconds) => { const minutes = Math.floor(seconds / 60); const secs = seconds % 60; return `${minutes}:${secs.toString().padStart(2, '0')}`; };
  const handleOpenAttendance = (e, activity) => { e.preventDefault(); e.stopPropagation(); setSelectedActivity(activity); setShowAttendanceModal(true); setCustomTime(''); setPresetCode(''); };
  const handleStartAttendance = () => { const finalTime = customTime ? parseInt(customTime) : 30; if (finalTime < 1 || finalTime > 120) { alert('출석 시간은 1분에서 120분 사이로 설정해주세요.'); return; } const code = presetCode || generateAttendanceCode(); setAttendanceCode(code); setTimeLeft(finalTime * 60); setAttendanceOpen({ ...attendanceOpen, [selectedActivity.id]: true }); const interval = setInterval(() => { setTimeLeft((prev) => { if (prev <= 1) { clearInterval(interval); setAttendanceOpen(prevOpen => ({ ...prevOpen, [selectedActivity.id]: false })); setShowAttendanceModal(false); setShowTimeEndModal(true); return 0; } return prev - 1; }); }, 1000); setTimeInterval(interval); };
  const handleCloseAttendance = (activityId) => { setAttendanceOpen(prev => ({ ...prev, [activityId]: false })); setShowAttendanceModal(false); setSelectedActivity(null); setAttendanceCode(''); setTimeLeft(0); setCustomTime(''); setPresetCode(''); if (timeInterval) { clearInterval(timeInterval); setTimeInterval(null); } };
  const handleExtendTime = (additionalMinutes) => { setTimeLeft((prev) => prev + additionalMinutes * 60); };
  const handleExtendFromEndModal = (additionalMinutes) => { setTimeLeft(additionalMinutes * 60); setAttendanceOpen(prev => ({ ...prev, [selectedActivity.id]: true })); setShowTimeEndModal(false); setShowAttendanceModal(true); const interval = setInterval(() => { setTimeLeft((prev) => { if (prev <= 1) { clearInterval(interval); setAttendanceOpen(prevOpen => ({ ...prevOpen, [selectedActivity.id]: false })); setShowAttendanceModal(false); setShowTimeEndModal(true); return 0; } return prev - 1; }); }, 1000); setTimeInterval(interval); };
  const handleFinalClose = () => { setShowTimeEndModal(false); setSelectedActivity(null); setAttendanceCode(''); setTimeLeft(0); setCustomTime(''); if (timeInterval) { clearInterval(timeInterval); setTimeInterval(null); } };
  const handlePresetCodeInput = (digit) => { if (presetCode.length < 4) { setPresetCode(presetCode + digit); } };
  const handlePresetCodeDelete = () => { setPresetCode(presetCode.slice(0, -1)); };
  const handleGeneratePresetCode = () => { const randomCode = generateAttendanceCode(); setPresetCode(randomCode); };
  const handleOpenProfileEdit = () => { setEditForm(userProfile); setShowProfileEditModal(true); };
  const handleSaveProfile = () => { setUserProfile(editForm); setShowProfileEditModal(false); };
  const handleAddInterest = () => { const interest = prompt('새로운 관심분야를 입력하세요:'); if (interest && interest.trim()) { setEditForm(prev => ({ ...prev, interests: [...prev.interests, interest.trim()] })); } };
  const handleRemoveInterest = (index) => { setEditForm(prev => ({ ...prev, interests: prev.interests.filter((_, i) => i !== index) })); };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="마이페이지"
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
        {isLoggedIn && (
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
            >
              내 프로필
            </button>
            <button
              onClick={() => setActiveTab('opened')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'opened' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
            >
              개설목록
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'applied' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
            >
              신청목록
            </button>
          </div>
        )}
      </Header>

      <div className="px-4 py-4">
        {isLoggedIn ? (
          <>
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-700">{userProfile.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{userProfile.name}</h2>
                        <p className="text-gray-600">{userProfile.major} {userProfile.grade}</p>
                      </div>
                    </div>
                    <button onClick={handleOpenProfileEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      편집
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                        <p className="text-gray-900">{userProfile.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                        <p className="text-gray-900">{userProfile.phone}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                      <p className="text-gray-900 leading-relaxed">{userProfile.introduction}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">관심분야</label>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.interests.map((interest, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 통계</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{activitiesData.length}</div>
                      <div className="text-sm text-gray-600">개설한 활동</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">{myAppliedActivities.length}</div>
                      <div className="text-sm text-gray-600">참여한 활동</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'opened' && (
              <div className="space-y-4">
                {activitiesData.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="ri-folder-open-line text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 mb-4">개설한 활동이 없습니다.</p>
                    <Link to="/create-activity" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                      <i className="ri-add-line mr-2"></i>
                      활동 만들기
                    </Link>
                  </div>
                ) : (
                  activitiesData.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <Link to={`/activity/${activity.id}`} className="block">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>멤버: {activity.members}/{activity.maxMembers}명</span>
                              {activity.applicants > 0 && (
                                <span className="text-orange-600 font-medium">신청자: {activity.applicants}명</span>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      </Link>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => handleShowApplicants(e, activity)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                          신청자 보기
                        </button>
                        <button onClick={(e) => { if (attendanceOpen[activity.id]) { e.preventDefault(); e.stopPropagation(); setSelectedActivity(activity); setShowAttendanceModal(true); } else { handleOpenAttendance(e, activity); } }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${attendanceOpen[activity.id] ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                          {attendanceOpen[activity.id] ? '출석 진행 중' : '출석 오픈'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'applied' && (
              <div className="space-y-4">
                {myAppliedActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="ri-file-list-line text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 mb-4">신청한 활동이 없습니다.</p>
                    <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                      활동 둘러보기
                    </Link>
                  </div>
                ) : (
                  myAppliedActivities.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <Link to={`/activity/${activity.id}`} className="block">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">팀장: {activity.leader}</p>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <i className="ri-calendar-line mr-2"></i>
                                <span>{activity.schedule}</span>
                              </div>
                              <div className="flex items-center">
                                <i className="ri-map-pin-line mr-2"></i>
                                <span>{activity.location}</span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <i className="ri-group-line mr-2"></i>
                                  <span>참여 인원: {activity.currentMembers}/{activity.maxMembers}명</span>
                                </div>
                                <span className="text-sm text-gray-500">{Math.round((activity.currentMembers / activity.maxMembers) * 100)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(activity.currentMembers / activity.maxMembers) * 100}%` }}></div>
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>{activity.status}</span>
                        </div>
                      </Link>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        {activity.canCancel && (
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm('정말로 이 활동 신청을 취소하시겠습니까?')) { alert('활동 신청이 취소되었습니다.'); } }} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                            취소하기
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-3xl text-gray-500"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">로그인이 필요한 서비스입니다</h2>
            <p className="text-gray-600 mb-6">로그인하고 모든 활동에 참여해보세요!</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              로그인 페이지로 이동
            </button>
          </div>
        )}
      </div>

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

      {showApplicantsModal && selectedActivity && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"> <div className="px-6 py-4 border-b border-gray-100"> <div className="flex items-center justify-between"> <div> <h3 className="text-lg font-semibold text-gray-900">신청자 목록</h3> <p className="text-sm text-gray-600 mt-1">{selectedActivity.title}</p> </div> <button onClick={() => setShowApplicantsModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" > <i className="ri-close-line text-gray-600"></i> </button> </div> </div> <div className="px-6 py-3 bg-blue-50"> <div className="flex items-center justify-center space-x-2"> <i className="ri-group-line text-blue-600"></i> <span className="text-sm font-medium text-blue-700"> 총 {selectedActivity.applicants}명의 신청자 </span> </div> </div> <div className="flex-1 overflow-y-auto p-6"> {selectedActivity.applicantsList.length === 0 ? (<div className="text-center py-8"> <i className="ri-user-line text-4xl text-gray-300 mb-4"></i> <p className="text-gray-500">신청자가 없습니다.</p> </div>) : (<div className="space-y-4"> {selectedActivity.applicantsList.map((applicant) => (<div key={applicant.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100"> <div className="flex items-start justify-between mb-3"> <div className="flex items-center space-x-3"> <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center"> <span className="text-sm font-semibold text-blue-700"> {applicant.name.charAt(0)} </span> </div> <div> <h4 className="font-medium text-gray-900">{applicant.name}</h4> <p className="text-sm text-gray-600">{applicant.email}</p> </div> </div> <button onClick={() => handleRemoveApplicant(applicant.id)} className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-full transition-colors" > <i className="ri-delete-bin-line"></i> </button> </div> <div className="grid grid-cols-2 gap-3 text-sm"> <div> <span className="text-gray-500">학번:</span> <span className="ml-2 text-gray-900">{applicant.studentId}</span> </div> <div> <span className="text-gray-500">학과:</span> <span className="ml-2 text-gray-900">{applicant.department}</span> </div> <div className="col-span-2"> <span className="text-gray-500">신청일:</span> <span className="ml-2 text-gray-900">{applicant.appliedDate}</span> </div> </div> </div>))} </div>)} </div> <div className="px-6 py-4 bg-gray-50 border-t border-gray-100"> <button onClick={() => setShowApplicantsModal(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors" > 확인 </button> </div> </div> </div>)}
      {showAttendanceModal && selectedActivity && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"> <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto"> {!attendanceOpen[selectedActivity.id] ? (<> <div className="text-center mb-6"> <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 설정</h3> <p className="text-sm text-gray-600">{selectedActivity.title}</p> </div> <div className="mb-6"> <label className="block text-sm font-medium text-gray-700 mb-2">출석 가능 시간 (분)</label> <input type="number" min="1" max="120" value={customTime} onChange={(e) => setCustomTime(e.target.value)} placeholder="30" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" /> <p className="text-xs text-gray-500 text-center mt-1"> 1분 ~ 120분 사이로 입력해주세요 (기본: 30분) </p> </div> <div className="mb-6"> <p className="text-sm font-medium text-gray-700 mb-2">빠른 선택</p> <div className="grid grid-cols-4 gap-2"> {[5, 10, 15, 30].map((minutes) => (<button key={minutes} onClick={() => setCustomTime(minutes.toString())} className={`py-2 px-3 text-sm rounded-lg border transition-colors ${customTime === minutes.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`} > {minutes}분 </button>))} </div> </div> <div className="mb-6"> <div className="flex items-center justify-between mb-3"> <label className="text-sm font-medium text-gray-700">출석 코드 설정</label> <button onClick={handleGeneratePresetCode} className="text-blue-600 text-xs font-medium flex items-center space-x-1 hover:text-blue-700" > <i className="ri-refresh-line"></i> <span>랜덤 생성</span> </button> </div> <div className="flex justify-center space-x-2 mb-4"> {[0, 1, 2, 3].map((index) => (<div key={index} className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center"> <span className="text-xl font-bold text-gray-700">{presetCode[index] || ''}</span> </div>))} </div> <div className="grid grid-cols-3 gap-2 mb-3"> {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (<button key={digit} onClick={() => handlePresetCodeInput(digit.toString())} className="h-10 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors" > {digit} </button>))} <div></div> <button onClick={() => handlePresetCodeInput('0')} className="h-10 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors" > 0 </button> <button onClick={handlePresetCodeDelete} className="h-10 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" > <i className="ri-delete-back-line text-lg"></i> </button> </div> <p className="text-xs text-gray-500 text-center">코드를 설정하지 않으면 자동으로 생성됩니다</p> </div> <div className="flex space-x-3"> <button onClick={() => setShowAttendanceModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium" > 취소 </button> <button onClick={handleStartAttendance} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"> 출석 시작 </button> </div> </>) : (<> <div className="text-center mb-6"> <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 코드</h3> <p className="text-sm text-gray-600">{selectedActivity.title}</p> </div> <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center"> <div className="flex items-center justify-center mb-4"> <div className="flex space-x-2 justify-center"> {attendanceCode.split('').map((digit, index) => (<div key={index} className="w-12 h-12 bg-white rounded-lg flex items-center justify-center"> <span className="text-2xl font-bold text-blue-600">{digit}</span> </div>))} </div> </div> <p className="text-sm text-gray-600">멤버들에게 이 코드를 알려주세요</p> </div> <div className="bg-orange-50 rounded-lg p-3 mb-4 text-center"> <div className="flex items-center justify-center space-x-2 mb-2"> <i className="ri-time-line text-orange-600"></i> <span className="text-sm text-orange-700">남은 시간</span> </div> <div className="text-2xl font-bold text-orange-600">{formatTimeLeft(timeLeft)}</div> {timeLeft <= 300 && timeLeft > 0 && <p className="text-xs text-orange-600 mt-1">출석 마감이 임박했습니다!</p>} </div> {timeLeft > 0 && (<div className="mb-6"> <div className="grid grid-cols-3 gap-2"> {[5, 10, 15].map((minutes) => (<button key={minutes} onClick={() => handleExtendTime(minutes)} className="py-1 px-2 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200" > +{minutes}분 </button>))} </div> </div>)} <div className="flex space-x-3"> <button onClick={() => handleCloseAttendance(selectedActivity.id)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium" > 출석 종료 </button> </div> </>)} </div> </div>)}
      {showTimeEndModal && selectedActivity && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"> <div className="text-center mb-6"> <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"> <i className="ri-time-line text-2xl text-orange-600"></i> </div> <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 시간 종료</h3> <p className="text-sm text-gray-600">{selectedActivity.title}</p> </div> <div className="mb-6"> <h4 className="text-sm font-medium text-gray-700 mb-3">추가 시간 설정</h4> <div className="grid grid-cols-4 gap-2 mb-3"> {[5, 10, 15, 30].map((minutes) => (<button key={minutes} onClick={() => handleExtendFromEndModal(minutes)} className="py-2 px-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors" > +{minutes}분 </button>))} </div> <p className="text-xs text-gray-500 text-center">시간을 연장하면 출석이 다시 시작됩니다</p> </div> <div className="flex space-x-3"> <button onClick={handleFinalClose} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"> 출석 완료 </button> </div> </div> </div>)}
      {showProfileEditModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> <div className="bg-white rounded-2xl w-full max-w-md max-h-[75vh] overflow-hidden flex flex-col"> <div className="px-6 py-4 border-b border-gray-100"> <div className="flex items-center justify-between"> <h3 className="text-lg font-semibold text-gray-900">프로필 편집</h3> <button onClick={() => setShowProfileEditModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" > <i className="ri-close-line text-gray-600"></i> </button> </div> </div> <div className="flex-1 overflow-y-auto p-6 space-y-4"> <div> <label className="block text-sm font-medium text-gray-700 mb-2">이름</label> <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label> <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label> <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> <div className="grid grid-cols-2 gap-3"> <div> <label className="block text-sm font-medium text-gray-700 mb-2">전공</label> <input type="text" value={editForm.major} onChange={(e) => setEditForm({ ...editForm, major: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-2">학년</label> <select value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" > <option value="1학년">1학년</option> <option value="2학년">2학년</option> <option value="3학년">3학년</option> <option value="4학년">4학년</option> <option value="대학원생">대학원생</option> </select> </div> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label> <textarea value={editForm.introduction} onChange={(e) => setEditForm({ ...editForm, introduction: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="자신을 소개해보세요..." /> </div> <div> <div className="flex items-center justify-between mb-2"> <label className="block text-sm font-medium text-gray-700">관심분야</label> <button onClick={handleAddInterest} className="text-blue-600 text-sm font-medium hover:text-blue-700" > <i className="ri-add-line mr-1"></i> 추가 </button> </div> <div className="flex flex-wrap gap-2"> {editForm.interests.map((interest, index) => (<span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm" > {interest} <button onClick={() => handleRemoveInterest(index)} className="ml-2 text-blue-500 hover:text-blue-700" > <i className="ri-close-line text-xs"></i> </button> </span>))} </div> </div> </div> <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex space-x-3"> <button onClick={() => setShowProfileEditModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors" > 취소 </button> <button onClick={handleSaveProfile} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors" > 저장 </button> </div> </div> </div>)}

      <TabBar />
    </div>
  );
}