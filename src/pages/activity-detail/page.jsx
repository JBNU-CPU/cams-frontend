import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false); // 1. 취소 확인 모달 상태 추가

  // 2. 현재 사용자가 이 활동에 신청했는지 여부를 저장하는 상태
  const [isApplied, setIsApplied] = useState(false);

  // --- 데이터 매핑 헬퍼 함수들 (변경 없음) ---
  const formatRecurringSchedule = (schedules) => { if (!schedules || schedules.length === 0) return '일정 정보 없음'; const dayMap = { MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수', THURSDAY: '목', FRIDAY: '금', SATURDAY: '토', SUNDAY: '일' }; const days = schedules.map(s => dayMap[s.dayOfWeek] || '').join('/'); const time = schedules[0].startTime.substring(0, 5); return `매주 ${days} ${time}`; };
  const formatEventSchedule = (schedules) => { if (!schedules || schedules.length === 0) return '일정 정보 없음'; const firstEvent = new Date(schedules[0].startDateTime); const month = firstEvent.getMonth() + 1; const day = firstEvent.getDate(); const hours = firstEvent.getHours().toString().padStart(2, '0'); const minutes = firstEvent.getMinutes().toString().padStart(2, '0'); return `${month}월 ${day}일 ${hours}:${minutes}`; };
  const mapApiDataToState = (apiActivity) => { const categoryMap = { SESSION: '세션', STUDY: '스터디', PROJECT: '프로젝트', MEETING: '소모임', GENERAL: '행사' }; const statusMap = { NOT_STARTED: '모집 중', STARTED: '진행 중', ENDED: '마감' }; let scheduleText = ''; const recurringTypes = ['SESSION', 'STUDY', 'PROJECT']; if (recurringTypes.includes(apiActivity.activityType)) { scheduleText = formatRecurringSchedule(apiActivity.recurringSchedules); } else { scheduleText = formatEventSchedule(apiActivity.eventSchedules); } return { id: apiActivity.id, title: apiActivity.title, leader: apiActivity.createdBy, currentMembers: apiActivity.participantCount, maxMembers: apiActivity.maxParticipants, schedule: scheduleText, category: categoryMap[apiActivity.activityType] || apiActivity.activityType, description: apiActivity.description, status: statusMap[apiActivity.activityStatus] || '상태 미지정', goal: apiActivity.goal || "활동 목표가 설정되지 않았습니다.", location: apiActivity.location || "장소 정보 없음", notes: apiActivity.notes || "유의사항이 없습니다.", curriculum: apiActivity.curriculums ? apiActivity.curriculums.map(c => ({ week: c.sequence, title: c.title, content: c.description, })) : [], }; };

  // 3. useEffect에서 활동 상세 정보와 '내가 신청한 활동 목록'을 함께 불러옵니다.
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const [detailRes, appliedRes] = await Promise.all([
          axiosInstance.get(`/api/activities/${id}`),
          axiosInstance.get('/api/me/activity/participate') // 내가 신청한 활동 목록 API
        ]);

        const formattedData = mapApiDataToState(detailRes.data);
        setActivity(formattedData);

        // 불러온 '신청 목록'에 현재 페이지의 활동 ID가 있는지 확인합니다.
        if (appliedRes.data && Array.isArray(appliedRes.data.content)) {
          const isUserApplied = appliedRes.data.content.some(
            (appliedActivity) => appliedActivity.id.toString() === id
          );
          setIsApplied(isUserApplied);
        }
      } catch (error) {
        console.error("활동 데이터 로딩 실패:", error);
        setActivity(undefined);
      }
    };
    fetchActivityData();
  }, [id]);

  // 로딩 및 에러 처리 (변경 없음)
  if (activity === null) { return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><i className="ri-loader-4-line text-3xl text-gray-400 animate-spin mb-4"></i><p className="text-gray-500">활동을 불러오는 중...</p></div></div>); }
  if (activity === undefined) { return (<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><h2 className="text-xl font-semibold text-gray-800">활동을 찾을 수 없습니다.</h2><button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">홈으로 돌아가기</button></div>); }

  const getCategoryColor = (category) => { const colors = { '세션': 'bg-blue-100 text-blue-700', '스터디': 'bg-green-100 text-green-700', '프로젝트': 'bg-purple-100 text-purple-700', '소모임': 'bg-orange-100 text-orange-700', '행사': 'bg-red-100 text-red-700' }; return colors[category] || 'bg-gray-100 text-gray-700'; };
  const getStatusColor = (status) => { const colors = { '모집 중': 'bg-green-100 text-green-700', '진행 중': 'bg-blue-100 text-blue-700', '마감': 'bg-red-100 text-red-700' }; return colors[status] || 'bg-gray-100 text-gray-700'; };
  const participationRate = (activity.currentMembers / activity.maxMembers) * 100;
  const showCurriculum = ['세션', '스터디', '프로젝트'].includes(activity.category);

  const handleApply = () => { if (activity.status === '마감') return; setShowApplyModal(true); };
  const confirmApply = async () => {
    try {
      await axiosInstance.post(`/api/activities/${id}/participant`);
      setShowApplyModal(false);
      alert('활동 신청이 완료되었습니다!');
      setIsApplied(true); // 상태를 '신청됨'으로 변경
      setActivity(prev => ({ ...prev, currentMembers: prev.currentMembers + 1 }));
    } catch (error) {
      console.error("활동 신청에 실패했습니다.", error);
      setShowApplyModal(false);
      alert('활동 신청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 4. 신청 취소 핸들러 함수들 추가
  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      // DELETE 메서드로 신청 취소 API를 호출합니다.
      await axiosInstance.delete(`/api/activities/${id}/participant`);
      setShowCancelModal(false);
      alert('활동 신청이 취소되었습니다.');
      setIsApplied(false); // 상태를 '신청 안 됨'으로 변경
      setActivity(prev => ({ ...prev, currentMembers: prev.currentMembers - 1 }));
    } catch (error) {
      console.error("신청 취소에 실패했습니다.", error);
      setShowCancelModal(false);
      alert('신청 취소에 실패했습니다.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center"><i className="ri-arrow-left-line text-xl text-gray-700"></i></button>
          <h1 className="text-lg font-semibold text-gray-900 truncate px-2">{activity.title}</h1>
          <div className="w-8 h-8"></div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* ... (기본 정보, 활동 정보, 커리큘럼 JSX는 이전과 동일) ... */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"> <div className="flex items-start justify-between mb-4"> <div className="flex-1"> <h2 className="text-2xl font-bold text-gray-900 mb-2">{activity.title}</h2> <div className="flex items-center space-x-2 mb-4"> <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(activity.category)}`}>{activity.category}</span> <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>{activity.status}</span> </div> </div> </div> <div className="space-y-4"> <div> <h3 className="font-semibold text-gray-800 mb-1">활동 소개</h3> <p className="text-gray-600 leading-relaxed">{activity.description}</p> </div> <div> <h3 className="font-semibold text-gray-800 mb-1">활동 목표</h3> <p className="text-gray-600 leading-relaxed">{activity.goal}</p> </div> <div> <h3 className="font-semibold text-gray-800 mb-1">유의사항</h3> <p className="text-gray-600 leading-relaxed">{activity.notes}</p> </div> </div> </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"> <h3 className="font-semibold text-gray-900 mb-3">활동 정보</h3> <div className="space-y-4"> <div className="flex items-center justify-between"><span className="text-gray-600">팀장</span><span className="font-medium text-gray-900">{activity.leader}</span></div> <div className="flex items-center justify-between"><span className="text-gray-600">진행 일정</span><span className="font-medium text-gray-900">{activity.schedule}</span></div> <div className="flex items-center justify-between"><span className="text-gray-600">진행 장소</span><span className="font-medium text-gray-900">{activity.location}</span></div> <div> <div className="flex items-center justify-between mb-2"><span className="text-gray-600">참여 인원</span><span className="font-medium text-gray-900">{activity.currentMembers}/{activity.maxMembers}명</span></div> <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${participationRate}%` }}></div></div> <div className="flex justify-between text-sm text-gray-500 mt-1"><span>현재 {participationRate.toFixed(0)}% 참여</span><span>{activity.maxMembers - activity.currentMembers}명 남음</span></div> </div> </div> </div>
        {showCurriculum && activity.curriculum.length > 0 && (<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"> <h3 className="font-semibold text-gray-900 mb-4">주차별 계획</h3> <div className="space-y-4"> {activity.curriculum.map((item) => (<div key={item.week} className="p-4 bg-gray-50 rounded-lg"> <h4 className="font-bold text-blue-600 mb-1">{item.week}주차: {item.title}</h4> <p className="text-sm text-gray-700">{item.content}</p> </div>))} </div> </div>)}

        {/* 5. isApplied 상태에 따라 다른 버튼을 렌더링 */}
        <div className="pt-2">
          {isApplied ? (
            <button
              onClick={handleCancel}
              className="w-full py-3 rounded-lg font-semibold transition-colors bg-red-100 text-red-700 hover:bg-red-200"
            >
              신청 취소하기
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={activity.status === '마감'}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${activity.status === '마감'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {activity.status === '마감' ? '모집 마감' : '신청하기'}
            </button>
          )}
        </div>
      </div>

      {/* 신청 확인 모달 (변경 없음) */}
      {showApplyModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center"> <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"> <i className="ri-question-line text-2xl text-blue-600"></i> </div> <h3 className="text-lg font-semibold text-gray-900 mb-2">활동 신청</h3> <p className="text-gray-600">'{activity.title}'에 신청하시겠습니까?</p> <div className="flex space-x-3 mt-6"> <button onClick={() => setShowApplyModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">취소</button> <button onClick={confirmApply} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">신청하기</button> </div> </div> </div>)}

      {/* 6. 신청 취소 확인 모달 추가 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">신청 취소</h3>
            <p className="text-gray-600">'{activity.title}' 활동 신청을 취소하시겠습니까?</p>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">유지하기</button>
              <button onClick={confirmCancel} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium">취소하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

