import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Alert from "../../components/common/Alert";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState(""); // email state를 studentId로 변경
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // 이전 에러 메시지 초기화

    // 1. 입력 값 유효성 검사 (studentId로 변경)
    if (!name || !studentId || !password || !confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상으로 설정해주세요.");
      return;
    }

    // 2. 실제 회원가입 로직 (studentId로 변경)
    console.log("회원가입 정보:", { name, studentId, password });

    const requestBody = {
      name: name,
      username: studentId,
      password: password,
    };

    try {
      let response = await axiosInstance.post("/api/member", requestBody);
      console.log(response.data);
      setAlertMessage("프로필이 성공적으로 저장되었습니다.");
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      setAlertMessage(`오류 발생! 이미 가입된 회원입니다.`);
      // todo: 바꿔야함 일단 가입된 회원이라고 한다
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
      <div className="max-w-md w-full mx-auto">
        {/* 로고 또는 앱 이름 */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="로고"
            className="mx-auto w-full h-auto max-w-[120px] sm:max-w-[160px] md:max-w-[200px]"
          />
          <p className="mt-2 text-base text-gray-600 tracking-tight">
            CPU 활동 관리 시스템
          </p>
          <p className="mt-4 text-xl font-bold text-gray-800">회원가입</p>
        </div>

        {/* 회원가입 폼 카드 */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 입력 필드 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이름
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="ri-user-line text-gray-400"></i>
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 학번 입력 필드 (수정된 부분) */}
            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                학번
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="ri-mail-line text-gray-400"></i>
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6자 이상 입력하세요"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <i
                    className={
                      showPassword
                        ? "ri-eye-off-line text-gray-400"
                        : "ri-eye-line text-gray-400"
                    }
                  ></i>
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 필드 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <i className="ri-lock-password-line text-gray-400"></i>
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 한번 입력하세요"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <i
                    className={
                      showConfirmPassword
                        ? "ri-eye-off-line text-gray-400"
                        : "ri-eye-line text-gray-400"
                    }
                  ></i>
                </button>
              </div>
            </div>

            {/* 에러 메시지 표시 */}
            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-500">
                <i className="ri-error-warning-line"></i>
                <span>{error}</span>
              </div>
            )}

            {/* 회원가입 버튼 */}
            <div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                가입하기
              </button>
            </div>
          </form>

          {/* 추가 옵션 링크 (로그인 페이지로 수정) */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
