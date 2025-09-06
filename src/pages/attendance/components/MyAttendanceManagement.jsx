import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';

export default function MyAttendanceManagement() {
  const [showChart, setShowChart] = useState(false);
  const [showAllRecordsModal, setShowAllRecordsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('전체');
  const [participatingActivities, setParticipatingActivities] = useState([
    { id: 'all', name: '전체' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axiosInstance.get('/api/me/activity/participate');
        // Spring Boot의 Page 객체로 감싸여 있으므로, 실제 데이터는 content에 있습니다.
        const rawActivityContent = response.data.content;
        
        let activityList = [];
        if (Array.isArray(rawActivityContent)) {
          activityList = rawActivityContent;
        } else if (rawActivityContent && typeof rawActivityContent[Symbol.iterator] === 'function') {
          // If it's iterable but not an array, convert it to an array
          activityList = Array.from(rawActivityContent);
        } else {
          console.error('활동 목록을 배열 형태로 변환할 수 없습니다. content의 타입:', typeof rawActivityContent, '값:', rawActivityContent);
          return; // Exit if we can't get an array
        }

        const activities = activityList.map((activity) => ({
          id: activity.id,
          name: activity.title,
        }));
        setParticipatingActivities((prev) => {
          const newActivities = [...prev];
          activities.forEach(activity => {
            if (!newActivities.some(existing => existing.id === activity.id)) {
              newActivities.push(activity);
            }
          });
          return newActivities;
        });
        
      } catch (error) {
        console.error('Error fetching participating activities:', error);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchMyAttendances = async () => {
      try {
        const response = await axiosInstance.get('/api/attendance/me');
        const rawAttendanceContent = response.data.content;

        if (Array.isArray(rawAttendanceContent)) {
          setMyAttendances(rawAttendanceContent);
          processAttendanceData(rawAttendanceContent);
        } else {
          console.error('출석 데이터를 배열 형태로 변환할 수 없습니다. content의 타입:', typeof rawAttendanceContent, '값:', rawAttendanceContent);
        }
      } catch (error) {
        console.error('Error fetching my attendances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyAttendances();
  }, []);

  const processAttendanceData = (attendances) => {
    let totalActivitiesSet = new Set();
    let totalSessionsCount = 0;
    let attendedSessionsCount = 0;

    const activityStatsMap = new Map();
    const recentAttendancesList = [];
    const attendanceDetailsCalculated = {};

    attendances.forEach(attendance => {
      const activityId = attendance.activityId;
      const activityTitle = attendance.activityTitle;
      const status = attendance.attendanceStatus;
      const attendanceTime = new Date(attendance.attendanceTime);

      totalActivitiesSet.add(activityId);
      totalSessionsCount++;

      if (status === 'PRESENT' || status === 'LATE') {
        attendedSessionsCount++;
      }

      if (!activityStatsMap.has(activityId)) {
        activityStatsMap.set(activityId, {
          id: activityId,
          name: activityTitle,
          total: 0,
          attended: 0,
          late: 0,
          absent: 0,
          streak: 0,
        });
      }
      const currentActivityStats = activityStatsMap.get(activityId);
      currentActivityStats.total++;
      if (status === 'PRESENT') {
        currentActivityStats.attended++;
      } else if (status === 'LATE') {
        currentActivityStats.late++;
        currentActivityStats.attended++;
      } else if (status === 'ABSENT') {
        currentActivityStats.absent++;
      }

      recentAttendancesList.push({
        id: `${attendance.activityId}-${attendance.sessionNumber}`,
        activity: activityTitle,
        date: attendanceTime.toLocaleDateString('ko-KR'),
        week: `${attendance.sessionNumber}주차`,
        time: attendanceTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: status === 'PRESENT' ? '출석' : status === 'LATE' ? '지각' : '결석',
      });
    });

    const overallAttendanceRate = totalSessionsCount > 0 ? Math.round((attendedSessionsCount / totalSessionsCount) * 100) : 0;

    setMyStats({
      totalActivities: totalActivitiesSet.size,
      totalSessions: totalSessionsCount,
      attendedSessions: attendedSessionsCount,
      attendanceRate: overallAttendanceRate,
      perfectAttendance: 0, // Cannot calculate with current data
    });

    const finalActivityStats = Array.from(activityStatsMap.values()).map(activity => {
      const rate = activity.total > 0 ? Math.round((activity.attended / activity.total) * 100) : 0;
      return { ...activity, rate };
    });
    setActivityStats(finalActivityStats);

    recentAttendancesList.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    setRecentAttendances(recentAttendancesList);

    attendanceDetailsCalculated['전체'] = {
      rate: overallAttendanceRate,
      attended: attendedSessionsCount,
      late: attendances.filter(a => a.attendanceStatus === 'LATE').length,
      absent: attendances.filter(a => a.attendanceStatus === 'ABSENT').length,
    };
    finalActivityStats.forEach(activity => {
      attendanceDetailsCalculated[activity.name] = {
        rate: activity.rate,
        attended: activity.attended,
        late: activity.late,
        absent: activity.absent,
      };
    });
    setAttendanceDetails(attendanceDetailsCalculated);
  };

  const [myAttendances, setMyAttendances] = useState([]);
  const [myStats, setMyStats] = useState({
    totalActivities: 0,
    totalSessions: 0,
    attendedSessions: 0,
    attendanceRate: 0,
    perfectAttendance: 0,
  });
  const [activityStats, setActivityStats] = useState([]);
  const [recentAttendances, setRecentAttendances] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState({});

  const filteredActivityStats =
    selectedActivity === '전체'
      ? activityStats
      : activityStats.filter(a => a.name === selectedActivity);

  const filteredRecentAttendances =
    selectedActivity === '전체'
      ? recentAttendances
      : recentAttendances.filter(r => r.activity === selectedActivity);

  const currentAttendance = attendanceDetails[selectedActivity] || { rate: 0, attended: 0, late: 0, absent: 0 };

  const statusBadge = (status) => {
    const map = {
      출석: 'bg-green-100 text-green-700',
      지각: 'bg-yellow-100 text-yellow-700',
      결석: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-gray-500">출석 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (myAttendances.length === 0) {
    return (
        <div className="bg-white rounded-xl p-6 text-center">
            <i className="ri-calendar-check-line text-3xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">현재 참여 중인 활동이 없습니다.</p>
        </div>
    );
  }
  return (
    <div className="space-y-6">

      {/* 활동 선택 탭 */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {participatingActivities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setSelectedActivity(activity.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              selectedActivity === activity.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {activity.name}
          </button>
        ))}
      </div>

      {/* 출석 현황 */}
      <div className="pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">출석 현황</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{currentAttendance.rate}%</p>
            <p className="text-sm text-gray-600">출석률</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{currentAttendance.attended}</p>
            <p className="text-sm text-gray-600">출석</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-600">{currentAttendance.late}</p>
            <p className="text-sm text-gray-600">지각</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold text-red-600">{currentAttendance.absent}</p>
            <p className="text-sm text-gray-600">결석</p>
          </div>
        </div>
      </div>

      {/* 최근 출석 기록 */}
      <div>
        <div className="flex items-center justify-between my-3">
          <h3 className="font-semibold text-gray-900">최근 출석 기록</h3>
          <button
            onClick={() => setShowAllRecordsModal(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            더 보기
          </button>
        </div>

        <div className="space-y-3">
          {filteredRecentAttendances.slice(0, 3).map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-900">{r.activity}</p>
                    <p className="text-sm text-gray-500">{r.week}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="flex items-center space-x-1.5">
                      <i className="ri-calendar-line"></i>
                      <span>{r.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <i className="ri-time-line"></i>
                      <span>{r.time}</span>
                    </span>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusBadge(r.status)}`}>
                  <i className="ri-checkbox-blank-circle-fill text-xs"></i>
                  <span>{r.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 모달 (간단 막대/도넛 스타일의 div 차트) */}
      {showChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-bar-chart-2-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">내 출석 통계</h3>
              <p className="text-sm text-gray-500">활동별 출석률 요약</p>
            </div>

            <div className="space-y-3 mb-6">
              {activityStats.map((a) => (
                <div key={a.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{a.name}</span>
                    <span className="text-sm text-gray-500">{a.attended}/{a.total} ({a.rate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${a.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowChart(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 전체 출석 기록 모달 */}
      {showAllRecordsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedActivity} 출석 기록
              </h3>
              <button onClick={() => setShowAllRecordsModal(false)} className="text-gray-500 hover:text-gray-800">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto -mr-2 pr-2">
              {filteredRecentAttendances.map((r) => (
                <div key={r.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">{r.activity}</p>
                        <p className="text-sm text-gray-500">{r.week}</p>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center space-x-1.5">
                          <i className="ri-calendar-line"></i>
                          <span>{r.date}</span>
                        </span>
                        <span className="flex items-center space-x-1.5">
                          <i className="ri-time-line"></i>
                          <span>{r.time}</span>
                        </span>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusBadge(r.status)}`}>
                      <i className="ri-checkbox-blank-circle-fill text-xs"></i>
                      <span>{r.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
