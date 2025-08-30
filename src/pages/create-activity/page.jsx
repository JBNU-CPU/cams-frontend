import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateActivity() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    activityType: '',
    introduction: '',
    goal: '',
    maxMembers: '',
    location: '',
    notes: '',
    selectedWeeks: [],
  });

  const [schedules, setSchedules] = useState([
    { id: '1', days: [], startTime: '', endTime: '' }
  ]);

  const activityTypes = ['세션', '스터디', '프로젝트', '소모임', '행사'];
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
  const weeks = Array.from({ length: 16 }, (_, i) => i + 1);

  // 주차가 필요한 활동 유형인지 확인
  const needsWeekSelection = ['세션', '스터디', '프로젝트'].includes(formData.activityType);

  const addSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      days: [],
      startTime: '',
      endTime: ''
    };
    setSchedules([...schedules, newSchedule]);
  };

  const removeSchedule = (id) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    }
  };

  const handleDayToggle = (scheduleId, day) => {
    setSchedules(schedules.map(schedule =>
      schedule.id === scheduleId
        ? {
            ...schedule,
            days: schedule.days.includes(day)
              ? schedule.days.filter(d => d !== day)
              : [...schedule.days, day]
          }
        : schedule
    ));
  };

  const handleStartTimeChange = (scheduleId, time) => {
    setSchedules(schedules.map(schedule =>
      schedule.id === scheduleId
        ? { ...schedule, startTime: time }
        : schedule
    ));
  };

  const handleEndTimeChange = (scheduleId, time) => {
    setSchedules(schedules.map(schedule =>
      schedule.id === scheduleId
        ? { ...schedule, endTime: time }
        : schedule
    ));
  };

  const handleWeekToggle = (week) => {
    setFormData(prev => ({
      ...prev,
      selectedWeeks: prev.selectedWeeks.includes(week)
        ? prev.selectedWeeks.filter(w => w !== week)
        : [...prev.selectedWeeks, week]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('활동명을 입력해주세요.');
      return;
    }
    
    if (!formData.activityType) {
      alert('활동 유형을 선택해주세요.');
      return;
    }
    
    if (!formData.maxMembers || parseInt(formData.maxMembers, 10) < 2) {
      alert('최대 인원을 2명 이상으로 설정해주세요.');
      return;
    }

    if (!formData.location.trim()) {
      alert('진행 장소를 입력해주세요.');
      return;
    }
    
    // 모든 일정이 올바르게 설정되었는지 확인
    for (const schedule of schedules) {
      if (schedule.days.length === 0) {
        alert('모든 일정의 진행 요일을 선택해주세요.');
        return;
      }
      if (!schedule.startTime) {
        alert('모든 일정의 시작 시간을 선택해주세요.');
        return;
      }
      if (!schedule.endTime) {
        alert('모든 일정의 종료 시간을 선택해주세요.');
        return;
      }
    }

    // 주차가 필요한 활동 유형인 경우에만 주차 선택 확인
    if (needsWeekSelection && formData.selectedWeeks.length === 0) {
      alert('주차를 선택해주세요.');
      return;
    }

    // 여기서 실제 활동 생성 로직 처리
    console.log('활동 생성:', { ...formData, schedules });
    
    // 성공 후 활동 관리 페이지로 이동
    navigate('/my');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
            >
              <i className="ri-arrow-left-line text-xl"></i>
            </button>
            <h1 className="text-xl font-bold text-gray-900">활동 개설하기</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* 기본 정보 섹션 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
              <i className="ri-information-line text-blue-600 text-sm"></i>
            </div>
            기본 정보
          </h2>
          
          <div className="space-y-4">
            {/* 활동명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                활동명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: React 스터디 그룹"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/50자</p>
            </div>

            {/* 활동 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                활동 유형 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {activityTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityType: type })}
                    className={`py-3 px-4 rounded-lg text-sm font-medium border transition-colors ${
                      formData.activityType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 활동 소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                활동 소개
              </label>
              <textarea
                value={formData.introduction}
                onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="활동에 대한 상세한 소개를 입력해주세요"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.introduction.length}/500자</p>
            </div>

            {/* 활동 목표 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                활동 목표
              </label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="이 활동을 통해 달성하고자 하는 목표를 입력해주세요"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.goal.length}/200자</p>
            </div>

            {/* 최대 인원 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 인원 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                  className="flex-1 px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="최대 인원을 입력하세요"
                />
                <span className="text-sm text-gray-600">명</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">최소 2명, 최대 50명까지 설정 가능합니다</p>
            </div>

            {/* 진행 장소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                진행 장소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 강의실 A동 201호"
                maxLength={100}
              />
            </div>

            {/* 유의사항 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                유의사항
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="활동 참여 시 유의사항을 입력해주세요"
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/300자</p>
            </div>
          </div>
        </div>

        {/* 일정 설정 섹션 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <i className="ri-calendar-line text-green-600 text-sm"></i>
            </div>
            일정 설정
          </h2>
          
          <div className="space-y-6">
            {schedules.map((schedule, index) => (
              <div key={schedule.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">일정 {index + 1}</h3>
                  {schedules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* 진행 요일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      진행 요일 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(schedule.id, day)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                            schedule.days.includes(day)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      중복 선택이 가능합니다 ({schedule.days.length}개 선택됨)
                    </p>
                  </div>

                  {/* 진행 시간 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      진행 시간 <span className="text-red-500">*</span>
                    </label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* 시작 시간 */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-2">시작 시간</label>
                        <input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => handleStartTimeChange(schedule.id, e.target.value)}
                          className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* 종료 시간 */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-2">종료 시간</label>
                        <input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => handleEndTimeChange(schedule.id, e.target.value)}
                          className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 일정 미리보기 */}
                  {schedule.days.length > 0 && schedule.startTime && schedule.endTime && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-700 font-medium mb-1">일정 미리보기</p>
                      <p className="text-sm text-blue-600">
                        매주 {schedule.days.join('/')} {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* 일정 추가 버튼 */}
            <div className="text-center">
              <button
                type="button"
                onClick={addSchedule}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <i className="ri-add-line"></i>
                <span>일정 추가</span>
              </button>
            </div>
          </div>
        </div>

        {/* 주차 선택 섹션 (세션, 스터디, 프로젝트만 표시) */}
        {needsWeekSelection && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                <i className="ri-calendar-check-line text-purple-600 text-sm"></i>
              </div>
              주차 선택
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  진행 주차 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {weeks.map((week) => (
                    <button
                      key={week}
                      type="button"
                      onClick={() => handleWeekToggle(week)}
                      className={`py-3 px-3 rounded-lg text-sm font-medium border transition-colors ${
                        formData.selectedWeeks.includes(week)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {week}주차
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  중복 선택이 가능합니다 ({formData.selectedWeeks.length}개 선택됨)
                </p>
              </div>

              {/* 선택된 주차 미리보기 */}
              {formData.selectedWeeks.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-purple-700 font-medium mb-1">선택된 주차</p>
                  <p className="text-sm text-purple-600">
                    {formData.selectedWeeks.sort((a, b) => a - b).join(', ')}주차
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 안내 사항 */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
              <i className="ri-information-line text-amber-600 text-sm"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 mb-2">활동 개설 안내</h3>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• 활동 개설 후 승인까지 1-2일 소요됩니다</li>
                <li>• 승인 완료 후 멤버 모집이 시작됩니다</li>
                <li>• 활동 정보는 승인 전까지 수정 가능합니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            활동 개설 완료
          </button>
        </div>
      </form>
    </div>
  );
}