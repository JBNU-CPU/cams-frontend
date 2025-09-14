import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../../components/common/Alert";
import axiosInstance from "../../api/axiosInstance";

export default function FindPasswordPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [error, setError] = useState(null);

  // 이메일 인증 관련 state
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 비밀번호 재설정 관련 state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'succeeded' | 'failed'

  // 1. 인증 코드 발송 요청
  const handleSendVerificationCode = async () => {
    if (!studentId || !email) {
      setError("학번과 이메일을 모두 입력해주세요.");
      return;
    }
    setError(null);
    setStatus("loading");
    try {
      // TODO: 백엔드에 학번과 이메일이 일치하는지 확인하는 API 필요
      // 현재는 이메일 인증 코드 발송 API만 호출
      await axiosInstance.get(`/api/member/email/auth?email=${email}`);
      setEmailVerificationSent(true);
      setAlertMessage("인증 코드가 전송되었습니다. 이메일을 확인해주세요.");
    } catch (err) {
      setError("인증 코드 전송에 실패했습니다. 입력 정보를 확인해주세요.");
      console.error(err);
    } finally {
      setStatus("idle");
    }
  };

  // 2. 인증 코드 확인
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError("인증 코드를 입력해주세요.");
      return;
    }
    setError(null);
    setStatus("loading");
    try {
      await axiosInstance.post("/api/member/email/auth", null, {
        params: { email, auth: verificationCode },
      });
      setIsEmailVerified(true);
      setAlertMessage("이메일 인증이 완료되었습니다. 새 비밀번호를 설정해주세요.");
    } catch (error) {
      setError("인증 코드가 올바르지 않거나 만료되었습니다.");
    } finally {
      setStatus("idle");
    }
  };

  // 3. 비밀번호 재설정
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상으로 설정해주세요.");
      return;
    }
    setError(null);
    setStatus("loading");
    try {
      await axiosInstance.post("/api/member/password", {
        username: studentId,
        password: password,
      });
      setAlertMessage("비밀번호가 성공적으로 변경되었습니다.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
      console.error(err);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      {alertMessage && (
        <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <Link to="/login">
            <img
              src="/logo.png"
              alt="로고"
              className="mx-auto w-full h-auto max-w-[120px] sm:max-w-[160px] md:max-w-[200px]"
            />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-800">
            비밀번호 찾기
          </h1>
          <p className="mt-2 text-base text-gray-600 tracking-tight">
            {isEmailVerified
              ? "새로운 비밀번호를 설정해주세요."
              : "가입 시 사용한 학번과 이메일을 입력해주세요."}
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <form
            onSubmit={isEmailVerified ? handleResetPassword : (e) => e.preventDefault()}
            className="space-y-6"
          >
            {!isEmailVerified ? (
              <>
                {/* 학번/이메일 입력 단계 */}
                <div>
                  <label
                    htmlFor="studentId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    학번
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="학번을 입력하세요"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                    readOnly={emailVerificationSent}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    이메일
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      className="w-full px-4 pr-24 py-3 border border-gray-200 rounded-lg text-sm"
                      readOnly={emailVerificationSent}
                    />
                    {!emailVerificationSent && (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={status === "loading"}
                        className="absolute inset-y-0 right-0 my-1.5 mr-1.5 py-2 px-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
                      >
                        {status === "loading" ? "전송 중..." : "인증 요청"}
                      </button>
                    )}
                  </div>
                </div>

                {/* 인증 코드 입력 */}
                {emailVerificationSent && (
                  <div>
                    <label
                      htmlFor="verificationCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      인증 코드
                    </label>
                    <div className="relative">
                      <input
                        id="verificationCode"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="코드를 입력하세요"
                        className="w-full px-4 pr-24 py-3 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={status === "loading"}
                        className="absolute inset-y-0 right-0 my-1.5 mr-1.5 py-2 px-3 bg-blue-500 text-white rounded-lg text-sm font-semibold"
                      >
                        {status === "loading" ? "확인 중..." : "인증 확인"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 새 비밀번호 입력 단계 */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    새 비밀번호
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6자 이상 입력하세요"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    새 비밀번호 확인
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호를 다시 한번 입력하세요"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <i className={showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg"
                >
                  {status === "loading" ? "변경 중..." : "비밀번호 변경"}
                </button>
              </>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-500 mt-4">
                <i className="ri-error-warning-line"></i>
                <span>{error}</span>
              </div>
            )}
          </form>
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                로그인 페이지로 돌아가기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
