import { useRoutes } from 'react-router-dom';
import routes from './config';

/**
 * useRoutes 훅을 사용하여 라우트 설정을 기반으로
 * 현재 URL에 맞는 컴포넌트를 렌더링합니다.
 */
export default function AppRouter() {
  const element = useRoutes(routes);
  
  return element;
}