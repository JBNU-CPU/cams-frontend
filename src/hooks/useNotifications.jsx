import { useState } from 'react';
// 초기 알림 데이터는 mock 파일에서 가져옵니다.
import { notifications as initialNotifications } from '../api/NotificationData';

/**
 * 알림 상태와 관련 함수들을 관리하는 커스텀 훅
 */
export const useNotifications = () => {
    // 알림 목록을 관리하는 상태. 초기값으로 mock 데이터를 사용합니다.
    const [notificationList, setNotificationList] = useState(initialNotifications);

    // 단일 알림을 ID를 통해 제거하는 함수
    const dismissNotification = (notificationId) => {
        setNotificationList(currentList =>
            currentList.filter(n => n.id !== notificationId)
        );
    };

    // 모든 알림을 제거하는 함수
    const dismissAllNotifications = () => {
        setNotificationList([]);
    };

    // 현재 알림 목록을 기준으로 읽지 않은 알림 수를 계산합니다.
    const unreadCount = notificationList.filter(n => !n.isRead).length;

    // 컴포넌트에서 필요한 모든 것을 객체로 묶어 반환합니다.
    return {
        notificationList,
        unreadCount,
        dismissNotification,
        dismissAllNotifications,
    };
};
