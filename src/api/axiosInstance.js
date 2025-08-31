import axios from 'axios';

// 1. Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    // 쿠키를 주고받기 위해 꼭 필요한 설정
    withCredentials: true,
});

// 2. 요청 인터셉터 (Request Interceptor)
//    - 모든 API 요청을 보내기 전에 이 코드를 거칩니다.
axiosInstance.interceptors.request.use(
    (config) => {
        // localStorage에서 액세스 토큰을 가져옵니다.
        const accessToken = localStorage.getItem('accessToken');

        // 토큰이 존재하면, 모든 요청 헤더에 'Authorization' 헤더를 추가합니다.
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. 응답 인터셉터 (Response Interceptor)
//    - 모든 API 응답을 받은 후에 이 코드를 거칩니다.
axiosInstance.interceptors.response.use(
    (response) => {
        // 응답이 성공적이면 그대로 반환합니다.
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 401 Unauthorized 에러이고, 재시도한 요청이 아닐 경우
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 재시도 플래그 설정

            try {
                // 리프레시 토큰으로 새로운 액세스 토큰을 요청합니다.
                // (리프레시 토큰은 HttpOnly 쿠키에 담겨 자동으로 전송됩니다)
                const response = await axiosInstance.post('/reissue');

                // 서버로부터 새로운 액세스 토큰을 응답 헤더에서 받습니다.
                const newAccessToken = response.headers['authorization'].split(' ')[1];

                // 새로운 토큰을 localStorage에 저장합니다.
                localStorage.setItem('accessToken', newAccessToken);

                // 실패했던 원래 요청의 헤더에 새로운 토큰을 설정하여 재요청합니다.
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // 리프레시 토큰 재발급 실패 시 (예: 리프레시 토큰 만료)
                console.error('Token refresh failed:', refreshError);
                // 저장된 토큰을 삭제하고 로그인 페이지로 리디렉션합니다.
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;



// // 예시: GET 요청
// const fetchData = async () => {
//   try {
//     const response = await axiosInstance.get('/some-protected-data');
//     console.log(response.data);
//   } catch (error) {
//     console.error("데이터를 불러오는데 실패했습니다:", error);
//   }
// };

// // 예시: POST 요청
// const postData = async (data) => {
//   try {
//     const response = await axiosInstance.post('/some-endpoint', data);
//     console.log('데이터 저장 성공:', response.data);
//   } catch (error) {
//     console.error("데이터 저장에 실패했습니다:", error);
//   }
// };
