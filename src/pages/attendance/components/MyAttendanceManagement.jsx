import { useState } from 'react';

export default function MyAttendanceManagement() {
  const [showChart, setShowChart] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('전체');

  // 참여 활동 목록 (필터 드롭다운)
  const participatingActivities = [
    { id: 'all', name: '전체' },
    { id: '1', name: 'React 스터디 그룹' },
    { id: '2', name: 'AI 프로젝트 팀' },
    { id: '3', name: '독서 모임' },
    { id: '4', name: 'Flutter 개발 스터디' },
    { id: '5', name: '영어 회화 모임' },
    { id: '6', name: '디자인 워크숍' }
  ];

  // 내 출석 통계(목업)
  const myStats = {
    totalActivities: 5,
    totalSessions: 26,
    attendedSessions: 22,
    attendanceRate: Math.round((22 / 26) * 100),
    perfectAttendance: 2, // 개근 활동 수
  };

  // 활동별 출석(목업)
  const activityStats = [
    { id: '1', name: 'React 스터디 그룹', total: 12, attended: 10, rate: 83, streak: 4 },
    { id: '2', name: 'AI 프로젝트 팀', total: 8, attended: 7, rate: 88, streak: 2 },
    { id: '3', name: '독서 모임', total: 4, attended: 4, rate: 100, streak: 4 },
    { id: '4', name: 'Flutter 개발 스터디', total: 6, attended: 4, rate: 67, streak: 1 },
    { id: '5', name: '영어 회화 모임', total: 5, attended: 5, rate: 100, streak: 5 },
    { id: '6', name: '디자인 워크숍', total: 3, attended: 2, rate: 67, streak: 1 },
  ];

  // 최근 출석 기록(목업)
  const recentAttendances = [
    { id: 'ra1', activity: 'React 스터디 그룹', date: '2025-08-28', week: '10주차', status: '출석' },
    { id: 'ra2', activity: 'AI 프로젝트 팀', date: '2025-08-26', week: '7주차', status: '출석' },
    { id: 'ra3', activity: '독서 모임', date: '2025-08-22', week: '4주차', status: '출석' },
    { id: 'ra4', activity: 'Flutter 개발 스터디', date: '2025-08-20', week: '4주차', status: '지각' },
    { id: 'ra5', activity: '영어 회화 모임', date: '2025-08-18', week: '5주차', status: '출석' },
  ];

  const filteredActivityStats =
    selectedActivity === '전체'
      ? activityStats
      : activityStats.filter(a => a.name === selectedActivity);

  const statusBadge = (status) => {
    const map = {
      출석: 'bg-green-100 text-green-700',
      지각: 'bg-yellow-100 text-yellow-700',
      결석: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">참여 활동</p>
              <p className="text-xl font-bold text-gray-900">{myStats.totalActivities}</p>
            </div>
            <i className="ri-group-line text-2xl text-gray-400"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">총 세션</p>
              <p className="text-xl font-bold text-gray-900">{myStats.totalSessions}</p>
            </div>
            <i className="ri-calendar-line text-2xl text-gray-400"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">출석</p>
              <p className="text-xl font-bold text-gray-900">{myStats.attendedSessions}</p>
            </div>
            <i className="ri-check-line text-2xl text-gray-400"></i>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">출석률</p>
              <p className="text-xl font-bold text-gray-900">{myStats.attendanceRate}%</p>
            </div>
            <i className="ri-bar-chart-2-line text-2xl text-gray-400"></i>
          </div>
        </div>
      </div>

      {/* 필터 + 차트 버튼 */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">활동 선택</label>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
          >
            {participatingActivities.map(opt => (
              <option key={opt.id} value={opt.name}>{opt.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowChart(true)}
          className="mt-6 whitespace-nowrap px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          출석 차트
        </button>
      </div>


      {/* 최근 출석 기록 */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">최근 출석 기록</h3>
          <button
            onClick={() => setShowChart(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            전체 통계 보기
          </button>
        </div>

        <div className="space-y-3">
          {recentAttendances.map((r) => (
            <div key={r.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{r.activity}</p>
                <p className="text-sm text-gray-500">{r.date} · {r.week}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>
                {r.status}
              </span>
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
    </div>
  );
}
