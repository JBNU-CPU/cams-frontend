import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState(null);

    // 폼 데이터를 관리하는 상태
    const [formData, setFormData] = useState({
        grade: '1', // 학년
        classNumber: '', // 기수
        phone: '', // 휴대폰 번호
        email: '', // 이전 페이지에서 받아온 이메일 (예시)
        nickname: '', // 닉네임
    });
    const [error, setError] = useState('');

    // 입력 값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // 유효성 검사
        if (!formData.classNumber || !formData.phone || !formData.nickname) {
            setError('모든 필수 항목을 입력해주세요.');
            return;
        }

        // 실제 온보딩 정보 저장 로직 (여기서는 시뮬레이션)
        console.log('온보딩 정보 저장:', formData);

        setAlertMessage('프로필 설정이 완료되었습니다! 활동을 시작해보세요.');
        setTimeout(() => navigate('/home'), 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
            {alertMessage && (
                <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
            )}
            <div className="max-w-md w-full mx-auto">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        프로필 설정
                    </h1>
                    <p className="text-gray-600 mt-2">
                        활동을 시작하기 전에 몇 가지만 더 알려주세요!
                    </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            {/* 학년 선택 */}
                            <div>
                                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">학년 <span className="text-red-500">*</span></label>
                                <select
                                    id="grade"
                                    name="grade"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="1">1학년</option>
                                    <option value="2">2학년</option>
                                    <option value="3">3학년</option>
                                    <option value="4">4학년 이상</option>
                                </select>
                            </div>

                            {/* 기수 입력 */}
                            <div>
                                <label htmlFor="classNumber" className="block text-sm font-medium text-gray-700 mb-2">기수 <span className="text-red-500">*</span></label>
                                <input
                                    id="classNumber"
                                    name="classNumber"
                                    type="number"
                                    value={formData.classNumber}
                                    onChange={handleChange}
                                    placeholder="예: 10기 -> 10"
                                    className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* 휴대폰 번호 */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">휴대폰 번호 <span className="text-red-500">*</span></label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="'-' 없이 숫자만 입력"
                                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* 이메일 */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">이메일 <span className="text-red-500">*</span></label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="예: 202412345@student.ac.kr"
                                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* 닉네임 */}
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">닉네임 <span className="text-red-500">*</span></label>
                            <input
                                id="nickname"
                                name="nickname"
                                type="text"
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="활동에 사용할 닉네임을 입력하세요"
                                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="flex items-center space-x-2 text-sm text-red-500">
                                <i className="ri-error-warning-line"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* 완료 버튼 */}
                        <div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors mt-2"
                            >
                                설정 완료
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}