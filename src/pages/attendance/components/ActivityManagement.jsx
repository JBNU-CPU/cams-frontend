import {useEffect, useState} from 'react';
import axiosInstance from '@/api/axiosInstance';

export default function ActivityManagement() {
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showTimeEndModal, setShowTimeEndModal] = useState(false);
    const [showCodeChangeModal, setShowCodeChangeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCurrentAttendance, setShowCurrentAttendance] = useState(false);
    const [showAttendanceStatsModal, setShowAttendanceStatsModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [weeklySummaries, setWeeklySummaries] = useState([]);
    const [participantSummaries, setParticipantSummaries] = useState([]);
    const [attendanceCode, setAttendanceCode] = useState('');
    const [newCode, setNewCode] = useState('');
    const [attendanceOpen, setAttendanceOpen] = useState({});
    const [activityButtonStatus, setActivityButtonStatus] = useState({});
    const [attendanceTime, setAttendanceTime] = useState(30);
    const [customTime, setCustomTime] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [timeInterval, setTimeInterval] = useState(null);
    const [presetCode, setPresetCode] = useState('');
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [currentOngoingSession, setCurrentOngoingSession] = useState({});
    const [showReopenModal, setShowReopenModal] = useState(false); // New state
    const [reopenSessionData, setReopenSessionData] = useState(null); // New state
    const [reopenAttendanceCode, setReopenAttendanceCode] = useState(''); // New state
    const [reopenClosableMinutes, setReopenClosableMinutes] = useState(''); // New state
    const [lastClosedSession, setLastClosedSession] = useState({}); // New state

    // 수정할 활동 정보 상태
    const [editForm, setEditForm] = useState({
        title: '',
        days: [],
        time: '', // 'time' 필드 추가
        location: '',
    });

    const [activityData, setActivityData] = useState([]);

    const fetchActivitiesAndStatuses = async () => {
        try {
            const activityResponse = await axiosInstance.get('/api/me/activity/create');
            if (!activityResponse.data || !Array.isArray(activityResponse.data.content)) {
                setActivityData([]);
                return;
            }
            const activities = activityResponse.data.content;
            setActivityData(activities);

            const buttonStatuses = {};
            const openStates = {};
            const ongoingSessionsData = {};
            const lastClosedSessionsData = {};

            for (const activity of activities) {
                try {
                    const ongoingSessionResponse = await axiosInstance.get(`/api/session/activity/${activity.id}/ongoing`);
                    const ongoingSession = ongoingSessionResponse.data;

                    if (ongoingSession && ongoingSession.status === 'OPEN') {
                        buttonStatuses[activity.id] = '출석 진행 중';
                        openStates[activity.id] = true;
                        ongoingSessionsData[activity.id] = ongoingSession;
                    } else {
                        const sessionResponse = await axiosInstance.get(`/api/session/activity/${activity.id}`);
                        const sessions = sessionResponse.data.content;

                        const closedSession = sessions.find(s => s.status === 'CLOSED');
                        if (closedSession) {
                            buttonStatuses[activity.id] = '출석 마감 됨';
                            openStates[activity.id] = false;
                            lastClosedSessionsData[activity.id] = closedSession;
                        } else {
                            buttonStatuses[activity.id] = '출석 오픈';
                            openStates[activity.id] = false;
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching session for activity ${activity.id}:`, error);
                    buttonStatuses[activity.id] = '출석 오픈';
                    openStates[activity.id] = false;
                }
            }
            setActivityButtonStatus(buttonStatuses);
            setAttendanceOpen(openStates);
            setCurrentOngoingSession(ongoingSessionsData);
            setLastClosedSession(lastClosedSessionsData);
        } catch (error) {
            console.error('Error fetching my created activities:', error);
        }
    };

    useEffect(() => {
        fetchActivitiesAndStatuses();
    }, []);

    useEffect(() => {
        let interval;
        if (showAttendanceModal && selectedActivity && attendanceOpen[selectedActivity.id] && currentOngoingSession[selectedActivity.id]) {
            const session = currentOngoingSession[selectedActivity.id];
            setAttendanceCode(session.attendancesCode);

            const calculateTimeLeft = async () => {
                const closedAt = new Date(session.closedAt);
                const now = new Date();
                const diffSeconds = Math.max(0, Math.floor((closedAt.getTime() - now.getTime()) / 1000));
                setTimeLeft(diffSeconds);
                if (diffSeconds <= 0) {
                    clearInterval(interval);
                    // Explicitly close the session in the backend
                    try {
                        await axiosInstance.put(`/api/session/${session.sessionId}`, { status: 'CLOSED' });
                    } catch (error) {
                        console.error('Error explicitly closing session in backend:', error);
                        // Even if backend close fails, proceed with UI update to reflect timer end
                    }

                    setActivityButtonStatus((prev) => ({ ...prev, [selectedActivity.id]: '출석 마감 됨' }));
                    setAttendanceOpen((prevOpen) => ({ ...prevOpen, [selectedActivity.id]: false }));
                    setShowAttendanceModal(false);
                    setShowTimeEndModal(true);
                    await fetchActivitiesAndStatuses();
                }
            };

            calculateTimeLeft(); // Initial calculation
            interval = setInterval(calculateTimeLeft, 1000);

            return () => clearInterval(interval); // Cleanup on unmount or dependency change
        }
        return () => { if (interval) clearInterval(interval); };
    }, [showAttendanceModal, selectedActivity, attendanceOpen, currentOngoingSession]);

    // 추가된 상태 변수들
    const [attendedMembers, setAttendedMembers] = useState([]);
    const [attendanceCount, setAttendanceCount] = useState(0);
    const [lateCount, setLateCount] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);
    const [attendanceRate, setAttendanceRate] = useState(0);
    const [expandedAttendance, setExpandedAttendance] = useState({}); // 멤버별 출석 현황 확장/축소 상태

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

        // 출석 오픈 시 임시 데이터로 초기화 (실제로는 API 호출 후 업데이트)
        const tempAttendedMembers = [
            { id: 1, name: '김철수', studentId: '20201234', department: '컴퓨터공학과', attendanceTime: '10:00', status: '출석' },
            { id: 2, name: '이영희', studentId: '20215678', department: '소프트웨어학과', attendanceTime: '10:05', status: '지각' },
            { id: 3, name: '박민수', studentId: '20199876', department: '정보통신학과', attendanceTime: '10:02', status: '출석' },
        ];
        const tempTotalMembers = activity.memberList ? activity.memberList.length : 0;
        const tempAttendanceCount = tempAttendedMembers.filter(m => m.status === '출석').length;
        const tempLateCount = tempAttendedMembers.filter(m => m.status === '지각').length;
        const tempAttendanceRate = tempTotalMembers > 0 ? Math.round((tempAttendedMembers.length / tempTotalMembers) * 100) : 0;

        setAttendedMembers(tempAttendedMembers);
        setAttendanceCount(tempAttendanceCount);
        setLateCount(tempLateCount);
        setTotalMembers(tempTotalMembers);
        setAttendanceRate(tempAttendanceRate);
    };

    const handleStartAttendance = async () => {
        const finalTime = customTime ? parseInt(customTime) : attendanceTime;
        if (finalTime < 1 || finalTime > 120) {
            alert('출석 시간은 1분에서 120분 사이로 설정해주세요.');
            return;
        }

        const code = presetCode || generateAttendanceCode();

        try {
            // POST request to start session
            await axiosInstance.post(`/api/session/${selectedActivity.id}`, {
                attendanceCode: code,
                closableAfterMinutes: finalTime,
            });

            // Fetch the newly started ongoing session details
            const ongoingSessionResponse = await axiosInstance.get(`/api/session/activity/${selectedActivity.id}/ongoing`);
            const newOngoingSession = ongoingSessionResponse.data;

            // Update currentOngoingSession state
            setCurrentOngoingSession(prev => ({ ...prev, [selectedActivity.id]: newOngoingSession }));

            // Update button status and open state
            setActivityButtonStatus((prev) => ({ ...prev, [selectedActivity.id]: '출석 진행 중' }));
            setAttendanceOpen((prev) => ({ ...prev, [selectedActivity.id]: true }));
            setShowAttendanceModal(true); // Ensure modal is shown with updated data

            // The attendanceCode and timeLeft will be updated by the new useEffect
            // No need to set them directly here or manage interval here.

        } catch (error) {
            console.error('Error starting attendance session:', error);
            alert('출석 세션 시작에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleCloseAttendance = async (activityId) => {
        try {
            const session = currentOngoingSession[activityId];
            if (!session || !session.sessionId) {
                console.error('No ongoing session found for this activity or session ID is missing.');
                alert('세션 정보를 찾을 수 없습니다.');
                return;
            }

            const sessionId = session.sessionId;
            await axiosInstance.put(`/api/session/${sessionId}`, { status: 'CLOSED' }); // PUT request

            // Re-fetch all activities and statuses to update UI and lastClosedSession
            await fetchActivitiesAndStatuses();

            // Close the modal after successful update
            setShowAttendanceModal(false);
            setSelectedActivity(null);
            setAttendanceCode('');
            setTimeLeft(0);
            setCustomTime('');
            setPresetCode('');
            setCurrentSessionId(null); // Clear currentSessionId as well
        } catch (error) {
            console.error('Error closing attendance session:', error);
            alert('출석 세션 마감에 실패했습니다. 다시 시도해주세요.');
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
        // TODO: API call to extend session time
        // For now, just update timeLeft locally.
        setTimeLeft((prev) => prev + additionalMinutes * 60);
    };

    const handleExtendFromEndModal = (additionalMinutes) => {
        // TODO: API call to extend session time
        // For now, just update timeLeft locally.
        setTimeLeft(additionalMinutes * 60);
        setActivityButtonStatus((prev) => ({ ...prev, [selectedActivity.id]: '출석 진행 중' }));
        setAttendanceOpen((prev) => ({ ...prev, [selectedActivity.id]: true }));
        setShowTimeEndModal(false);
        setShowAttendanceModal(true);

        // The interval logic is now handled by the new useEffect, so remove it from here.
    };

    

    const handleReopenAttendance = (activity) => {
        setSelectedActivity(activity);
        const closedSession = lastClosedSession[activity.id];
        if (closedSession) {
            setReopenSessionData(closedSession);
            setReopenAttendanceCode(closedSession.attendancesCode);
            // For now, let's use a default value for closableAfterMinutes, e.g., 30 minutes.
            setReopenClosableMinutes('30'); // Placeholder
            setShowReopenModal(true);
        } else {
            alert('재오픈할 세션 정보를 찾을 수 없습니다.');
        }
    };

    const handleConfirmReopen = async () => {
        if (!reopenSessionData || !reopenSessionData.sessionId) {
            alert('재오픈할 세션 정보가 유효하지 않습니다.');
            return;
        }
        if (!reopenAttendanceCode.trim() || !reopenClosableMinutes.trim()) {
            alert('출석 코드와 출석 가능 시간을 입력해주세요.');
            return;
        }
        const minutes = parseInt(reopenClosableMinutes);
        if (isNaN(minutes) || minutes < 1 || minutes > 120) {
            alert('출석 시간은 1분에서 120분 사이로 설정해주세요.');
            return;
        }

        try {
            await axiosInstance.patch(`/api/session/${reopenSessionData.sessionId}/info`, {
                attendanceCode: reopenAttendanceCode,
                closableAfterMinutes: minutes,
            });

            // After successful re-open, update UI to reflect ongoing session
            // Fetch the newly re-opened ongoing session details
            const ongoingSessionResponse = await axiosInstance.get(`/api/session/activity/${selectedActivity.id}/ongoing`);
            const newOngoingSession = ongoingSessionResponse.data;

            setCurrentOngoingSession(prev => ({ ...prev, [selectedActivity.id]: newOngoingSession }));
            setActivityButtonStatus((prev) => ({ ...prev, [selectedActivity.id]: '출석 진행 중' }));
            setAttendanceOpen((prev) => ({ ...prev, [selectedActivity.id]: true }));

            setShowReopenModal(false);
            setShowAttendanceModal(true); // Open the ongoing attendance modal
            setReopenSessionData(null);
            setReopenAttendanceCode('');
            setReopenClosableMinutes('');
        } catch (error) {
            console.error('Error re-opening session:', error);
            alert('세션 재오픈에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleAttendanceManagement = async (activity) => {
        setSelectedActivity(activity);
        setShowAttendanceStatsModal(true);
        try {
            const response = await axiosInstance.get(`/api/attendance/me/create/${activity.id}`);
            if (response.data) {
                setWeeklySummaries(response.data.weeklySummaries || []);
                setParticipantSummaries(response.data.participantSummaries || []);
            }
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
            setWeeklySummaries([]);
            setParticipantSummaries([]);
        }
    };

    const getStatusColor = (activityStatus) => {
        switch (activityStatus) {
            case 'STARTED':
                return 'bg-green-100 text-green-700';
            case 'NOT_STARTED':
                return 'bg-yellow-100 text-yellow-700';
            case 'ENDED':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatSchedule = (recurringSchedules, eventSchedules) => {
        const daysMap = {
            MONDAY: '월',
            TUESDAY: '화',
            WEDNESDAY: '수',
            THURSDAY: '목',
            FRIDAY: '금',
            SATURDAY: '토',
            SUNDAY: '일',
        };

        if (recurringSchedules && recurringSchedules.length > 0) {
            const formattedSchedules = recurringSchedules.map(s => {
                const day = daysMap[s.dayOfWeek];
                const startTime = s.startTime.substring(0, 5);
                const endTime = s.endTime.substring(0, 5);
                return `${day} ${startTime} - ${endTime}`;
            });
            return formattedSchedules.join(', ');
        } else if (eventSchedules && eventSchedules.length > 0) {
            const formattedSchedules = eventSchedules.map(e => {
                const start = new Date(e.startDateTime);
                const end = new Date(e.endDateTime);

                const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
                const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
                const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

                return `${startDate} ${startTime} - ${endTime}`;
            });
            return formattedSchedules.join(', ');
        }
        return '일정 없음';
    };

    const handleEditActivity = (activity) => {
        setSelectedActivity(activity);

        const daysMapReverse = {
            '월': 'MONDAY',
            '화': 'TUESDAY',
            '수': 'WEDNESDAY',
            '목': 'THURSDAY',
            '금': 'FRIDAY',
            '토': 'SATURDAY',
            '일': 'SUNDAY',
        };

        let parsedDays = [];
        let parsedTime = '';

        if (activity.recurringSchedules && activity.recurringSchedules.length > 0) {
            parsedDays = activity.recurringSchedules.map(s => {
                const dayName = Object.keys(daysMapReverse).find(key => daysMapReverse[key] === s.dayOfWeek);
                return dayName;
            }).filter(Boolean);
            parsedTime = activity.recurringSchedules[0].startTime.substring(0, 5); // 첫 번째 스케줄의 시간 사용
        } else if (activity.eventSchedules && activity.eventSchedules.length > 0) {
            const firstEvent = activity.eventSchedules[0];
            const startDate = new Date(firstEvent.startDateTime);
            parsedDays = ['단일']; // 단일 이벤트임을 표시
            parsedTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
        }

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

        setActivityData((prevData) =>
            prevData.map((activity) =>
                activity.id === selectedActivity.id
                    ? {
                        ...activity,
                        title: editForm.title,
                        // schedule: scheduleString, // API 연동 시 recurringSchedules로 변경 필요
                        location: editForm.location,
                    }
                    : activity
            )
        );

        setShowEditModal(false);
        setSelectedActivity(null);
        setEditForm({ title: '', days: [], time: '', location: '' });
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

    const getAttendanceStatusColor = (status) => {
        switch (status) {
            case '출석':
                return 'bg-green-100 text-green-700';
            case '지각':
                return 'bg-yellow-100 text-yellow-700';
            case '결석':
                return 'bg-red-100 text-red-700';
            case '대기중':
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

    const handleToggleAttendanceExpansion = (activityId) => {
        setExpandedAttendance((prev) => ({
            ...prev,
            [activityId]: !prev[activityId],
        }));
    };

    return (
        <div className="space-y-4">
            {(() => {
                const displayActivities = activityData.filter(activity => activity.isApproved && activity.activityStatus === 'STARTED');
                if (displayActivities.length === 0) {
                    return (
                        <div className="bg-white rounded-xl p-6 text-center">
                            <i className="ri-calendar-check-line text-3xl text-gray-300 mb-2"></i>
                            <p className="text-gray-500">진행 중인 개설 활동이 없습니다.</p>
                        </div>
                    );
                }
                return displayActivities.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        {/* 활동 기본 정보 */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.activityStatus)}`}>
                                        {activity.activityStatus === 'NOT_STARTED' && '시작 전'}
                                        {activity.activityStatus === 'STARTED' && '진행 중'}
                                        {activity.activityStatus === 'ENDED' && '종료'}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <i className="ri-group-line mr-2"></i>
                                        <span>
                                            멤버: {activity.participantCount}/{activity.maxParticipants}명
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <i className="ri-calendar-line mr-2"></i>
                                        <span>{formatSchedule(activity.recurringSchedules, activity.eventSchedules)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <i className="ri-map-pin-line mr-2"></i>
                                        <span>{activity.location}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <i className="ri-play-circle-line mr-2"></i>
                                        <span>총 {activity.sessionCount}회 진행</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => {
                                    setSelectedActivity(activity); // Always set selectedActivity
                                    if (attendanceOpen[activity.id]) {
                                        setShowAttendanceModal(true); // Open ongoing modal
                                    } else if (activityButtonStatus[activity.id] === '출석 마감 됨') {
                                        handleReopenAttendance(activity); // Open reopen modal
                                    } else {
                                        handleOpenAttendance(activity); // Open new attendance modal
                                    }
                                }}
                                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activityButtonStatus[activity.id] === '출석 진행 중'
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : activityButtonStatus[activity.id] === '출석 마감 됨'
                                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' // Change color for re-open
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                                // Remove disabled attribute
                            >
                                {activityButtonStatus[activity.id] || '출석 오픈'}
                            </button>
                            {activity.activityStatus === 'STARTED' && (
                                <button
                                    onClick={() => handleAttendanceManagement(activity)}
                                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                                >
                                    출석 관리
                                </button>
                            )}
                        </div>
                    </div>
                ));
            })()}

            {/* 출석 코드 모달 */}
            {showAttendanceModal && selectedActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto relative">
                        <button
                            onClick={() => setShowAttendanceModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
                        >
                            <i className="ri-close-line text-gray-600"></i>
                        </button>
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
                                                className={`py-2 px-3 text-sm rounded-lg border transition-colors ${customTime === minutes.toString()
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

            {/* 출석 재오픈 모달 */}
            {showReopenModal && selectedActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto relative">
                        <button
                            onClick={() => setShowReopenModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
                        >
                            <i className="ri-close-line text-gray-600"></i>
                        </button>
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">출석 재오픈</h3>
                            <p className="text-sm text-gray-600">{selectedActivity.title}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">출석 코드</label>
                            <input
                                type="text"
                                value={reopenAttendanceCode}
                                onChange={(e) => setReopenAttendanceCode(e.target.value)}
                                maxLength="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="4자리 숫자"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">출석 가능 시간 (분)</label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={reopenClosableMinutes}
                                onChange={(e) => setReopenClosableMinutes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="30"
                            />
                            <p className="text-xs text-gray-500 text-center mt-1">
                                1분 ~ 120분 사이로 입력해주세요
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowReopenModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
                            >
                                취소
                            </button>
                            <button onClick={handleConfirmReopen} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">
                                재오픈
                            </button>
                        </div>
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
                                        const absentMembers = (selectedActivity.memberList || []).filter((member) => !attendedIds.includes(member.id));

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
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${editForm.days.includes(day)
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
                                                className={`py-2 px-3 text-sm rounded-lg border transition-colors ${editForm.time === time
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

            {/* 출석 현황 모달 */}
            {showAttendanceStatsModal && selectedActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">출석 현황</h3>
                            <button onClick={() => setShowAttendanceStatsModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6">
                            {/* 주차별 출석 현황 */}
                            <div>
                                <h4 className="text-base font-semibold text-gray-800 mb-4">주차별 출석 현황</h4>
                                {weeklySummaries.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                                        주차별 출석 현황 데이터가 없습니다.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {weeklySummaries.map((summary, index) => (
                                            <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-gray-900 text-base">{summary.weekNumber}주차</span>
                                                    <span className="text-sm text-gray-500">{summary.date}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 text-center mt-3">
                                                    <div className="bg-green-50 rounded-lg p-3">
                                                        <div className="text-lg font-bold text-green-700">{summary.attendedCount}</div>
                                                        <div className="text-xs text-gray-600">출석</div>
                                                    </div>
                                                    <div className="bg-yellow-50 rounded-lg p-3">
                                                        <div className="text-lg font-bold text-yellow-700">{summary.lateCount}</div>
                                                        <div className="text-xs text-gray-600">지각</div>
                                                    </div>
                                                    <div className="bg-red-50 rounded-lg p-3">
                                                        <div className="text-lg font-bold text-red-700">{summary.absentCount}</div>
                                                        <div className="text-xs text-gray-600">결석</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 멤버별 출석 현황 */}
                            <div>
                                <h4 className="text-base font-semibold text-gray-800 mb-4">멤버별 출석 현황</h4>
                                {participantSummaries.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                                        멤버별 출석 현황 데이터가 없습니다.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {participantSummaries.map((member, index) => (
                                            <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-gray-900 text-base">{member.name}</span>
                                                    <span className={`font-bold text-lg ${getAttendanceRateColor(member.attendanceRate)}`}>{member.attendanceRate}%</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 text-center mt-3">
                                                    <div className="bg-green-50 rounded-lg p-3">
                                                        <div className="text-lg font-bold text-green-700">{member.attendedCount}</div>
                                                        <div className="text-xs text-gray-600">출석</div>
                                                    </div>
                                                    <div className="bg-yellow-50 rounded-lg p-3">
                                                        <div className="text-lg font-bold text-yellow-700">{member.lateCount}</div>
                                                        <div className="text-xs text-gray-600">지각</div>
                                                    </div>
                                                    <div className="bg-red-50 rounded-lg p-3">
                                                        <div className="text-lg font-bold text-red-700">{member.absentCount}</div>
                                                        <div className="text-xs text-gray-600">결석</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <button onClick={() => setShowAttendanceStatsModal(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}