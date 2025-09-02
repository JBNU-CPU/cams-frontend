import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://192.168.0.4:8080',
    withCredentials: true,
});

// 요청 인터셉터 (변경 없음)
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (수정된 부분)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // ❗❗ 핵심 수정 사항 ❗❗
        // 401 에러가 발생했고, 그 요청이 토큰 재발급(/reissue) 요청이 '아닌' 경우에만 재발급을 시도합니다.
        if (error.response.status === 401 && originalRequest.url !== '/reissue' && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log('Access token expired. Trying to refresh token...');
                const response = await axiosInstance.post('/reissue');

                const newAccessToken = response.headers['authorization'].split(' ')[1];
                localStorage.setItem('accessToken', newAccessToken);

                console.log('Token refreshed successfully. Retrying original request...');
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                console.error('Token refresh failed. Logging out...', refreshError);
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // 재발급 요청 자체가 실패한 경우, 여기서 바로 로그아웃 처리합니다.
        if (error.response.status === 401 && originalRequest.url === '/reissue') {
            console.error('Refresh token is invalid or expired. Logging out.');
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

