import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabBar from '../../components/feature/TabBar';
import Header from '../../components/common/Header';
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationIcon, getNotificationColor } from '../../api/NotificationData';
import axiosInstance from '../../api/axiosInstance';
import Alert from '../../components/common/Alert';
import Confirm from '../../components/common/ConfirmDialog';

// --- 데이터 매핑을 위한 헬퍼 함수들 ---
const formatRecurringSchedule = (schedules) => {
  if (!schedules || schedules.length === 0) return '일정 정보 없음';
  const dayMap = { MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목', FRIDAY: '금', SATURDAY: '토', SUNDAY: '일' };
  const days = schedules.map(s => dayMap[s.dayOfWeek] || '').join('/');
  const time = schedules[0].startTime.substring(0, 5);
  return `매주 ${days} ${time}`;
};
const formatEventSchedule = (schedules) => {
  if (!schedules || schedules.length === 0) return '일정 정보 없음';
  const firstEvent = new Date(schedules[0].startDateTime);
  const month = firstEvent.getMonth() + 1;
  const day = firstEvent.getDate();
  const hours = firstEvent.getHours().toString().padStart(2, '0');
  const minutes = firstEvent.getMinutes().toString().padStart(2, '0');
  return `${month}월 ${day}일 ${hours}:${minutes}`;
};
const mapActivityData = (apiActivity) => {
  const categoryMap = { SESSION: '세션', STUDY: '스터디', PROJECT: '프로젝트', MEETING: '소모임', GENERAL: '행사' };
  const statusMap = { NOT_STARTED: '승인 대기', STARTED: '진행 중', ENDED: '마감' };

  let scheduleText = '';
  const recurringTypes = ['SESSION', 'STUDY', 'PROJECT'];
  if (recurringTypes.includes(apiActivity.activityType)) {
    scheduleText = formatRecurringSchedule(apiActivity.recurringSchedules);
  } else {
    scheduleText = formatEventSchedule(apiActivity.eventSchedules);
  }

  return {
    id: apiActivity.id,
    title: apiActivity.title,
    leader: apiActivity.createdBy,
    members: apiActivity.participantCount,
    maxMembers: apiActivity.maxParticipants,
    schedule: scheduleText,
    category: categoryMap[apiActivity.activityType] || apiActivity.activityType,
    status: statusMap[apiActivity.activityStatus] || '상태 미지정',
    location: apiActivity.location || "장소 정보 없음",
    applicants: apiActivity.applicantCount || 0,
    applicantsList: apiActivity.applicantsList || [],
  };
};

// ❗ 1. 관심분야 카테고리 데이터 정의 (API 전송값과 UI 표시값 매핑)
const INTEREST_CATEGORIES = [
  { key: 'FRONTEND', label: '프론트엔드' },
  { key: 'BACKEND', label: '백엔드' },
  { key: 'FULLSTACK', label: '풀스택' },
  { key: 'MOBILE', label: '모바일 개발' },
  { key: 'DATA', label: '데이터' },
  { key: 'AI', label: 'AI' },
  { key: 'INFRASTRUCTURE', label: '시스템/인프라' },
  { key: 'SECURITY', label: '보안/해킹' },
  { key: 'HACKING', label: '해킹' },
  { key: 'GAME', label: '게임 개발' },
  { key: 'EMBEDDED', label: '임베디드/하드웨어' },
  { key: 'PLANNER', label: '기획' },
  { key: 'DESIGNER', label: '디자인(UI/UX)' },
  { key: 'PM', label: '프로젝트 매니저(PM)' },
];


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

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { notificationList, unreadCount, dismissNotification, dismissAllNotifications } = useNotifications();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [userProfile, setUserProfile] = useState({ name: '', email: '', phone: '', major: '', grade: '', introduction: '', interests: [] });
  const [editForm, setEditForm] = useState(userProfile);
  const [myOpenedActivities, setMyOpenedActivities] = useState([]);
  const [myAppliedActivities, setMyAppliedActivities] = useState([]);

  const [alertMessage, setAlertMessage] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: null,
  });

  // 공통 confirm 열기
  const openConfirm = (message, onConfirm) => {
    setConfirmConfig({
      open: true,
      message,
      onConfirm,
      confirmText: '확인',
      cancelText: '취소',
    });
  };

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, open: false, onConfirm: null }));


  useEffect(() => {
    const fetchMyPageData = async () => {
      if (!isLoggedIn) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const [profileRes, openedRes, appliedRes] = await Promise.all([
          axiosInstance.get('/api/member/me'),
          axiosInstance.get('/api/me/activity/create'),
          axiosInstance.get('/api/me/activity/participate')
        ]);

        // ❗ 2. API 응답에 따라 'interests'를 'interesting'으로 수정
        const profileData = profileRes.data;
        const interestsArray = profileData.interesting && Array.isArray(profileData.interesting) ? profileData.interesting : [];
        setUserProfile({
          name: profileData.name || '이름 없음',
          email: profileData.email || '-',
          phone: profileData.phone || '-',
          major: profileData.department || '학과 정보 없음',
          grade: profileData.cohort ? `${profileData.cohort}기` : '기수 정보 없음',
          introduction: profileData.introduce || "자기소개를 작성해주세요.",
          interests: interestsArray, // 프론트엔드 상태 이름은 interests 유지
        });

        if (openedRes.data && Array.isArray(openedRes.data.content)) { setMyOpenedActivities(openedRes.data.content.map(mapActivityData)); }
        if (appliedRes.data && Array.isArray(appliedRes.data.content)) { setMyAppliedActivities(appliedRes.data.content.map(mapActivityData)); }

      } catch (error) {
        console.error('마이페이지 데이터 로딩 실패:', error);
        navigate("/login")
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyPageData();
  }, [isLoggedIn]);

  // --- 핸들러 함수들 ---
  const getStatusColor = (status) => { switch (status) { case '진행 중': case '참여 중': return 'bg-green-100 text-green-700'; case '승인 대기': return 'bg-yellow-100 text-yellow-700'; case '마감': return 'bg-red-100 text-red-700'; default: return 'bg-gray-100 text-gray-700'; } };

  const handleShowApplicants = async (e, activity) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const response = await axiosInstance.get(`/api/activities/${activity.id}/participant`);
      const applicantsData = response.data.content || [];
      const totalApplicants = response.data.totalElements || 0;
      const detailedActivity = { ...activity, applicantsList: applicantsData, applicants: totalApplicants };
      setSelectedActivity(detailedActivity);
      setShowApplicantsModal(true);
    } catch (error) {
      console.error('신청자 목록을 불러오는 데 실패했습니다.', error);
      setAlertMessage('신청자 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleRemoveApplicant = async (applicantIdToRemove) => {
    openConfirm({
      message: '이 신청자를 거절(삭제)하시겠습니까?',
      confirmText: '거절',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/api/activities/${selectedActivity.id}/participant/${applicantIdToRemove}`);
          const updatedList = selectedActivity.applicantsList.filter(app => app.id !== applicantIdToRemove);
          const updatedActivity = { ...selectedActivity, applicantsList: updatedList, applicants: updatedList.length };
          setSelectedActivity(updatedActivity);
          setMyOpenedActivities(prev => prev.map(a => a.id === selectedActivity.id ? { ...a, applicants: updatedList.length } : a));
          setAlertMessage('신청자를 거절했습니다.');
        } catch (error) {
          console.error('신청자 삭제 실패:', error);
          setAlertMessage('신청자 삭제에 실패했습니다. 다시 시도해주세요.');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  const handleApproveApplicant = async (applicantIdToApprove) => {
    try {
      await axiosInstance.patch(`/api/activities/${selectedActivity.id}/participant/${applicantIdToApprove}/approve`);
      const updatedList = selectedActivity.applicantsList.filter(app => app.id !== applicantIdToApprove);
      const updatedActivity = { ...selectedActivity, applicantsList: updatedList, applicants: updatedList.length, members: selectedActivity.members + 1 };
      setSelectedActivity(updatedActivity);
      setMyOpenedActivities(prev => prev.map(activity => activity.id === selectedActivity.id ? { ...activity, applicants: updatedList.length, members: activity.members + 1 } : activity));
      setAlertMessage('신청자를 승인했습니다.');
    } catch (error) {
      console.error('신청자 승인 실패:', error);
      setAlertMessage('신청자 승인에 실패했습니다.');
    }
  };

  const handleEndActivity = async (activityId) => {
    openConfirm({
      message: '정말로 이 활동의 모집을 마감하시겠습니까?',
      confirmText: '마감',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await axiosInstance.put(`/api/activities/${activityId}/status?status=ENDED`);
          setMyOpenedActivities(prev => prev.map(act => act.id === activityId ? { ...act, status: '마감' } : act));
          setAlertMessage('모집이 마감되었습니다.');
        } catch (error) {
          console.error('모집 마감 처리 실패:', error);
          setAlertMessage('모집 마감 처리에 실패했습니다.');
        } finally {
          closeConfirm();
        }
      }
    });
  };

  const handleDeleteActivity = async (activityId, status) => {
    const actionText = status === '마감' ? '삭제' : '취소';
    openConfirm({
      message: `정말로 이 활동을 ${actionText}하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      confirmText: actionText,
      cancelText: '닫기',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/api/activities/${activityId}`);
          setMyOpenedActivities(prev => prev.filter(act => act.id !== activityId));
          setAlertMessage(`활동이 ${actionText}되었습니다.`);
        } catch (error) {
          console.error(`활동 ${actionText} 실패:`, error);
          setAlertMessage(`활동 ${actionText}에 실패했습니다.`);
        } finally {
          closeConfirm();
        }
      }
    });
  };

  const generateAttendanceCode = () => { return Math.floor(1000 + Math.random() * 9000).toString(); };
  const formatTimeLeft = (seconds) => { const minutes = Math.floor(seconds / 60); const secs = seconds % 60; return `${minutes}:${secs.toString().padStart(2, '0')}`; };
  const handleOpenAttendance = (e, activity) => { e.preventDefault(); e.stopPropagation(); setSelectedActivity(activity); setShowAttendanceModal(true); setCustomTime(''); setPresetCode(''); };
  const handleStartAttendance = () => {
    const finalTime = customTime ? parseInt(customTime) : 30;
    if (finalTime < 1 || finalTime > 120) { setAlertMessage('출석 시간은 1분에서 120분 사이로 설정해주세요.'); return; }
    const code = presetCode || generateAttendanceCode(); setAttendanceCode(code); setTimeLeft(finalTime * 60); setAttendanceOpen({ ...attendanceOpen, [selectedActivity.id]: true }); const interval = setInterval(() => { setTimeLeft((prev) => { if (prev <= 1) { clearInterval(interval); setAttendanceOpen(prevOpen => ({ ...prevOpen, [selectedActivity.id]: false })); setShowAttendanceModal(false); setShowTimeEndModal(true); return 0; } return prev - 1; }); }, 1000); setTimeInterval(interval);
  };
  const handleCloseAttendance = (activityId) => { setAttendanceOpen(prev => ({ ...prev, [activityId]: false })); setShowAttendanceModal(false); setSelectedActivity(null); setAttendanceCode(''); setTimeLeft(0); setCustomTime(''); setPresetCode(''); if (timeInterval) { clearInterval(timeInterval); setTimeInterval(null); } };
  const handleExtendTime = (additionalMinutes) => { setTimeLeft((prev) => prev + additionalMinutes * 60); };
  const handleExtendFromEndModal = (additionalMinutes) => { setTimeLeft(additionalMinutes * 60); setAttendanceOpen(prev => ({ ...prev, [selectedActivity.id]: true })); setShowTimeEndModal(false); setShowAttendanceModal(true); const interval = setInterval(() => { setTimeLeft((prev) => { if (prev <= 1) { clearInterval(interval); setAttendanceOpen(prevOpen => ({ ...prevOpen, [selectedActivity.id]: false })); setShowAttendanceModal(false); setShowTimeEndModal(true); return 0; } return prev - 1; }); }, 1000); setTimeInterval(interval); };
  const handleFinalClose = () => { setShowTimeEndModal(false); setSelectedActivity(null); setAttendanceCode(''); setTimeLeft(0); setCustomTime(''); if (timeInterval) { clearInterval(timeInterval); setTimeInterval(null); } };
  const handlePresetCodeInput = (digit) => { if (presetCode.length < 4) { setPresetCode(presetCode + digit); } };
  const handlePresetCodeDelete = () => { setPresetCode(presetCode.slice(0, -1)); };
  const handleGeneratePresetCode = () => { const randomCode = generateAttendanceCode(); setPresetCode(randomCode); };

  const handleOpenProfileEdit = () => { setEditForm(userProfile); setShowProfileEditModal(true); };

  // ❗ 3. 프로필 저장 핸들러 (API 연동)
  const handleSaveProfile = async () => {
    // '10기' -> 10, '기수 정보 없음' -> null
    const cohortNumber = parseInt(editForm.grade.replace('기', ''), 10);
    const requestBody = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      department: editForm.major,
      cohort: isNaN(cohortNumber) ? null : cohortNumber,
      introduce: editForm.introduction,
      interesting: editForm.interests, // API 스펙에 맞는 key 'interesting' 사용
    };

    try {
      await axiosInstance.put('/api/member/me', requestBody);
      setUserProfile(editForm); // 상태 업데이트
      setShowProfileEditModal(false); // 모달 닫기
      setAlertMessage('프로필이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      setAlertMessage('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // ❗ 4. 관심분야 선택/해제 핸들러
  const handleToggleInterest = (interestKey) => {
    setEditForm(prev => {
      const isSelected = prev.interests.includes(interestKey);
      const newInterests = isSelected
        ? prev.interests.filter(item => item !== interestKey) // 있으면 제거
        : [...prev.interests, interestKey]; // 없으면 추가
      return { ...prev, interests: newInterests };
    });
  };

  if (isLoading) { return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><i className="ri-loader-4-line text-3xl text-gray-400 animate-spin mb-4"></i><p className="text-gray-500">마이페이지 정보를 불러오는 중...</p></div></div>); }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="마이페이지"
        unreadCount={unreadCount}
        isLoggedIn={isLoggedIn}
        onNotificationClick={() => {
          if (!isLoggedIn) { setAlertMessage('로그인이 필요한 서비스입니다.'); navigate('/login'); return; }
          setShowNotificationModal(true);
        }}
      >
        {isLoggedIn && (
          <div className="flex space-x-2">
            <button onClick={() => setActiveTab('profile')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>내 프로필</button>
            <button onClick={() => setActiveTab('opened')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'opened' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>개설목록</button>
            <button onClick={() => setActiveTab('applied')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'applied' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>신청목록</button>
          </div>
        )}
      </Header>

      <div className="px-4 py-4">
        {isLoggedIn ? (
          <>
            {activeTab === 'profile' && (<div className="space-y-6"> <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"> <div className="flex items-start justify-between mb-6"> <div className="flex items-center space-x-4"> <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center"> <span className="text-xl font-bold text-blue-700">{userProfile.name.charAt(0)}</span> </div> <div> <h2 className="text-xl font-bold text-gray-900">{userProfile.name}</h2> <p className="text-gray-600">{userProfile.major} {userProfile.grade}</p> </div> </div> <button onClick={handleOpenProfileEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"> 편집 </button> </div> <div className="space-y-4"> <div className="grid grid-cols-1 gap-4"> <div> <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label> <p className="text-gray-900">{userProfile.email}</p> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label> <p className="text-gray-900">{userProfile.phone}</p> </div> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label> <p className="text-gray-900 leading-relaxed">{userProfile.introduction}</p> </div> <div> <label className="block text-sm font-medium text-gray-700 mb-2">관심분야</label> <div className="flex flex-wrap gap-2"> {userProfile.interests && userProfile.interests.length > 0 ? (userProfile.interests.map((interestKey) => { const interestObj = INTEREST_CATEGORIES.find(cat => cat.key === interestKey); return (<span key={interestKey} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"> {interestObj ? interestObj.label : interestKey} </span>); })) : (<span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium"> 관심분야를 등록해주세요. </span>)} </div> </div> </div> </div> <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"> <h3 className="text-lg font-semibold text-gray-900 mb-4">활동 통계</h3> <div className="grid grid-cols-2 gap-4"> <div className="text-center p-4 bg-blue-50 rounded-lg"> <div className="text-2xl font-bold text-blue-600 mb-1">{myOpenedActivities.length}</div> <div className="text-sm text-gray-600">개설한 활동</div> </div> <div className="text-center p-4 bg-green-50 rounded-lg"> <div className="text-2xl font-bold text-green-600 mb-1">{myAppliedActivities.length}</div> <div className="text-sm text-gray-600">참여한 활동</div> </div> </div> </div> </div>)}
            {activeTab === 'opened' && (
              <div className="space-y-4">
                {myOpenedActivities.length === 0 ? (<div className="text-center py-12">
                  <i className="ri-folder-open-line text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 mb-4">개설한 활동이 없습니다.</p> <Link to="/create-activity" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    <i className="ri-add-line mr-2"></i> 활동 만들기 </Link>
                </div>) : (
                  myOpenedActivities.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="block">
                        <div onClick={() => { navigate(`/activity/${activity.id}?edit=true`) }} className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>멤버: {activity.members}/{activity.maxMembers}명</span>
                              {activity.applicants > 0 && (<span className="text-orange-600 font-medium">신청자: {activity.applicants}명</span>)}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>{activity.status}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => handleShowApplicants(e, activity)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">신청자 보기</button>
                        {(() => {
                          switch (activity.status) {
                            case '진행 중':
                              return (
                                <button onClick={() => handleEndActivity(activity.id)} className="flex-1 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200">
                                  신청 마감
                                </button>
                              );
                            case '마감':
                              return (
                                <button onClick={() => handleDeleteActivity(activity.id, activity.status)} className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
                                  활동 삭제
                                </button>
                              );
                            case '승인 대기':
                              return (
                                <button onClick={() => handleDeleteActivity(activity.id, activity.status)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                                  개설 취소
                                </button>
                              );
                            default:
                              return null;
                          }
                        })()}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAlertMessage(`더보기 메뉴: ${activity.title}`);
                          }}
                          className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          aria-label="더 보기"
                        >
                          <i className="ri-more-2-line"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === 'applied' && (<div className="space-y-4"> {myAppliedActivities.length === 0 ? (<div className="text-center py-12"> <i className="ri-file-list-line text-4xl text-gray-300 mb-4"></i> <p className="text-gray-500 mb-4">신청한 활동이 없습니다.</p> <Link to="/home" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"> 활동 둘러보기 </Link> </div>) : (myAppliedActivities.map((activity) => (<div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div onClick={() => { navigate(`/activity/${activity.id}?edit=true`) }} className="block">
                <div className="flex items-start justify-between mb-3"> <div className="flex-1"> <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3> <p className="text-sm text-gray-600 mb-2">팀장: {activity.leader}</p> <div className="space-y-2 text-sm text-gray-600"> <div className="flex items-center"> <i className="ri-calendar-line mr-2"></i> <span>{activity.schedule}</span> </div> <div className="flex items-center"> <i className="ri-map-pin-line mr-2"></i> <span>{activity.location}</span> </div> </div> <div className="mt-3"> <div className="flex items-center justify-between mb-2"> <div className="flex items-center text-sm text-gray-600"> <i className="ri-group-line mr-2"></i> <span>참여 인원: {activity.members}/{activity.maxMembers}명</span> </div> <span className="text-sm text-gray-500">{Math.round((activity.members / activity.maxMembers) * 100)}%</span> </div> <div className="w-full bg-gray-200 rounded-full h-2"> <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(activity.members / activity.maxMembers) * 100}%` }}></div> </div> </div> </div> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>{activity.status}</span> </div>
              </div>
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}> {activity.canCancel && (<button onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                openConfirm({
                  message: '정말로 이 활동 신청을 취소하시겠습니까?',
                  confirmText: '취소하기',
                  cancelText: '닫기',
                  onConfirm: async () => {
                    try {
                      // TODO: 실제 취소 API 호출이 있다면 여기에 추가
                      setAlertMessage('활동 신청이 취소되었습니다.');
                    } catch (e) {
                      setAlertMessage('신청 취소 중 오류가 발생했습니다.');
                    } finally {
                      closeConfirm();
                    }
                  }
                });
              }
              } className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"> 취소하기 </button>)} </div> </div>)))} </div>)}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-3xl text-gray-500"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">로그인이 필요한 서비스입니다</h2>
            <p className="text-gray-600 mb-6">로그인하고 모든 활동에 참여해보세요!</p>
            <button onClick={() => navigate('/login')} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              로그인 페이지로 이동
            </button>
          </div>
        )}
      </div>

      {showNotificationModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"> <div className="px-6 py-4 border-b border-gray-100"> <div className="flex items-center justify-between"> <h3 className="text-lg font-semibold text-gray-900">알림</h3> <button onClick={() => setShowNotificationModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" > <i className="ri-close-line text-gray-600"></i> </button> </div> </div> <div className="flex-1 overflow-y-auto"> {notificationList.length === 0 ? (<div className="text-center py-12"> <i className="ri-notification-off-line text-4xl text-gray-300 mb-4"></i> <p className="text-gray-500">새로운 알림이 없습니다.</p> </div>) : (<div className="divide-y divide-gray-100"> {notificationList.map((notification) => (<div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`} > <div className="flex items-start space-x-3"> <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}> <i className={`${getNotificationIcon(notification.type)} text-lg`}></i> </div> <div className="flex-1 min-w-0"> <div className="flex items-center justify-between mb-1"> <h4 className="font-medium text-gray-900 truncate">{notification.title}</h4> {!notification.isRead && (<div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>)} </div> <p className="text-sm text-gray-600 mb-1">{notification.message}</p> <p className="text-xs text-gray-500">{notification.time}</p> </div> <button onClick={() => dismissNotification(notification.id)} className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" aria-label="알림 삭제" > <i className="ri-close-line text-lg"></i> </button> </div> </div>))} </div>)} </div> {notificationList.length > 0 && (<div className="px-6 py-4 bg-gray-50 border-t border-gray-100"> <button onClick={() => { dismissAllNotifications(); setShowNotificationModal(false); }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors" > 모든 알림 지우기 </button> </div>)} </div> </div>)}

      {showApplicantsModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">신청자 목록</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedActivity.title}</p>
                </div>
                <button onClick={() => setShowApplicantsModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>
            </div>
            <div className="px-6 py-3 bg-blue-50">
              <div className="flex items-center justify-center space-x-2">
                <i className="ri-group-line text-blue-600"></i>
                <span className="text-sm font-medium text-blue-700">총 {selectedActivity.applicants}명의 신청자</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedActivity.applicantsList || selectedActivity.applicantsList.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-user-line text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">신청자가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedActivity.applicantsList.map((applicant) => (
                    <div key={applicant.email} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700"> {applicant.name.charAt(0)} </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{applicant.name}</h4>
                            <p className="text-sm text-gray-600">{applicant.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleRemoveApplicant(applicant.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200">거절</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={() => setShowApplicantsModal(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors" >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {showAttendanceModal && selectedActivity && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"> <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto"> {!attendanceOpen[selectedActivity.id] ? (<> <div className="text-center mb-6"> <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 설정</h3> <p className="text-sm text-gray-600">{selectedActivity.title}</p> </div> <div className="mb-6"> <label className="block text-sm font-medium text-gray-700 mb-2">출석 가능 시간 (분)</label> <input type="number" min="1" max="120" value={customTime} onChange={(e) => setCustomTime(e.target.value)} placeholder="30" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" /> <p className="text-xs text-gray-500 text-center mt-1"> 1분 ~ 120분 사이로 입력해주세요 (기본: 30분) </p> </div> <div className="mb-6"> <p className="text-sm font-medium text-gray-700 mb-2">빠른 선택</p> <div className="grid grid-cols-4 gap-2"> {[5, 10, 15, 30].map((minutes) => (<button key={minutes} onClick={() => setCustomTime(minutes.toString())} className={`py-2 px-3 text-sm rounded-lg border transition-colors ${customTime === minutes.toString() ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`} > {minutes}분 </button>))} </div> </div> <div className="mb-6"> <div className="flex items-center justify-between mb-3"> <label className="text-sm font-medium text-gray-700">출석 코드 설정</label> <button onClick={handleGeneratePresetCode} className="text-blue-600 text-xs font-medium flex items-center space-x-1 hover:text-blue-700" > <i className="ri-refresh-line"></i> <span>랜덤 생성</span> </button> </div> <div className="flex justify-center space-x-2 mb-4"> {[0, 1, 2, 3].map((index) => (<div key={index} className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center"> <span className="text-xl font-bold text-gray-700">{presetCode[index] || ''}</span> </div>))} </div> <div className="grid grid-cols-3 gap-2 mb-3"> {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (<button key={digit} onClick={() => handlePresetCodeInput(digit.toString())} className="h-10 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors" > {digit} </button>))} <div></div> <button onClick={() => handlePresetCodeInput('0')} className="h-10 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors" > 0 </button> <button onClick={handlePresetCodeDelete} className="h-10 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" > <i className="ri-delete-back-line text-lg"></i> </button> </div> <p className="text-xs text-gray-500 text-center">코드를 설정하지 않으면 자동으로 생성됩니다</p> </div> <div className="flex space-x-3"> <button onClick={() => setShowAttendanceModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium" > 취소 </button> <button onClick={handleStartAttendance} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"> 출석 시작 </button> </div> </>) : (<> <div className="text-center mb-6"> <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 코드</h3> <p className="text-sm text-gray-600">{selectedActivity.title}</p> </div> <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center"> <div className="flex items-center justify-center mb-4"> <div className="flex space-x-2 justify-center"> {attendanceCode.split('').map((digit, index) => (<div key={index} className="w-12 h-12 bg-white rounded-lg flex items-center justify-center"> <span className="text-2xl font-bold text-blue-600">{digit}</span> </div>))} </div> </div> <p className="text-sm text-gray-600">멤버들에게 이 코드를 알려주세요</p> </div> <div className="bg-orange-50 rounded-lg p-3 mb-4 text-center"> <div className="flex items-center justify-center space-x-2 mb-2"> <i className="ri-time-line text-orange-600"></i> <span className="text-sm text-orange-700">남은 시간</span> </div> <div className="text-2xl font-bold text-orange-600">{formatTimeLeft(timeLeft)}</div> {timeLeft <= 300 && timeLeft > 0 && <p className="text-xs text-orange-600 mt-1">출석 마감이 임박했습니다!</p>} </div> {timeLeft > 0 && (<div className="mb-6"> <div className="grid grid-cols-3 gap-2"> {[5, 10, 15].map((minutes) => (<button key={minutes} onClick={() => handleExtendTime(minutes)} className="py-1 px-2 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200" > +{minutes}분 </button>))} </div> </div>)} <div className="flex space-x-3"> <button onClick={() => handleCloseAttendance(selectedActivity.id)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium" > 출석 종료 </button> </div> </>)} </div> </div>)}
      {showTimeEndModal && selectedActivity && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"> <div className="text-center mb-6"> <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"> <i className="ri-time-line text-2xl text-orange-600"></i> </div> <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 시간 종료</h3> <p className="text-sm text-gray-600">{selectedActivity.title}</p> </div> <div className="mb-6"> <h4 className="text-sm font-medium text-gray-700 mb-3">추가 시간 설정</h4> <div className="grid grid-cols-4 gap-2 mb-3"> {[5, 10, 15, 30].map((minutes) => (<button key={minutes} onClick={() => handleExtendFromEndModal(minutes)} className="py-2 px-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors" > +{minutes}분 </button>))} </div> <p className="text-xs text-gray-500 text-center">시간을 연장하면 출석이 다시 시작됩니다</p> </div> <div className="flex space-x-3"> <button onClick={handleFinalClose} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"> 출석 완료 </button> </div> </div> </div>)}

      {/* ❗ 5. 프로필 편집 모달 UI 수정 */}
      {showProfileEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">프로필 편집</h3>
                <button onClick={() => setShowProfileEditModal(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">이름</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">이메일</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">전공</label><input type="text" value={editForm.major} onChange={(e) => setEditForm({ ...editForm, major: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">기수</label><input type="text" value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} placeholder="예: 10기" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label><textarea value={editForm.introduction} onChange={(e) => setEditForm({ ...editForm, introduction: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="자신을 소개해보세요..." /></div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">관심분야 (선택)</label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_CATEGORIES.map((category) => {
                    const isSelected = editForm.interests.includes(category.key);
                    return (
                      <button
                        key={category.key}
                        onClick={() => handleToggleInterest(category.key)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex space-x-3">
              <button onClick={() => setShowProfileEditModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleSaveProfile} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">저장</button>
            </div>
          </div>
        </div>
      )}

      <TabBar />

      {/* === 공통 Alert / Confirm 모달 === */}
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
      {confirmConfig.open && (
        <Confirm
          message={confirmConfig.message}
          onCancel={() =>
            setConfirmConfig((c) => ({ ...c, open: false, onConfirm: null }))
          }
          onConfirm={() => {
            const fn = confirmConfig.onConfirm;
            setConfirmConfig((c) => ({ ...c, open: false, onConfirm: null }));
            if (typeof fn === 'function') fn();
          }}
        />
      )}
    </div>
  );
}

