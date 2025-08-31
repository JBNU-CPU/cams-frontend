import { useState, useEffect } from 'react';

// 출석 가능한 활동 남은 시간 실시간 확인용 (분단위)
export default function CountdownTimer({ closedAt }) {
  const calculateTimeLeft = () => {
    if (!closedAt) {
      return '자동 마감 없음';
    }

    const endTime = new Date(closedAt).getTime();
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance <= 0) {
      return '마감되었습니다.';
    }

    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}분 ${seconds}초 남음`;
    } else {
      return `${seconds}초 남음`;
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!closedAt || new Date(closedAt).getTime() - new Date().getTime() <= 0) {
      setTimeLeft(calculateTimeLeft());
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [closedAt]);

  return <span>{timeLeft}</span>;
}
