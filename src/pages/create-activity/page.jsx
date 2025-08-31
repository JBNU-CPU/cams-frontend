import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance'; // API 인스턴스 import

export default function CreateActivity() {
  const navigate = useNavigate();
  // 1. 상태 이름을 백엔드 DTO와 일치하도록 수정 (introduction -> description 등)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    activityType: '',
    maxParticipants: '',
    location: '',
    notes: '',
  });

  // schedules 상태는 날짜(date) 필드를 가질 수 있도록 확장
  const [schedules, setSchedules] = useState([
    { id: '1', days: [], startTime: '', endTime: '', date: '' }
  ]);

  const [curriculums, setCurriculums] = useState([]);

  const activityTypes = ['세션', '스터디', '프로젝트', '소모임', '행사'];
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

  // 활동 유형에 따른 UI 분기 처리를 위한 변수
  const isRecurringActivity = ['세션', '스터디', '프로젝트'].includes(formData.activityType);
  const isEventActivity = ['소모임', '행사'].includes(formData.activityType);

  useEffect(() => {
    if (isRecurringActivity) {
      if (curriculums.length === 0) {
        setCurriculums([{ week: '', title: '', description: '' }]);
      }
    } else {
      setCurriculums([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecurringActivity]);

  const addSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      days: [],
      startTime: '',
      endTime: '',
      date: ''
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
        ? { ...schedule, days: schedule.days.includes(day) ? schedule.days.filter(d => d !== day) : [...schedule.days, day] }
        : schedule
    ));
  };

  const handleTimeChange = (scheduleId, field, time) => {
    setSchedules(schedules.map(schedule =>
      schedule.id === scheduleId ? { ...schedule, [field]: time } : schedule
    ));
  };

  const handleCurriculumChange = (index, field, value) => {
    const newCurriculums = [...curriculums];
    newCurriculums[index][field] = value;
    setCurriculums(newCurriculums);
  };

  const addCurriculum = () => {
    setCurriculums([...curriculums, { week: '', title: '', description: '' }]);
  };

  const removeCurriculum = (index) => {
    if (curriculums.length > 0) { // 1개만 남아도 삭제 가능하도록 수정
      setCurriculums(curriculums.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 유효성 검사 ---
    if (!formData.title.trim()) { alert('활동명을 입력해주세요.'); return; }
    if (!formData.activityType) { alert('활동 유형을 선택해주세요.'); return; }
    if (!formData.maxParticipants || parseInt(formData.maxParticipants, 10) < 2) { alert('최대 인원을 2명 이상으로 설정해주세요.'); return; }
    if (!formData.location.trim()) { alert('진행 장소를 입력해주세요.'); return; }

    if (isRecurringActivity) {
      if (schedules[0].days.length === 0 || !schedules[0].startTime || !schedules[0].endTime) {
        alert('정기 활동의 요일과 시간을 모두 설정해주세요.'); return;
      }
      for (const curr of curriculums) {
        if (!curr.week) { alert('모든 커리큘럼의 주차를 선택해주세요.'); return; }
        if (!curr.title.trim()) { alert('모든 커리큘럼의 제목을 입력해주세요.'); return; }
      }
    } else if (isEventActivity) {
      for (const schedule of schedules) {
        if (!schedule.date || !schedule.startTime || !schedule.endTime) {
          alert('모든 행사의 날짜와 시간을 설정해주세요.'); return;
        }
      }
    }

    // --- ❗❗ 핵심 수정: API Payload 생성 로직 변경 ❗❗ ---
    const activityTypeMap = { '세션': 'SESSION', '스터디': 'STUDY', '프로젝트': 'PROJECT', '소모임': 'MEETING', '행사': 'GENERAL' };
    const dayMapReverse = { '월': 'MONDAY', '화': 'TUESDAY', '수': 'WEDNESDAY', '목': 'THURSDAY', '금': 'FRIDAY', '토': 'SATURDAY', '일': 'SUNDAY' };

    const payload = {
      ...formData,
      activityType: activityTypeMap[formData.activityType],

      // 정기 활동인 경우에만 데이터를 채우고, 아닐 경우 빈 배열([])을 보냅니다.
      recurringSchedules: isRecurringActivity
        ? schedules.flatMap(s => s.days.map(day => ({
          dayOfWeek: dayMapReverse[day],
          startTime: s.startTime,
          endTime: s.endTime
        })))
        : [],

      // 행사/소모임인 경우에만 데이터를 채우고, 아닐 경우 빈 배열([])을 보냅니다.
      eventSchedule: isEventActivity
        ? schedules.map(s => ({
          startDateTime: `${s.date}T${s.startTime}`,
          endDateTime: `${s.date}T${s.endTime}`
        }))
        : [],

      // 정기 활동인 경우에만 커리큘럼 데이터를 채웁니다.
      curriculums: isRecurringActivity && curriculums.length > 0
        ? curriculums.map(curr => ({
          title: curr.title,
          description: curr.description,
          sequence: parseInt(curr.week, 10)
        }))
        : [], // null 대신 빈 배열을 보내는 것이 더 안전할 수 있습니다.
    };

    try {
      await axiosInstance.post('/api/activities', payload);
      alert('활동이 성공적으로 개설되었습니다!');
      navigate('/my');
    } catch (error) {
      console.error('활동 개설 실패:', error);
      alert('활동 개설에 실패했습니다. 입력 내용을 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800">
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
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2"><i className="ri-information-line text-blue-600 text-sm"></i></div>
            기본 정보
          </h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">활동명 <span className="text-red-500">*</span></label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="예: React 스터디 그룹" maxLength={50} /><p className="text-xs text-gray-500 mt-1">{formData.title.length}/50자</p></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-3">활동 유형 <span className="text-red-500">*</span></label><div className="grid grid-cols-3 gap-2">{activityTypes.map((type) => (<button key={type} type="button" onClick={() => setFormData({ ...formData, activityType: type })} className={`py-3 px-4 rounded-lg text-sm font-medium border transition-colors ${formData.activityType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>{type}</button>))}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">활동 소개</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="활동에 대한 상세한 소개를 입력해주세요" rows={4} maxLength={500} /><p className="text-xs text-gray-500 mt-1">{formData.description.length}/500자</p></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">활동 목표</label><textarea value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="이 활동을 통해 달성하고자 하는 목표를 입력해주세요" rows={3} maxLength={200} /><p className="text-xs text-gray-500 mt-1">{formData.goal.length}/200자</p></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">최대 인원 <span className="text-red-500">*</span></label><div className="flex items-center space-x-3"><input type="number" min="2" max="50" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} className="flex-1 px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="최대 인원을 입력하세요" /><span className="text-sm text-gray-600">명</span></div><p className="text-xs text-gray-500 mt-1">최소 2명, 최대 50명까지 설정 가능합니다</p></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">진행 장소 <span className="text-red-500">*</span></label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="예: 강의실 A동 201호" maxLength={100} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">유의사항</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="활동 참여 시 유의사항을 입력해주세요" rows={3} maxLength={300} /><p className="text-xs text-gray-500 mt-1">{formData.notes.length}/300자</p></div>
          </div>
        </div>

        {/* 일정 설정 섹션 (UI 분기 처리) */}
        {(isRecurringActivity || isEventActivity) && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2"><i className="ri-calendar-line text-green-600 text-sm"></i></div>
              일정 설정
            </h2>
            <div className="space-y-6">
              {schedules.map((schedule, index) => (
                <div key={schedule.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{isRecurringActivity ? '정기 일정' : `일정 ${index + 1}`}</h3>
                    {schedules.length > 1 && (<button type="button" onClick={() => removeSchedule(schedule.id)} className="text-red-600 hover:text-red-700 text-sm"><i className="ri-delete-bin-line"></i></button>)}
                  </div>
                  <div className="space-y-4">
                    {isRecurringActivity && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">진행 요일 <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-4 gap-2">{weekDays.map((day) => (<button key={day} type="button" onClick={() => handleDayToggle(schedule.id, day)} className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${schedule.days.includes(day) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}>{day}</button>))}</div>
                        <p className="text-xs text-gray-500 mt-2">중복 선택이 가능합니다 ({schedule.days.length}개 선택됨)</p>
                      </div>
                    )}
                    {isEventActivity && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">진행 날짜 <span className="text-red-500">*</span></label>
                        <input type="date" value={schedule.date || ''} onChange={(e) => handleTimeChange(schedule.id, 'date', e.target.value)} className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">진행 시간 <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-xs text-gray-600 mb-2">시작 시간</label><input type="time" value={schedule.startTime} onChange={(e) => handleTimeChange(schedule.id, 'startTime', e.target.value)} className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        <div><label className="block text-xs text-gray-600 mb-2">종료 시간</label><input type="time" value={schedule.endTime} onChange={(e) => handleTimeChange(schedule.id, 'endTime', e.target.value)} className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isEventActivity && (<div className="text-center"><button type="button" onClick={addSchedule} className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"><i className="ri-add-line"></i><span>일정 추가</span></button></div>)}
            </div>
          </div>
        )}

        {isRecurringActivity && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2"><i className="ri-book-read-line text-purple-600 text-sm"></i></div>
              커리큘럼 설정
            </h2>
            <div className="space-y-4">
              {curriculums.map((curriculum, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <label className="font-medium text-gray-900">주차 선택</label>
                      <select value={curriculum.week} onChange={(e) => handleCurriculumChange(index, 'week', e.target.value)} className="w-28 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="" disabled>선택</option>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map(weekNum => (<option key={weekNum} value={weekNum}>{weekNum}주차</option>))}
                      </select>
                    </div>
                    <button type="button" onClick={() => removeCurriculum(index)} className="text-red-600 hover:text-red-700 text-sm"><i className="ri-delete-bin-line"></i></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                      <input type="text" placeholder="예: React 기초" value={curriculum.title} onChange={(e) => handleCurriculumChange(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
                      <textarea placeholder="해당 주차에 진행할 활동 내용을 입력하세요." value={curriculum.description} onChange={(e) => handleCurriculumChange(index, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center">
                <button type="button" onClick={addCurriculum} className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  <i className="ri-add-line"></i>
                  <span>커리큘럼 추가</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5"><i className="ri-information-line text-amber-600 text-sm"></i></div>
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

        <div className="pt-4">
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors">
            활동 개설 완료
          </button>
        </div>
      </form>
    </div>
  );
}

