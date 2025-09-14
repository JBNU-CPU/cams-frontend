import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Alert from "../../components/common/Alert";


export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 이메일 인증 관련 state
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [studentIdStatus, setStudentIdStatus] = useState({ message: "", type: "" });

  const handleCheckStudentId = async () => {
    if (!studentId) {
      setStudentIdStatus({ message: "", type: "" });
      return;
    }

    // 학번 형식 검사 (9자리 숫자)
    const studentIdRegex = /^\d{9}$/;
    if (!studentIdRegex.test(studentId)) {
      setStudentIdStatus({
        message: "학번은 9자리 숫자로 입력해주세요.",
        type: "error",
      });
      return;
    }

    try {
      await axiosInstance.get(`/api/member/check-username?username=${studentId}`);
      setStudentIdStatus({ message: "사용 가능한 학번입니다.", type: "success" });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setStudentIdStatus({ message: "이미 사용 중인 학번입니다.", type: "error" });
      } else {
        setStudentIdStatus({ message: "학번 확인 중 오류가 발생했습니다.", type: "error" });
      }
    }
  };

  const handleSendVerificationCode = async () => {
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }
    setEmailError("");
    setVerificationError("");
    try {
      // 1. 이메일 중복 확인
      await axiosInstance.get(`/api/member/check-email?email=${email}`);

      // 2. 중복이 아닐 경우 인증 코드 전송
      try {
        await axiosInstance.get(`/api/member/email/auth?email=${email}`);
        setEmailVerificationSent(true);
        setAlertMessage("인증 코드가 전송되었습니다. 이메일을 확인해주세요.");
      } catch (error) {
        setEmailError(
          "인증 코드 전송에 실패했습니다. 잠시 후 다시 시도해주세요."
        );
        console.error("Email verification sending error:", error);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setEmailError("이미 가입된 이메일입니다.");
      } else {
        setEmailError(
          "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
      console.error("Email duplication check error:", error);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setVerificationError("인증 코드를 입력해주세요.");
      return;
    }
    setEmailError("");
    setVerificationError("");
    try {
      await axiosInstance.post("/api/member/email/auth", null, {
        params: {
          email: email,
          auth: verificationCode,
        },
      });
      setIsEmailVerified(true);
      setAlertMessage("이메일 인증이 완료되었습니다.");
    } catch (error) {
      setVerificationError("인증 코드가 올바르지 않거나 만료되었습니다.");
      console.error("Email verification code error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // 이전 에러 메시지 초기화

    // 1. 입력 값 유효성 검사
    if (!name || !email || !studentId || !password || !confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }
    if (studentIdStatus.type === 'error') {
      setError("학번 중복 확인이 되지 않았습니다.");
      return;
    }
    if (!isEmailVerified) {
      setError("이메일 인증을 완료해주세요.");
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

    // 2. 실제 회원가입 로직
    console.log("회원가입 정보:", {
      name,
      email,
      studentId,
      password,
      verificationCode,
    });

    const requestBody = {
      name: name,
      email: email,
      username: studentId,
      password: password,
      // TODO: 인증 코드도 함께 보내야 할 수 있음
    };

    try {
      await axiosInstance.post("/api/member", requestBody);
      setAlertMessage("회원가입이 성공적으로 완료되었습니다.");
      setTimeout(() => navigate("/login"), 500);
    } catch (error) {
      console.error("회원가입 실패:", error);
      setAlertMessage(`오류 발생! 이미 가입된 회원이거나 서버 오류입니다.`);
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
                  placeholder="이메일을 입력하세요"
                  className="w-full pl-10 pr-24 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={isEmailVerified || emailVerificationSent}
                />
                {email && !isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className="absolute inset-y-0 right-0 my-1.5 mr-1.5 py-2 px-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                  >
                    {emailVerificationSent ? "재전송" : "인증"}
                  </button>
                )}
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-500">{emailError}</p>
              )}
              {emailVerificationSent && (
                <>
                  {!isEmailVerified ? (
                    <div className="mt-4">
                      <label
                        htmlFor="verificationCode"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        인증 코드
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <i className="ri-shield-check-line text-gray-400"></i>
                        </span>
                        <input
                          id="verificationCode"
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="코드를 입력하세요"
                          className="w-full pl-10 pr-24 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {verificationCode && (
                          <button
                            type="button"
                            onClick={handleVerifyCode}
                            className="absolute inset-y-0 right-0 my-1.5 mr-1.5 py-2 px-3 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                          >
                            인증하기
                          </button>
                        )}
                      </div>
                      {verificationError && (
                        <p className="mt-2 text-sm text-red-500">
                          {verificationError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-green-600 font-semibold">
                      <i className="ri-checkbox-circle-line align-middle mr-1"></i>
                      이메일 인증이 완료되었습니다.
                    </p>
                  )}
                </>
              )}
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
                  <i className="ri-book-read-line text-gray-400"></i>
                </span>
                <input
                  id="studentId"
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setStudentIdStatus({ message: "", type: "" });
                  }}
                  onBlur={handleCheckStudentId}
                  placeholder="학번을 입력하세요"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {studentIdStatus.message && (
                <p className={`mt-2 text-sm ${studentIdStatus.type === 'error' ? 'text-red-500' : 'text-green-600'
                  }`}>
                  {studentIdStatus.message}
                </p>
              )}
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
                disabled={!isEmailVerified}
                className={`w-full py-3 text-white rounded-lg font-semibold text-lg transition-colors ${isEmailVerified
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
                  }`}
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
