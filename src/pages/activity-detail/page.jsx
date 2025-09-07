import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Alert from '../../components/common/Alert';

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 상태 변수
  const [activity, setActivity] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // 현재 로그인한 유저 정보
  const [isApplied, setIsApplied] = useState(false);

  // 모달 상태
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 알림 상태
  const [alertMessage, setAlertMessage] = useState(null);

  // 헬퍼 함수: API 데이터를 프론트엔드 상태에 맞게 변환
  const mapApiDataToState = (apiActivity) => {
    const categoryMap = { SESSION: '세션', STUDY: '스터디', PROJECT: '프로젝트', MEETING: '소모임', GENERAL: '행사' };
    const statusMap = { NOT_STARTED: '모집 중', STARTED: '진행 중', ENDED: '마감' };
    const formatRecurringSchedule = (schedules) => { if (!schedules || schedules.length === 0) return '일정 정보 없음'; const dayMap = { MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목', FRIDAY: '금', SATURDAY: '토', SUNDAY: '일' }; const days = schedules.map(s => dayMap[s.dayOfWeek] || '').join('/'); const time = schedules[0].startTime.substring(0, 5); return `매주 ${days} ${time}`; };
    const formatEventSchedule = (schedules) => { if (!schedules || schedules.length === 0) return '일정 정보 없음'; const firstEvent = new Date(schedules[0].startDateTime); const month = firstEvent.getMonth() + 1; const day = firstEvent.getDate(); const hours = firstEvent.getHours().toString().padStart(2, '0'); const minutes = firstEvent.getMinutes().toString().padStart(2, '0'); return `${month}월 ${day}일 ${hours}:${minutes}`; };
    let scheduleText = '';
    const recurringTypes = ['SESSION', 'STUDY', 'PROJECT'];
    if (recurringTypes.includes(apiActivity.activityType)) { scheduleText = formatRecurringSchedule(apiActivity.recurringSchedules); } else { scheduleText = formatEventSchedule(apiActivity.eventSchedule); }
    return {
      id: apiActivity.id,
      title: apiActivity.title,
      leader: apiActivity.createdBy,
      leaderId: apiActivity.creatorId,
      currentMembers: apiActivity.participantCount,
      maxMembers: apiActivity.maxParticipants,
      schedule: scheduleText,
      category: categoryMap[apiActivity.activityType] || apiActivity.activityType,
      description: apiActivity.description,
      status: statusMap[apiActivity.activityStatus] || '상태 미지정',
      goal: apiActivity.goal || "활동 목표가 설정되지 않았습니다.",
      location: apiActivity.location || "장소 정보 없음",
      notes: apiActivity.notes || "유의사항이 없습니다.",
      curriculum: apiActivity.curriculums ? apiActivity.curriculums.map(c => ({ week: c.sequence, title: c.title, content: c.description })) : [],
      rawData: apiActivity,
    };
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 3가지 API를 동시에 호출: 활동 상세, 내 신청 목록, 내 정보
        const [detailRes, appliedRes, userRes] = await Promise.all([
          axiosInstance.get(`/api/activities/${id}`),
          axiosInstance.get('/api/me/activity/participate'),
          axiosInstance.get('/api/member/me') // (백엔드 경로가 /check/me 라면 여기를 수정)
        ]);

        setActivity(mapApiDataToState(detailRes.data));
        setCurrentUser(userRes.data);

        if (appliedRes.data && Array.isArray(appliedRes.data.content)) {
          const isUserApplied = appliedRes.data.content.some((applied) => applied.id.toString() === id);
          setIsApplied(isUserApplied);
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        // 로그인이 안된 상태(401) 등으로 userRes만 실패한 경우, 활동 정보는 계속 보여줌
        if (error.response?.status !== 401) {
          setActivity(undefined);
        } else {
          try {
            const detailRes = await axiosInstance.get(`/api/activities/${id}`);
            setActivity(mapApiDataToState(detailRes.data));
          } catch (detailError) {
            setActivity(undefined);
          }
        }
      }
    };
    fetchAllData();
  }, [id]);

  const handleApply = () => { if (activity.status !== '마감') setShowApplyModal(true); };
  const confirmApply = async () => {
    try {
      await axiosInstance.post(`/api/activities/${id}/participant`);
      setShowApplyModal(false);
      setAlertMessage('활동 신청이 완료되었습니다!'); // 알림
      setActivity(prev => ({ ...prev, currentMembers: prev.currentMembers + 1 }));
      navigate("/")
    } catch (error) {
      setShowApplyModal(false);
      setAlertMessage(error.response?.data?.message || '활동 신청에 실패했습니다.');
    }
  };

  const handleCancel = () => setShowCancelModal(true);
  const confirmCancel = async () => {
    try {
      await axiosInstance.delete(`/api/activities/${id}/participant`);
      setShowCancelModal(false);
      setAlertMessage('활동 신청이 취소되었습니다.');
      setIsApplied(false);
      setActivity(prev => ({ ...prev, currentMembers: prev.currentMembers - 1 }));
    } catch (error) {
      setShowCancelModal(false);
      setAlertMessage(error.response?.data?.message || '신청 취소에 실패했습니다.');
    }
  };

  const handleEdit = () => navigate(`/create-activity`, { state: { activityData: activity.rawData } });

  if (activity === null) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><i className="ri-loader-4-line text-3xl text-gray-400 animate-spin mb-4"></i><p className="text-gray-500">활동을 불러오는 중...</p></div></div>);
  if (activity === undefined) return (<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><h2 className="text-xl font-semibold text-gray-800">활동을 찾을 수 없습니다.</h2><button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">홈으로 돌아가기</button></div>);

  // const isOwner = currentUser && activity && currentUser.name === activity.leader;
  const isOwner = currentUser && activity && currentUser.id === activity.leaderId;

  const getCategoryColor = (category) => ({ '세션': 'bg-blue-100 text-blue-700', '스터디': 'bg-green-100 text-green-700', '프로젝트': 'bg-purple-100 text-purple-700', '소모임': 'bg-orange-100 text-orange-700', '행사': 'bg-red-100 text-red-700' }[category] || 'bg-gray-100 text-gray-700');
  const getStatusColor = (status) => ({ '모집 중': 'bg-green-100 text-green-700', '진행 중': 'bg-blue-100 text-blue-700', '마감': 'bg-red-100 text-red-700' }[status] || 'bg-gray-100 text-gray-700');
  const participationRate = (activity.maxMembers > 0) ? (activity.currentMembers / activity.maxMembers) * 100 : 0;
  const showCurriculum = ['세션', '스터디', '프로젝트'].includes(activity.category);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center"><i className="ri-arrow-left-line text-xl text-gray-700"></i></button>
          <h1 className="text-lg font-semibold text-gray-900 truncate px-2">{activity.title}</h1>
          <div className="w-8 h-8"></div>
        </div>
      </header>
      <main className="p-4 space-y-4">
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{activity.title}</h2>
          <div className="flex items-center space-x-2 mb-4"><span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(activity.category)}`}>{activity.category}</span><span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>{activity.status}</span></div>
          <div className="space-y-4">
            <div><h3 className="font-semibold text-gray-800 mb-1">활동 소개</h3><p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{activity.description}</p></div>
            <div><h3 className="font-semibold text-gray-800 mb-1">활동 목표</h3><p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{activity.goal}</p></div>
            <div><h3 className="font-semibold text-gray-800 mb-1">유의사항</h3><p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{activity.notes}</p></div>
          </div>
        </section>
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">활동 정보</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-gray-600">팀장</span><span className="font-medium text-gray-900">{activity.leader}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-600">진행 일정</span><span className="font-medium text-gray-900">{activity.schedule}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-600">진행 장소</span><span className="font-medium text-gray-900">{activity.location}</span></div>
            <div>
              <div className="flex items-center justify-between mb-2"><span className="text-gray-600">참여 인원</span><span className="font-medium text-gray-900">{activity.currentMembers}/{activity.maxMembers}명</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${participationRate}%` }}></div></div>
            </div>
          </div>
        </section>
        {showCurriculum && activity.curriculum.length > 0 && (
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">주차별 계획</h3>
            <div className="space-y-4">{activity.curriculum.map((item) => (<div key={item.week} className="p-4 bg-gray-50 rounded-lg"><h4 className="font-bold text-blue-600 mb-1">{item.week}주차: {item.title}</h4><p className="text-sm text-gray-700 whitespace-pre-wrap">{item.content}</p></div>))}</div>
          </section>
        )}
        <div className="pt-2">
          {isOwner ? (<button onClick={handleEdit} className="w-full py-3 rounded-lg font-semibold transition-colors bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"><i className="ri-pencil-line mr-2"></i>편집하기</button>) : isApplied ? (<button onClick={handleCancel} className="w-full py-3 rounded-lg font-semibold transition-colors bg-red-100 text-red-700 hover:bg-red-200">신청 취소하기</button>) : (<button onClick={handleApply} disabled={activity.status === '마감'} className={`w-full py-3 rounded-lg font-semibold transition-colors ${activity.status === '마감' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{activity.status === '마감' ? '모집 마감' : '신청하기'}</button>)}
        </div>
      </main>
      {showApplyModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center"><div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-question-line text-2xl text-blue-600"></i></div><h3 className="text-lg font-semibold text-gray-900 mb-2">활동 신청</h3><p className="text-gray-600">'{activity.title}'에 신청하시겠습니까?</p><div className="flex space-x-3 mt-6"><button onClick={() => setShowApplyModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">취소</button><button onClick={confirmApply} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">신청하기</button></div></div></div>)}
      {showCancelModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center"><div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-error-warning-line text-2xl text-red-600"></i></div><h3 className="text-lg font-semibold text-gray-900 mb-2">신청 취소</h3><p className="text-gray-600">'{activity.title}' 활동 신청을 취소하시겠습니까?</p><div className="flex space-x-3 mt-6"><button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">유지하기</button><button onClick={confirmCancel} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium">취소하기</button></div></div></div>)}
    </div>
  );
}