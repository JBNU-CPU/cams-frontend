import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockActivities } from '../../mocks/activities';

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const foundActivity = mockActivities.find(a => a.id === id);
    if (foundActivity) {
      setActivity(foundActivity);
    }
  }, [id]);

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin mb-4"></i>
          <p className="text-gray-500">활동을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    const colors = {
      '세션': 'bg-blue-100 text-blue-700',
      '스터디': 'bg-green-100 text-green-700',
      '프로젝트': 'bg-purple-100 text-purple-700',
      '소모임': 'bg-orange-100 text-orange-700',
      '행사': 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      '진행 중': 'bg-green-100 text-green-700',
      '모집완료': 'bg-red-100 text-red-700',
      '승인 대기': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const participationRate = (activity.currentMembers / activity.maxMembers) * 100;
  const showCurriculum = ['세션', '스터디', '프로젝트'].includes(activity.category);

  const handleApply = () => {
    if (activity.currentMembers >= activity.maxMembers) return;
    setShowApplyModal(true);
  };

  const confirmApply = () => {
    setShowApplyModal(false);
    alert('활동 신청이 완료되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">활동 상세</h1>
          <div className="w-8 h-8"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 활동 기본 정보 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h2>
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(activity.category)}`}>
                  {activity.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">활동 소개</h3>
            <p className="text-gray-600 leading-relaxed">{activity.description}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">활동 목표</h3>
            <p className="text-gray-600 leading-relaxed">{activity.goal}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">유의사항</h3>
            <p className="text-gray-600 leading-relaxed">{activity.notice}</p>
          </div>
        </div>

        {/* 활동 정보 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">활동 정보</h3>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <i className="ri-user-line text-gray-400"></i>
              <span className="text-gray-600">팀장</span>
            </div>
            <span className="font-medium text-gray-900">{activity.leader}</span>
          </div>

          <div className="py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <i className="ri-group-line text-gray-400"></i>
                <span className="text-gray-600">참여 인원</span>
              </div>
              <span className="font-medium text-gray-900">
                {activity.currentMembers}/{activity.maxMembers}명
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${participationRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>현재 {participationRate.toFixed(0)}% 참여</span>
              <span>{activity.maxMembers - activity.currentMembers}명 남음</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <i className="ri-calendar-line text-gray-400"></i>
              <span className="text-gray-600">진행 일정</span>
            </div>
            <span className="font-medium text-gray-900">{activity.schedule}</span>
          </div>

          <div className="flex items-center justify-between py-3 mb-4">
            <div className="flex items-center space-x-3">
              <i className="ri-map-pin-line text-gray-400"></i>
              <span className="text-gray-600">진행 장소</span>
            </div>
            <span className="font-medium text-gray-900">{activity.location}</span>
          </div>

          <button
            onClick={handleApply}
            disabled={activity.currentMembers >= activity.maxMembers || activity.status === '모집완료'}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              activity.currentMembers >= activity.maxMembers || activity.status === '모집완료'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {activity.currentMembers >= activity.maxMembers || activity.status === '모집완료'
              ? '모집 완료'
              : '신청하기'}
          </button>
        </div>

        {showCurriculum && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">커리큘럼</h3>
            <div className="space-y-3">
              {activity.curriculum?.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {item.week}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{item.week}주차</h4>
                    <p className="text-sm text-gray-600">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-question-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">활동 신청</h3>
              <p className="text-gray-600">'{activity.title}'에 신청하시겠습니까?</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                취소
              </button>
              <button
                onClick={confirmApply}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"
              >
                신청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
