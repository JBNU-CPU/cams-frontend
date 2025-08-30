import { useState } from 'react';

export default function ActivityManagement() {
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTimeEndModal, setShowTimeEndModal] = useState(false);
  const [showCodeChangeModal, setShowCodeChangeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCurrentAttendance, setShowCurrentAttendance] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [attendanceOpen, setAttendanceOpen] = useState({});
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceTime, setAttendanceTime] = useState(30);
  const [customTime, setCustomTime] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeInterval, setTimeInterval] = useState(null);
  const [expandedAttendance, setExpandedAttendance] = useState({});
  const [presetCode, setPresetCode] = useState('');

  // 수정할 활동 정보 상태
  const [editForm, setEditForm] = useState({
    title: '',
    days: [],
    time: '', // 'time' 필드 추가
    location: '',
  });

  // 내가 개설한 활동 데이터
  const myActivities = [
    {
      id: '1',
      title: 'React 스터디 그룹',
      status: '진행 중',
      members: 8,
      maxMembers: 12,
      schedule: '매주 화/목 19:00',
      location: '강의실 A동 201호',
      attendanceStats: {
        totalSessions: 12,
        averageAttendance: 85,
        todayAttendees: 0,
      },
      memberList: [
        {
          id: '1',
          name: '김민수',
          attendanceRate: 92,
          lastAttendance: '2024-01-15',
          attended: 11,
          late: 1,
          absent: 0,
          studentId: '24220001',
          department: '컴퓨터공학과',
          gender: '남',
          phone: '010-1234-5678',
        },
        {
          id: '2',
          name: '이지은',
          attendanceRate: 88,
          lastAttendance: '2024-01-15',
          attended: 10,
          late: 1,
          absent: 1,
          studentId: '24220002',
          department: '소프트웨어학과',
          gender: '여',
          phone: '010-2345-6789',
        },
        {
          id: '3',
          name: '박태준',
          attendanceRate: 75,
          lastAttendance: '2024-01-12',
          attended: 9,
          late: 0,
          absent: 3,
          studentId: '23220003',
          department: '컴퓨터공학과',
          gender: '남',
          phone: '010-3456-7890',
        },
        {
          id: '4',
          name: '최영희',
          attendanceRate: 95,
          lastAttendance: '2024-01-15',
          attended: 11,
          late: 1,
          absent: 0,
          studentId: '24220004',
          department: '지구환경과학과',
          gender: '여',
          phone: '010-4567-8901',
        },
        {
          id: '5',
          name: '정민호',
          attendanceRate: 80,
          lastAttendance: '2024-01-10',
          attended: 9,
          late: 1,
          absent: 2,
          studentId: '23220005',
          department: '경영학과',
          gender: '남',
          phone: '010-5678-9012',
        },
        {
          id: '6',
          name: '강수정',
          attendanceRate: 90,
          lastAttendance: '2024-01-15',
          attended: 10,
          late: 2,
          absent: 0,
          studentId: '24220006',
          department: '디자인학과',
          gender: '여',
          phone: '010-6789-0123',
        },
        {
          id: '7',
          name: '윤서진',
          attendanceRate: 83,
          lastAttendance: '2024-01-12',
          attended: 10,
          late: 0,
          absent: 2,
          studentId: '24220007',
          department: '심리학과',
          gender: '여',
          phone: '010-7890-1234',
        },
        {
          id: '8',
          name: '임동현',
          attendanceRate: 77,
          lastAttendance: '2024-01-15',
          attended: 9,
          late: 1,
          absent: 2,
          studentId: '23220008',
          department: '체육학과',
          gender: '남',
          phone: '010-8901-2345',
        },
      ],
    },
    {
      id: '2',
      title: 'UI/UX 디자인 워크숍',
      status: '승인 대기',
      members: 0,
      maxMembers: 15,
      schedule: '매주 토 14:00',
      location: '디자인실 C동 102호',
      attendanceStats: {
        totalSessions: 0,
        averageAttendance: 0,
        todayAttendees: 0,
      },
      memberList: [],
    },
  ];

  const [activityData, setActivityData] = useState(myActivities);

  const availableUsers = [
    {
      id: '9',
      name: '홍길동',
      studentId: '24220009',
      department: '물리학과',
      gender: '남',
      phone: '010-9012-3456',
    },
    {
      id: '10',
      name: '김영수',
      studentId: '24220010',
      department: '화학과',
      gender: '남',
      phone: '010-0123-4567',
    },
    {
      id: '11',
      name: '박미래',
      studentId: '24220011',
      department: '생물학과',
      gender: '여',
      phone: '010-1234-5670',
    },
  ];

  // 출석한 사람들 목록 (구문 오류 수정)
  const [attendedMembers] = useState([
    {
      id: '1',
      name: '김민수',
      attendanceTime: '19:05',
      status: '출석',
      studentId: '24220001',
      department: '컴퓨터공학과',
    },
    {
      id: '2',
      name: '이지은',
      attendanceTime: '19:03',
      status: '출석',
      studentId: '24220002',
      department: '소프트웨어학과',
    },
    {
      id: '4',
      name: '최영희',
      attendanceTime: '19:08',
      status: '출석',
      studentId: '24220004',
      department: '지구환경과학과',
    },
    {
      id: '6',
      name: '강수정',
      attendanceTime: '19:12',
      status: '지각',
      studentId: '24220006',
      department: '디자인학과',
    },
    {
      id: '7',
      name: '윤서진',
      attendanceTime: '19:01',
      status: '출석',
      studentId: '24220007',
      department: '심리학과',
    },
  ]);

  const generateAttendanceCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const formatTimeLeft = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenAttendance = (activity) => {
    setSelectedActivity(activity);
    setShowAttendanceModal(true);
    setCustomTime('');
    setPresetCode('');
  };

  const handleStartAttendance = () => {
    const finalTime = customTime ? parseInt(customTime) : attendanceTime;
    if (finalTime < 1 || finalTime > 120) {
      alert('출석 시간은 1분에서 120분 사이로 설정해주세요.');
      return;
    }

    const code = presetCode || generateAttendanceCode();
    setAttendanceCode(code);
    setTimeLeft(finalTime * 60);
    setAttendanceOpen((prev) => ({ ...prev, [selectedActivity.id]: true }));

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAttendanceOpen((prevOpen) => ({ ...prevOpen, [selectedActivity.id]: false })); // 함수형 업데이트
          setShowAttendanceModal(false);
          setShowTimeEndModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeInterval(interval);
  };

  const handleCloseAttendance = (activityId) => {
    setAttendanceOpen((prev) => ({ ...prev, [activityId]: false }));
    setShowAttendanceModal(false);
    setSelectedActivity(null);
    setAttendanceCode('');
    setTimeLeft(0);
    setCustomTime('');
    setPresetCode('');
    if (timeInterval) {
      clearInterval(timeInterval);
      setTimeInterval(null);
    }
  };

  const handleRefreshCode = () => {
    const newCodeValue = generateAttendanceCode();
    setAttendanceCode(newCodeValue);
  };

  const handleManualCodeChange = () => {
    setNewCode(attendanceCode);
    setShowCodeChangeModal(true);
  };

  const handleCodeChange = () => {
    if (newCode.length === 4 && /^\d{4}$/.test(newCode)) {
      setAttendanceCode(newCode);
      setShowCodeChangeModal(false);
      setNewCode('');
    } else {
      alert('4자리 숫자를 입력해주세요.');
    }
  };

  const handleGenerateRandomCode = () => {
    const randomCode = generateAttendanceCode();
    setNewCode(randomCode);
  };

  const handleCodeInput = (digit) => {
    if (newCode.length < 4) {
      setNewCode(newCode + digit);
    }
  };

  const handleCodeDelete = () => {
    setNewCode(newCode.slice(0, -1));
  };

  const handlePresetCodeInput = (digit) => {
    if (presetCode.length < 4) {
      setPresetCode(presetCode + digit);
    }
  };

  const handlePresetCodeDelete = () => {
    setPresetCode(presetCode.slice(0, -1));
  };

  const handleGeneratePresetCode = () => {
    const randomCode = generateAttendanceCode();
    setPresetCode(randomCode);
  };

  const handleTimeChange = (minutes) => {
    setAttendanceTime(minutes);
    if (timeLeft > 0) {
      setTimeLeft(minutes * 60);
    }
  };

  const handleExtendTime = (additionalMinutes) => {
    setTimeLeft((prev) => prev + additionalMinutes * 60);
  };

  const handleExtendFromEndModal = (additionalMinutes) => {
    setTimeLeft(additionalMinutes * 60);
    setAttendanceOpen((prev) => ({ ...prev, [selectedActivity.id]: true }));
    setShowTimeEndModal(false);
    setShowAttendanceModal(true);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAttendanceOpen((prevOpen) => ({ ...prevOpen, [selectedActivity.id]: false }));
          setShowAttendanceModal(false);
          setShowTimeEndModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeInterval(interval);
  };

  const handleFinalClose = () => {
    setShowTimeEndModal(false);
    setSelectedActivity(null);
    setAttendanceCode('');
    setTimeLeft(0);
    setCustomTime('');

    if (timeInterval) {
      clearInterval(timeInterval);
      setTimeInterval(null);
    }
  };

  const handleMemberManagement = (activity) => {
    setSelectedActivity(activity);
    setShowMemberModal(true);
  };

  const handleAddMember = (user) => {
    setShowAddMember(false);
    setSearchTerm('');
    setShowMemberModal(true);
  };

  const handleRemoveMember = (memberId) => {
    if (confirm('이 멤버를 제거하시겠습니까?')) {
      setActivityData((prevData) =>
        prevData.map((activity) =>
          activity.id === selectedActivity.id
            ? {
                ...activity,
                memberList: activity.memberList.filter((member) => member.id !== memberId),
                members: activity.members - 1,
              }
            : activity
        )
      );

      // selectedActivity 상태 업데이트 로직 수정
      setSelectedActivity((prev) => ({
        ...prev,
        memberList: prev.memberList.filter((member) => member.id !== memberId),
        members: prev.members - 1,
      }));
    }
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.includes(searchTerm) ||
      user.department.includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case '진행 중':
        return 'bg-green-100 text-green-700';
      case '승인 대기':
        return 'bg-yellow-100 text-yellow-700';
      case '종료':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case '출석':
        return 'bg-green-100 text-green-700';
      case '지각':
        return 'bg-yellow-100 text-yellow-700';
      case '결석':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleToggleAttendanceExpansion = (activityId) => {
    setExpandedAttendance((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));
  };

  const attendanceCount = attendedMembers.filter((member) => member.status === '출석').length;
  const lateCount = attendedMembers.filter((member) => member.status === '지각').length;
  const totalMembers = selectedActivity?.memberList?.length || 0;
  const attendanceRate = totalMembers > 0 ? Math.round(((attendanceCount + lateCount) / totalMembers) * 100) : 0;

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);

    const scheduleText = activity.schedule;
    let parsedDays = [];
    let parsedTime = '';

    if (scheduleText.includes('월')) parsedDays.push('월');
    if (scheduleText.includes('화')) parsedDays.push('화');
    if (scheduleText.includes('수')) parsedDays.push('수');
    if (scheduleText.includes('목')) parsedDays.push('목');
    if (scheduleText.includes('금')) parsedDays.push('금');
    if (scheduleText.includes('토')) parsedDays.push('토');
    if (scheduleText.includes('일')) parsedDays.push('일');

    const timeMatch = scheduleText.match(/(\d{1,2}:\d{2})/);
    if (timeMatch) {
      parsedTime = timeMatch[1];
    }

    // editForm 상태 설정 수정
    setEditForm({
      title: activity.title,
      days: parsedDays,
      time: parsedTime,
      location: activity.location,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim() || editForm.days.length === 0 || !editForm.time.trim() || !editForm.location.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const dayString = editForm.days.join('/');
    const scheduleString = `매주 ${dayString} ${editForm.time}`;

    setActivityData((prevData) =>
      prevData.map((activity) =>
        activity.id === selectedActivity.id
          ? {
              ...activity,
              title: editForm.title,
              schedule: scheduleString,
              location: editForm.location,
            }
          : activity
      )
    );

    setShowEditModal(false);
    setSelectedActivity(null);
    setEditForm({ title: '', days: [], time: '', location: '' }); // 'time' 필드 초기화 추가
  };

  const handleDayToggle = (day) => {
    setEditForm((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  const handleTimePreset = (time) => {
    setEditForm((prev) => ({ ...prev, time }));
  };

  return (
    <div className="space-y-4">
      {activityData.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-folder-open-line text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">개설한 활동이 없습니다.</p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            <i className="ri-add-line mr-2"></i>
            활동 만들기
          </button>
        </div>
      ) : (
        activityData.map((activity) => (
          <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {/* 활동 기본 정보 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="ri-group-line mr-2"></i>
                    <span>
                      멤버: {activity.members}/{activity.maxMembers}명
                    </span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-calendar-line mr-2"></i>
                    <span>{activity.schedule}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-map-pin-line mr-2"></i>
                    <span>{activity.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 출석 통계 (진행 중인 활동만) */}
            {activity.status === '진행 중' && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">출석 현황</h4>
                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{activity.attendanceStats.averageAttendance}%</div>
                    <div className="text-xs text-gray-600">출석률</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {Math.round((activity.memberList.length * activity.attendanceStats.averageAttendance) / 100)}
                    </div>
                    <div className="text-xs text-gray-600">출석</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">
                      {Math.round(activity.memberList.length * 0.1)}
                    </div>
                    <div className="text-xs text-gray-600">지각</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {Math.round(activity.memberList.length * 0.05)}
                    </div>
                    <div className="text-xs text-gray-600">결석</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-700">멤버별 출석 현황</h5>
                    <button
                      onClick={() => handleToggleAttendanceExpansion(activity.id)}
                      className="text-blue-600 text-sm font-medium flex items-center space-x-1 hover:text-blue-700"
                    >
                      <span>{expandedAttendance[activity.id] ? '접기' : '펼쳐서 보기'}</span>
                      <i className={`ri-arrow-${expandedAttendance[activity.id] ? 'up' : 'down'}-s-line text-sm`}></i>
                    </button>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedAttendance[activity.id] ? 'max-h-96' : 'max-h-24'
                    }`}
                  >
                    <div className="overflow-y-auto space-y-2" style={{ maxHeight: expandedAttendance[activity.id] ? '384px' : '96px' }}>
                      {activity.memberList
                        .sort((a, b) => b.attendanceRate - a.attendanceRate)
                        .map((member) => (
                          <div key={member.id} className="bg-white rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{member.name}</span>
                              <span className={`font-bold ${getAttendanceRateColor(member.attendanceRate)}`}>{member.attendanceRate}%</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div>
                                <div className="font-semibold text-green-600">{member.attended}</div>
                                <div className="text-gray-500">출석</div>
                              </div>
                              <div>
                                <div className="font-semibold text-yellow-600">{member.late}</div>
                                <div className="text-gray-500">지각</div>
                              </div>
                              <div>
                                <div className="font-semibold text-red-600">{member.absent}</div>
                                <div className="text-gray-500">결석</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <div className="text-sm text-gray-600">총 {activity.attendanceStats.totalSessions}회 진행</div>
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex space-x-2">
              {activity.status === '진행 중' ? (
                <>
                  <button
                    onClick={() => {
                      if (attendanceOpen[activity.id]) {
                        setSelectedActivity(activity);
                        setShowAttendanceModal(true);
                      } else {
                        handleOpenAttendance(activity);
                      }
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      attendanceOpen[activity.id]
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {attendanceOpen[activity.id] ? '출석 진행 중' : '출석 오픈'}
                  </button>
                  <button
                    onClick={() => handleMemberManagement(activity)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    멤버 관리
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleEditActivity(activity)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                >
                  활동 수정
                </button>
              )}
              <button
                onClick={() => handleEditActivity(activity)}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg"
              >
                <i className="ri-more-line"></i>
              </button>
            </div>
          </div>
        ))
      )}

      {/* 출석 코드 모달 */}
      {showAttendanceModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
            {!attendanceOpen[selectedActivity.id] ? (
              // 출석 시작 전 - 시간 설정
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 설정</h3>
                  <p className="text-sm text-gray-600">{selectedActivity.title}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">출석 가능 시간 (분)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">
                    1분 ~ 120분 사이로 입력해주세요 (기본 30분)
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">빠른 선택</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 30].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => setCustomTime(minutes.toString())}
                        className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                          customTime === minutes.toString()
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {minutes}분
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">출석 코드 설정</label>
                    <button
                      onClick={handleGeneratePresetCode}
                      className="text-blue-600 text-xs font-medium flex items-center space-x-1 hover:text-blue-700"
                    >
                      <i className="ri-refresh-line"></i>
                      <span>랜덤 생성</span>
                    </button>
                  </div>
                  <div className="flex justify-center space-x-2 mb-4">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-700">{presetCode[index] || ''}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handlePresetCodeInput(digit.toString())}
                        className="h-10 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        {digit}
                      </button>
                    ))}
                    <div></div>
                    <button
                      onClick={() => handlePresetCodeInput('0')}
                      className="h-10 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      0
                    </button>
                    <button
                      onClick={handlePresetCodeDelete}
                      className="h-10 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <i className="ri-delete-back-line text-lg"></i>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">코드를 설정하지 않으면 자동으로 생성됩니다</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAttendanceModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
                  >
                    취소
                  </button>
                  <button onClick={handleStartAttendance} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">
                    출석 시작
                  </button>
                </div>
              </>
            ) : (
              // 출석 진행 중
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 코드</h3>
                  <p className="text-sm text-gray-600">{selectedActivity.title}</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 mb-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex space-x-2 justify-center">
                      {attendanceCode.split('').map((digit, index) => (
                        <div key={index} className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-600">{digit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">멤버들에게 이 코드를 알려주세요</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 mb-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <i className="ri-time-line text-orange-600"></i>
                    <span className="text-sm text-orange-700">남은 시간</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{formatTimeLeft(timeLeft)}</div>
                  {timeLeft <= 300 && timeLeft > 0 && <p className="text-xs text-orange-600 mt-1">출석 마감이 임박했습니다!</p>}
                </div>

                {timeLeft > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-3 gap-2">
                      {[5, 10, 15].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => handleExtendTime(minutes)}
                          className="py-1 px-2 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200"
                        >
                          +{minutes}분
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">현재 출석자</span>
                    <span className="text-lg font-bold text-gray-900">{attendedMembers.length}명</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleCloseAttendance(selectedActivity.id)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
                  >
                    출석 종료
                  </button>
                  <button
                    onClick={() => {
                      setShowAttendanceModal(false);
                      setShowCurrentAttendance(true);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    현재 출석 현황
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 현재 출석 현황 모달 */}
      {showCurrentAttendance && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">출석 현황</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedActivity?.title}</p>
                </div>
                <button
                  onClick={() => setShowCurrentAttendance(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <i className="ri-close-line text-gray-600"></i>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="ri-bar-chart-line text-blue-600"></i>
                      </div>
                      <span className="font-medium text-gray-900">실시간 통계</span>
                    </div>
                    {timeLeft > 0 && (
                      <div className="bg-orange-100 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-orange-700">{formatTimeLeft(timeLeft)} 남음</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{attendedMembers.length}</div>
                      <div className="text-xs text-gray-600">총 출석자</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">{attendanceCount}</div>
                      <div className="text-xs text-gray-600">정시 출석</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">{lateCount}</div>
                      <div className="text-xs text-gray-600">지각</div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-sm text-gray-600">출석률</span>
                      <span className="text-lg font-bold text-blue-600">{attendanceRate}%</span>
                      <span className="text-sm text-gray-500">
                        ({attendedMembers.length}/{totalMembers}명)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-green-600 text-sm"></i>
                      </div>
                      <h4 className="font-medium text-gray-900">출석 완료</h4>
                    </div>
                    <span className="text-sm text-gray-500">{attendedMembers.length}명</span>
                  </div>

                  {attendedMembers.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-user-line text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-gray-500 text-sm">아직 출석한 멤버가 없습니다</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attendedMembers.map((member) => (
                        <div key={member.id} className="bg-gray-50 rounded-xl p-4 hover-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-700">{member.name.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{member.name}</div>
                                <div className="text-xs text-gray-500">
                                  {member.studentId} · {member.department}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">{member.attendanceTime}</div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(
                                  member.status
                                )}`}
                              >
                                {member.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  {(() => {
                    const attendedIds = attendedMembers.map((m) => m.id);
                    const absentMembers = selectedActivity.memberList.filter((member) => !attendedIds.includes(member.id));

                    return (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <i className="ri-close-line text-red-600 text-sm"></i>
                            </div>
                            <h4 className="font-medium text-gray-900">미출석</h4>
                          </div>
                          <span className="text-sm text-gray-500">{absentMembers.length}명</span>
                        </div>

                        {absentMembers.length === 0 ? (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <i className="ri-check-line text-green-600 text-xl"></i>
                            </div>
                            <p className="text-green-700 font-medium mb-1">완벽한 출석!</p>
                            <p className="text-green-600 text-sm">모든 멤버가 출석했습니다</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {absentMembers.map((member) => (
                              <div key={member.id} className="bg-red-50 rounded-lg p-3 border border-red-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-semibold text-red-700">{member.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">{member.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {member.studentId} · {member.department}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">대기중</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowCurrentAttendance(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 출석 코드 변경 모달 */}
      {showCodeChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 코드 변경</h3>
              <p className="text-sm text-gray-600">새로운 4자리 코드를 입력하세요</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">현재 코드</p>
              <div className="flex justify-center space-x-2">
                {attendanceCode.split('').map((digit, index) => (
                  <div key={index} className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">{digit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700 font-medium mb-3">새 코드</p>
              <div className="flex justify-center space-x-2 mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="w-12 h-12 border-2 border-blue-200 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">{newCode[index] || ''}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleCodeInput(digit.toString())}
                    className="h-10 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {digit}
                  </button>
                ))}
                <div></div>
                <button
                  onClick={() => handleCodeInput('0')}
                  className="h-10 bg-gray-50 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  0
                </button>
                <button
                  onClick={handleCodeDelete}
                  className="h-10 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <i className="ri-delete-back-line text-lg"></i>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <button
                onClick={handleGenerateRandomCode}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center"
              >
                <i className="ri-refresh-line mr-2"></i>
                랜덤 코드 생성
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCodeChangeModal(false);
                  setNewCode('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                취소
              </button>
              <button
                onClick={handleCodeChange}
                disabled={newCode.length !== 4}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 출석 시간 종료 모달 */}
      {showTimeEndModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-2xl text-orange-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 시간 종료</h3>
              <p className="text-sm text-gray-600">{selectedActivity.title}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">출석 결과</h4>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-600">{attendedMembers.length}</div>
                  <div className="text-xs text-gray-600">총 출석자</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xl font-bold text-green-600">{attendanceCount}</div>
                  <div className="text-xs text-gray-600">정시 출석</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xl font-bold text-yellow-600">{lateCount}</div>
                  <div className="text-xs text-gray-600">지각</div>
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">출석률 </span>
                <span className="text-lg font-bold text-blue-600">{attendanceRate}%</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">출석한 멤버</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {attendedMembers.map((member) => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{member.attendanceTime}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(member.status)}`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {member.studentId} · {member.department}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">추가 시간 설정</h4>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[5, 10, 15, 30].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => handleExtendFromEndModal(minutes)}
                    className="py-2 px-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    +{minutes}분
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">시간을 연장하면 출석이 다시 시작됩니다</p>
            </div>

            <div className="flex space-x-3">
              <button onClick={handleFinalClose} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">
                출석 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 활동 수정 모달 */}
      {showEditModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">활동 정보 수정</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">활동명</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="활동명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  진행 요일 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                        editForm.days.includes(day)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  중복 선택이 가능합니다 ({editForm.days.length}개 선택됨)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  진행 시간 <span className="text-red-500">*</span>
                </label>
                <div className="mb-3">
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">빠른 선택</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimePreset(time)}
                        className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                          editForm.time === time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">장소</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="활동 장소를 입력하세요"
                />
              </div>

              {editForm.days.length > 0 && editForm.time && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700 font-medium mb-1">일정 미리보기</p>
                  <p className="text-sm text-blue-600">
                    매주 {editForm.days.join('/')} {editForm.time}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">
                취소
              </button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 관리 모달 */}
      {showMemberModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">멤버 관리</h3>
              <button onClick={() => setShowMemberModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              {selectedActivity.title} ({selectedActivity.memberList.length}/{selectedActivity.maxMembers}명)
            </div>

            <button
              onClick={() => {
                setShowAddMember(true);
                setShowMemberModal(false);
              }}
              className="w-full py-2 mb-4 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center"
            >
              <i className="ri-add-line mr-2"></i>
              멤버 추가
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3">
                {selectedActivity.memberList.map((member) => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <button onClick={() => handleRemoveMember(member.id)} className="text-red-600 hover:text-red-700 text-sm">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>학번: {member.studentId}</div>
                      <div>성별: {member.gender}</div>
                      <div>학과: {member.department}</div>
                      <div>연락처: {member.phone}</div>
                    </div>
                    <div className="mt-2 text-xs">
                      <span className={`font-medium ${getAttendanceRateColor(member.attendanceRate)}`}>출석률: {member.attendanceRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 추가 모달 */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">멤버 추가</h3>
              <button onClick={() => { setShowAddMember(false); setSearchTerm(''); }} className="p-1 text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="relative mb-4">
              <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                placeholder="이름, 학번, 학과로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <button onClick={() => handleAddMember(user)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      추가
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>학번: {user.studentId}</div>
                    <div>성별: {user.gender}</div>
                    <div>학과: {user.department}</div>
                    <div>연락처: {user.phone}</div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && searchTerm && (
                <div className="text-center py-4 text-gray-500">검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}