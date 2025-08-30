import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // 이전 에러 메시지 초기화

    // 1. 입력 값 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 2. 실제 로그인 로직 (여기서는 시뮬레이션)
    // 실제 애플리케이션에서는 이 부분에 API 호출 코드가 들어갑니다.
    console.log('로그인 시도:', { email, password });

    // 로그인 성공 시나리오 (예: 이메일과 비밀번호가 'test'일 경우)
    if (email === 'test@test.com' && password === '1234') {
      alert('로그인에 성공했습니다!');
      navigate('/'); // 로그인 성공 후 홈으로 이동
    } else {
      // 로그인 실패 시나리오
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full mx-auto">
        
        {/* 로고 또는 앱 이름 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600" style={{ fontFamily: "'Pacifico', cursive" }}>
            CPU
          </h1>
          <p className="text-gray-600 mt-2">
            활동과 성장을 위한 우리만의 공간
          </p>
        </div>

        {/* 로그인 폼 카드 */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 입력 필드 */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="ri-mail-line text-gray-400"></i>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="예: user@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 비밀번호 입력 필드 */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="ri-lock-password-line text-gray-400"></i>
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 에러 메시지 표시 */}
            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-500">
                 <i className="ri-error-warning-line"></i>
                 <span>{error}</span>
              </div>
            )}
            
            {/* 로그인 버튼 */}
            <div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                로그인
              </button>
            </div>
          </form>

          {/* 추가 옵션 링크 */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
                회원가입
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}