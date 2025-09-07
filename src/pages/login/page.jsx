import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/authSlice';
import Alert from '../../components/common/Alert';

export default function LoginPage() {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux store에서 auth slice의 상태를 가져옵니다.
    const { status, error, isLoggedIn } = useSelector((state) => state.auth);

    // isLoggedIn 상태가 true로 바뀌면 홈으로 이동합니다.
    useEffect(() => {
        if (isLoggedIn) {
            setAlertMessage('로그인에 성공했습니다!'); // ✅ 알림 메시지 띄우기
            setTimeout(() => {
                navigate('/home');
            }, 500); // 0.5초 뒤 홈으로 이동
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!studentId || !password) {
            // 간단한 프론트엔드 유효성 검사는 유지합니다.
            // dispatch(login.rejected('학번과 비밀번호를 모두 입력해주세요.')); // 이렇게는 사용하지 않습니다.
            return; // 여기서 멈추고 UI 피드백은 로컬 state나 직접적인 에러 표시로 처리 가능
        }
        // login 액션을 dispatch합니다. createAsyncThunk가 API 호출을 처리합니다.
        dispatch(login({ studentId, password }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            {alertMessage && (
                <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
            )}
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <img
                        src="/logo.png"
                        alt="로고"
                        className="mx-auto w-full h-auto max-w-[120px] sm:max-w-[160px] md:max-w-[200px]"
                    />
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                                학번
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <i className="ri-user-line text-gray-400"></i>
                                </span>
                                <input
                                    id="studentId"
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    placeholder="학번을 입력하세요"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                        {/* Redux의 에러 상태를 화면에 표시합니다. */}
                        {status === 'failed' && error && (
                            <div className="flex items-center space-x-2 text-sm text-red-500">
                                <i className="ri-error-warning-line"></i>
                                <span>{error}</span>
                            </div>
                        )}
                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? '로그인 중...' : '로그인'}
                            </button>
                        </div>
                    </form>
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

