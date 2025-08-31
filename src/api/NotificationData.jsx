// 1. 알림 데이터 (실제 앱에서는 API를 통해 받아옵니다)
export const notifications = [
    { id: '1', type: 'application', title: 'React 스터디 그룹', message: '새로운 신청자가 있습니다.', time: '5분 전', isRead: false },
    { id: '2', type: 'attendance', title: 'AI 프로젝트 팀', message: '출석 시간이 시작되었습니다.', time: '1시간 전', isRead: false },
    { id: '3', type: 'approval', title: '독서 모임', message: '활동 참여가 승인되었습니다.', time: '2시간 전', isRead: true },
    { id: '4', type: 'reminder', title: '창업 아이디어 경진대회', message: '내일 활동이 예정되어 있습니다.', time: '1일 전', isRead: true }
];

// 2. 알림 아이콘/색상 관련 헬퍼 함수
export const getNotificationIcon = (type) => {
    switch (type) {
        case 'application': return 'ri-user-add-line';
        case 'attendance': return 'ri-calendar-check-line';
        case 'approval': return 'ri-check-circle-line';
        case 'reminder': return 'ri-alarm-line';
        default: return 'ri-notification-line';
    }
};

export const getNotificationColor = (type) => {
    switch (type) {
        case 'application': return 'text-blue-600 bg-blue-100';
        case 'attendance': return 'text-green-600 bg-green-100';
        case 'approval': return 'text-purple-600 bg-purple-100';
        case 'reminder': return 'text-orange-600 bg-orange-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};
