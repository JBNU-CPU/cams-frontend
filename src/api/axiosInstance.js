// api/axiosInstance.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';
// const BASE_URL = 'http://175.123.55.182:8080';

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// ❗ 재발급은 인터셉터가 없는 클라이언트로 호출
const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

let isRefreshing = false;
let pendingQueue = []; // { resolve, reject, originalRequest }

function processQueue(error, token = null) {
    pendingQueue.forEach(({ resolve, reject, originalRequest }) => {
        if (error) {
            reject(error);
        } else {
            // 새 토큰으로 원요청 재시도
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
        }
    });
    pendingQueue = [];
}

// 요청 인터셉터: Access 토큰 붙이기
axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config || {};

        // 네트워크/서버 다운 등
        if (!error.response) {
            return Promise.reject(error);
        }

        const { status } = error.response;

        // /reissue 자체 실패면 즉시 로그아웃
        const isReissueCall =
            originalRequest.url?.endsWith('/reissue') ||
            originalRequest.url === '/reissue' ||
            originalRequest.__isReissue === true;

        if (status === 401 && !isReissueCall) {
            // 이미 재시도한 요청(무한루프 방지)
            if (originalRequest._retry) {
                return Promise.reject(error);
            }
            originalRequest._retry = true;

            if (isRefreshing) {
                // 토큰 갱신 대기 큐에 저장
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject, originalRequest });
                });
            }

            try {
                isRefreshing = true;

                // ❗ refreshClient 사용: 만료 토큰 안 붙음
                const resp = await refreshClient.post('/reissue', null, {});

                // 서버가 Authorization 헤더로 내려주는 경우(일반적)
                // CORS: 서버에 Access-Control-Expose-Headers: Authorization 필수
                const authHeader = resp.headers?.authorization || resp.headers?.Authorization;
                if (!authHeader) throw new Error('No Authorization header on refresh response');

                const parts = authHeader.split(' ');
                const newAccessToken = parts.length === 2 ? parts[1] : authHeader;

                // 저장 + 기본 헤더 갱신
                localStorage.setItem('accessToken', newAccessToken);
                axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

                // 대기 중인 요청들 재시도
                processQueue(null, newAccessToken);

                // 원요청 재시도
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // 실패 시 정리 후 로그인 화면으로
                localStorage.removeItem('accessToken');
                isRefreshing = false;
                pendingQueue = [];
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // 재발급 자체가 401이면 로그아웃
        if (status === 401 && isReissueCall) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
