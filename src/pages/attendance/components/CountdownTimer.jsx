import { useState, useEffect } from 'react';

// 출석 가능한 활동 남은 시간 실시간 확인용 (분단위)
export default function CountdownTimer({ closedAt, onExpire }) {
  const calculateTimeLeft = () => {
    if (!closedAt) {
      return { text: '자동 마감 없음', expired: false };
    }

    const endTime = new Date(closedAt).getTime();
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance <= 0) {
      return { text: '마감되었습니다.', expired: true };
    }

    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const text = minutes > 0 ? `${minutes}분 ${seconds}초 남음` : `${seconds}초 남음`;
    return { text, expired: false };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft().text);

  useEffect(() => {
    const initialCheck = calculateTimeLeft();
    if (initialCheck.expired) {
      setTimeLeft(initialCheck.text);
      if (onExpire) {
        onExpire();
      }
      return;
    }
    
    setTimeLeft(initialCheck.text);

    const timer = setInterval(() => {
      const result = calculateTimeLeft();
      setTimeLeft(result.text);
      if (result.expired) {
        if (onExpire) {
          onExpire();
        }
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [closedAt, onExpire]);

  return <span>{timeLeft}</span>;
}
