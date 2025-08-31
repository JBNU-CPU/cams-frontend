import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

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

  const mapApiDataToState = (apiActivity) => {
    const categoryMap = {
      SESSION: '세션', STUDY: '스터디', PROJECT: '프로젝트',
      MEETING: '소모임', GENERAL: '행사',
    };
    const statusMap = {
      NOT_STARTED: '모집 중', STARTED: '진행 중', ENDED: '마감',
    };

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
      currentMembers: apiActivity.participantCount,
      maxMembers: apiActivity.maxParticipants,
      schedule: scheduleText,
      category: categoryMap[apiActivity.activityType] || apiActivity.activityType,
      description: apiActivity.description,
      status: statusMap[apiActivity.activityStatus] || '상태 미지정',
      goal: apiActivity.goal || "활동 목표가 설정되지 않았습니다.",
      location: apiActivity.location || "장소 정보 없음",
      notes: apiActivity.notes || "유의사항이 없습니다.",
      // API 응답에서 curriculums가 null일 수 있으므로 안전하게 처리
      curriculum: apiActivity.curriculums ? apiActivity.curriculums.map(c => ({
        week: c.sequence,
        title: c.title,
        content: c.description,
      })) : [],
    };
  };

  useEffect(() => {
    const fetchActivityDetail = async () => {
      try {
        const response = await axiosInstance.get(`/api/activities/${id}`);
        console.log(response.data)
        const formattedData = mapApiDataToState(response.data);
        setActivity(formattedData);
      } catch (error) {
        console.error("활동 상세 정보를 불러오지 못했습니다.", error);
        setActivity(undefined); // 에러 발생 시 activity를 찾을 수 없는 상태로 설정
      }
    };

    fetchActivityDetail();
  }, [id]);

  // 로딩 상태 처리
  if (activity === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin mb-4"></i>
          <p className="text-gray-500">활동을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 데이터 없음(에러) 처리
  if (activity === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800">활동을 찾을 수 없습니다.</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    const colors = {
      '세션': 'bg-blue-100 text-blue-700', '스터디': 'bg-green-100 text-green-700',
      '프로젝트': 'bg-purple-100 text-purple-700', '소모임': 'bg-orange-100 text-orange-700',
      '행사': 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      '모집 중': 'bg-green-100 text-green-700', '진행 중': 'bg-blue-100 text-blue-700',
      '마감': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const participationRate = (activity.currentMembers / activity.maxMembers) * 100;
  // '소모임', '행사'는 커리큘럼을 보여주지 않도록 하는 로직
  const showCurriculum = ['세션', '스터디', '프로젝트'].includes(activity.category);

  const handleApply = () => {
    if (activity.status === '마감') return;
    setShowApplyModal(true);
  };

  const confirmApply = async () => {
    // 여기에 실제 신청 API 호출 로직 추가
    console.log(`Applying for activity ID: ${activity.id}`);
    setShowApplyModal(false);
    try {
      const response = await axiosInstance.post(`/api/activities/${id}/participant`);

      console.log('신청 성공:', response.data);

      // 2. API 요청이 성공한 후에 모달을 닫고 성공 메시지를 보여줍니다.
      setShowApplyModal(false);
      alert('활동 신청이 완료되었습니다!');

      // (선택사항) 신청 후 현재 인원을 1명 늘려서 화면에 바로 반영할 수 있습니다.
      setActivity(prev => ({
        ...prev,
        currentMembers: prev.currentMembers + 1
      }));
    } catch (error) {
      console.error("활동 신청에 실패했습니다.", error);

      // 3. 에러가 발생했을 때 사용자에게 알려줍니다.
      setShowApplyModal(false);
      // 서버에서 보내주는 에러 메시지가 있다면 그것을 사용하는 것이 더 좋습니다.
      // 예: alert(error.response.data.message);
      alert('활동 신청에 실패했습니다. 다시 시도해주세요.');
    }

  };

  console.log(activity.currentMembers)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate px-2">{activity.title}</h1>
          <div className="w-8 h-8"></div> {/* 중앙 정렬을 위한 더미 div */}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{activity.title}</h2>
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(activity.category)}`}>{activity.category}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>{activity.status}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">활동 소개</h3>
              <p className="text-gray-600 leading-relaxed">{activity.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">활동 목표</h3>
              <p className="text-gray-600 leading-relaxed">{activity.goal}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">유의사항</h3>
              <p className="text-gray-600 leading-relaxed">{activity.notes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">활동 정보</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><span className="text-gray-600">팀장</span><span className="font-medium text-gray-900">{activity.leader}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-600">진행 일정</span><span className="font-medium text-gray-900">{activity.schedule}</span></div>
            <div className="flex items-center justify-between"><span className="text-gray-600">진행 장소</span><span className="font-medium text-gray-900">{activity.location}</span></div>
            <div>
              <div className="flex items-center justify-between mb-2"><span className="text-gray-600">참여 인원</span><span className="font-medium text-gray-900">{activity.currentMembers}/{activity.maxMembers}명</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${participationRate}%` }}></div></div>
              <div className="flex justify-between text-sm text-gray-500 mt-1"><span>현재 {participationRate.toFixed(0)}% 참여</span><span>{activity.maxMembers - activity.currentMembers}명 남음</span></div>
            </div>
          </div>
        </div>

        {showCurriculum && activity.curriculum.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">주차별 계획</h3>
            <div className="space-y-4">
              {activity.curriculum.map((item) => (
                <div key={item.week} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-blue-600 mb-1">{item.week}주차: {item.title}</h4>
                  <p className="text-sm text-gray-700">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
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
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-question-line text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">활동 신청</h3>
            <p className="text-gray-600">'{activity.title}'에 신청하시겠습니까?</p>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowApplyModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">취소</button>
              <button onClick={confirmApply} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">신청하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

