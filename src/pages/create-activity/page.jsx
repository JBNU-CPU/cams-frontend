import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export default function CreateActivity() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [activityId, setActivityId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    activityType: '',
    maxParticipants: '',
    location: '',
    notes: ''
  });

  const [schedules, setSchedules] = useState([
    { id: '1', days: [], startTime: '', endTime: '', date: '' }
  ]);
  const [curriculums, setCurriculums] = useState([]);

  const [scheduleError, setScheduleError] = useState('');

  const activityTypes = ['세션', '스터디', '프로젝트', '소모임', '행사'];
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
  const sortDays = (arr) =>
    [...arr].sort((a, b) => weekDays.indexOf(a) - weekDays.indexOf(b));

  const isRecurringActivity = ['세션', '스터디', '프로젝트'].includes(formData.activityType);
  const isEventActivity = ['소모임', '행사'].includes(formData.activityType);

  useEffect(() => {
    const activityData = location.state?.activityData;
    if (activityData) {
      setIsEditing(true);
      setActivityId(activityData.id);

      const categoryMapReverse = {
        SESSION: '세션',
        STUDY: '스터디',
        PROJECT: '프로젝트',
        MEETING: '소모임',
        GENERAL: '행사'
      };
      const dayMapReverse = {
        MONDAY: '월',
        TUESDAY: '화',
        WEDNESDAY: '수',
        THURSDAY: '목',
        FRIDAY: '금',
        SATURDAY: '토',
        SUNDAY: '일'
      };

      setFormData({
        title: activityData.title || '',
        description: activityData.description || '',
        goal: activityData.goal || '',
        activityType: categoryMapReverse[activityData.activityType] || '',
        maxParticipants: activityData.maxParticipants || '',
        location: activityData.location || '',
        notes: activityData.notes || ''
      });

      if (activityData.recurringSchedules && activityData.recurringSchedules.length > 0) {
        const first = activityData.recurringSchedules[0];
        setSchedules([{
          id: '1',
          days: sortDays([
            ...new Set(
              activityData.recurringSchedules.map(s => dayMapReverse[s.dayOfWeek])
            )
          ]),
          startTime: first.startTime ? first.startTime.substring(0, 5) : '',
          endTime: first.endTime ? first.endTime.substring(0, 5) : '',
          date: ''
        }]);
      } else if (activityData.eventSchedule && activityData.eventSchedule.length > 0) {
        setSchedules(
          activityData.eventSchedule.map((s, i) => ({
            id: String(i + 1),
            days: [],
            startTime: s.startDateTime ? s.startDateTime.substring(11, 16) : '',
            endTime: s.endDateTime ? s.endDateTime.substring(11, 16) : '',
            date: s.startDateTime ? s.startDateTime.substring(0, 10) : ''
          }))
        );
      }

      if (activityData.curriculums && activityData.curriculums.length > 0) {
        setCurriculums(
          activityData.curriculums.map(c => ({
            week: String(c.sequence),
            title: c.title,
            description: c.description
          }))
        );
      }
    }
  }, [location.state]);

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 요일 토글: 추가 시 항상 월~일 순으로 정렬
  const handleDayToggle = (scheduleId, day) => {
    setSchedules(prev =>
      prev.map(s => {
        if (s.id !== scheduleId) return s;
        const exists = s.days.includes(day);
        const next = exists ? s.days.filter(d => d !== day) : sortDays([...s.days, day]);
        return { ...s, days: next };
      })
    );
  };

  const handleTimeChange = (scheduleId, field, time) => {
    setSchedules(prev =>
      prev.map(s => (s.id === scheduleId ? { ...s, [field]: time } : s))
    );
  };

  const addSchedule = () =>
    setSchedules(prev => [
      ...prev,
      { id: Date.now().toString(), days: [], startTime: '', endTime: '', date: '' }
    ]);

  const removeSchedule = (id) =>
    setSchedules(prev => (prev.length > 1 ? prev.filter(s => s.id !== id) : prev));

  const handleCurriculumChange = (index, field, value) =>
    setCurriculums(prev => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));

  const addCurriculum = () =>
    setCurriculums(prev => [...prev, { week: '', title: '', description: '' }]);

  const removeCurriculum = (index) =>
    setCurriculums(prev => prev.filter((_, i) => i !== index));

  // 유효성 검증
  const validateSchedules = () => {
    setScheduleError('');

    if (isRecurringActivity) {
      const invalid = schedules.some(
        s => s.days.length === 0 || !s.startTime || !s.endTime
      );
      if (invalid) {
        setScheduleError('정기 일정은 요일과 시작/종료 시간을 모두 선택해주세요.');
        return false;
      }
    }

    if (isEventActivity) {
      const invalid = schedules.some(
        s => !s.date || !s.startTime || !s.endTime
      );
      if (invalid) {
        setScheduleError('이벤트 일정은 날짜와 시작/종료 시간을 모두 입력해주세요.');
        return false;
      }
    }

    return true;
  };

  // 버튼 비활성화 계산
  const basicValid =
    !!formData.title.trim() &&
    !!formData.activityType &&
    Number(formData.maxParticipants) > 0 &&
    !!formData.location.trim();

  const scheduleValid =
    isRecurringActivity
      ? schedules.every(s => s.days.length > 0 && s.startTime && s.endTime)
      : isEventActivity
        ? schedules.every(s => s.date && s.startTime && s.endTime)
        : true;

  const canSubmit = basicValid && scheduleValid;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!basicValid) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    if (!validateSchedules()) return;

    const activityTypeMap = {
      '세션': 'SESSION',
      '스터디': 'STUDY',
      '프로젝트': 'PROJECT',
      '소모임': 'MEETING',
      '행사': 'GENERAL'
    };
    const dayMapReverse = {
      '월': 'MONDAY',
      '화': 'TUESDAY',
      '수': 'WEDNESDAY',
      '목': 'THURSDAY',
      '금': 'FRIDAY',
      '토': 'SATURDAY',
      '일': 'SUNDAY'
    };

    const payload = {
      title: formData.title,
      description: formData.description,
      goal: formData.goal,
      notes: formData.notes,
      location: formData.location,
      maxParticipants: parseInt(formData.maxParticipants, 10),
      activityType: activityTypeMap[formData.activityType],
      recurringSchedules: isRecurringActivity
        ? schedules.flatMap(s =>
          s.days.map(day => ({
            dayOfWeek: dayMapReverse[day],
            startTime: s.startTime,
            endTime: s.endTime
          }))
        )
        : [],
      eventSchedule: isEventActivity
        ? schedules.map(s => ({
          startDateTime: `${s.date}T${s.startTime}`,
          endDateTime: `${s.date}T${s.endTime}`
        }))
        : [],
      curriculums: isRecurringActivity
        ? curriculums.map(c => ({
          title: c.title,
          description: c.description,
          sequence: parseInt(c.week, 10)
        }))
        : []
    };

    try {
      if (isEditing) {
        await axiosInstance.put(`/api/activities/${activityId}`, payload);
        alert('활동이 성공적으로 수정되었습니다!');
        navigate(`/activity/${activityId}`, { replace: true });
      } else {
        await axiosInstance.post('/api/activities', payload);
        alert('활동이 성공적으로 개설되었습니다!');
        navigate('/my', { replace: true });
      }
    } catch (error) {
      console.error(`활동 ${isEditing ? '수정' : '개설'} 실패:`, error);
      alert(error.response?.data?.message || `활동 ${isEditing ? '수정' : '개설'}에 실패했습니다.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? '활동 편집하기' : '활동 개설하기'}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* 기본 정보 */}
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
              <i className="ri-information-line text-blue-600 text-sm"></i>
            </div>
            기본 정보
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                활동명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm"
                maxLength={50}
              />
            </div>

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
                    className={`py-3 px-4 rounded-lg text-sm font-medium border ${formData.activityType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                활동 소개
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm resize-none"
                rows={4}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                활동 목표
              </label>
              <textarea
                name="goal"
                value={formData.goal}
                onChange={handleFormChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm resize-none"
                rows={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 인원 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  name="maxParticipants"
                  min="2"
                  max="50"
                  value={formData.maxParticipants}
                  onChange={handleFormChange}
                  className="flex-1 px-3 py-3 border border-gray-200 rounded-lg text-sm"
                />
                <span className="text-sm text-gray-600">명</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                진행 장소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                유의사항
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm resize-none"
                rows={3}
                maxLength={300}
              />
            </div>
          </div>
        </section>

        {/* 일정 설정 */}
        {(isRecurringActivity || isEventActivity) && (
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                <i className="ri-calendar-line text-green-600 text-sm"></i>
              </div>
              일정 설정
            </h2>

            {scheduleError && (
              <p className="mb-3 text-sm text-red-600">{scheduleError}</p>
            )}

            <div className="space-y-6">
              {schedules.map((schedule, index) => (
                <div key={schedule.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      {isRecurringActivity ? '정기 일정' : `일정 ${index + 1}`}
                    </h3>
                    {schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(schedule.id)}
                        className="text-red-600"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {isRecurringActivity && (
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
                              className={`py-2 px-3 rounded-lg text-sm font-medium border ${schedule.days.includes(day)
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-200'
                                }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isEventActivity && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          진행 날짜 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={schedule.date || ''}
                          onChange={(e) => handleTimeChange(schedule.id, 'date', e.target.value)}
                          className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        진행 시간 <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-2">시작 시간</label>
                          <input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => handleTimeChange(schedule.id, 'startTime', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-2">종료 시간</label>
                          <input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => handleTimeChange(schedule.id, 'endTime', e.target.value)}
                            className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isEventActivity && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                  >
                    <i className="ri-add-line"></i>
                    <span>일정 추가</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 커리큘럼 설정 */}
        {isRecurringActivity && (
          <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                <i className="ri-book-read-line text-purple-600 text-sm"></i>
              </div>
              커리큘럼 설정
            </h2>

            <div className="space-y-4">
              {curriculums.map((curriculum, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="font-medium text-gray-900">주차 선택</label>
                      <select
                        value={curriculum.week}
                        onChange={(e) => handleCurriculumChange(index, 'week', e.target.value)}
                        className="w-28 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="" disabled>선택</option>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map(weekNum => (
                          <option key={weekNum} value={weekNum}>{weekNum}주차</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCurriculum(index)}
                      className="text-red-600"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                      <input
                        type="text"
                        value={curriculum.title}
                        onChange={(e) => handleCurriculumChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
                      <textarea
                        value={curriculum.description}
                        onChange={(e) => handleCurriculumChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center">
                <button
                  type="button"
                  onClick={addCurriculum}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
                >
                  <i className="ri-add-line"></i>
                  <span>커리큘럼 추가</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {!isEditing && (
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
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? '수정 완료' : '활동 개설 완료'}
          </button>
        </div>
      </form>
    </div>
  );
}
