import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

// 로그인 비동기 액션 (Thunk)
export const login = createAsyncThunk(
    'auth/login',
    async ({ studentId, password }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/login', {
                username: studentId,
                password: password,
            });
            // 응답 헤더에서 토큰 추출
            const accessToken = response.headers['authorization'].split(' ')[1];
            // 토큰을 localStorage에 저장
            localStorage.setItem('accessToken', accessToken);
            // 성공 시 토큰을 반환
            return accessToken;
        } catch (error) {
            // API 요청 실패 시 에러 메시지를 반환
            return rejectWithValue('학번 또는 비밀번호가 올바르지 않습니다.');
        }
    }
);

// 쿠키 삭제 함수
const deleteCookie = (name) => {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// 로그아웃 비동기 액션 (Thunk)
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // 서버에 로그아웃 요청을 보내 HttpOnly 쿠키를 제거하도록 함
            // await axiosInstance.post('/logout');
        } catch (error) {
            // 서버 요청이 실패하더라도 클라이언트 측 로그아웃은 계속 진행해야 하므로,
            // 여기서 에러를 reject하여 rejected 상태로 넘깁니다.
            console.error('Server logout request failed:', error);
            return rejectWithValue('Server logout failed');
        }
    }
);

// 초기 상태
const initialState = {
    accessToken: localStorage.getItem('accessToken'),
    isLoggedIn: !!localStorage.getItem('accessToken'),
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// authSlice 생성
const authSlice = createSlice({
    name: 'auth',
    initialState,
    // 동기적인 액션을 처리하는 리듀서
    reducers: {
        // 기존의 동기 logout 리듀서는 삭제됩니다.
    },
    // 비동기적인 액션(createAsyncThunk)을 처리하는 리듀서
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.accessToken = action.payload;
                state.isLoggedIn = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // 로그아웃 액션 처리 (성공/실패 시 모두 동일하게 상태 초기화)
            .addCase(logout.fulfilled, (state) => {
                localStorage.removeItem('accessToken');
                deleteCookie('refresh'); // refresh 쿠키 삭제
                state.accessToken = null;
                state.isLoggedIn = false;
                state.status = 'idle';
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                localStorage.removeItem('accessToken');
                deleteCookie('refresh'); // refresh 쿠키 삭제
                state.accessToken = null;
                state.isLoggedIn = false;
                state.status = 'idle';
                state.error = action.payload; // 서버 에러를 저장할 수 있습니다.
            });
    },
});

// 액션 생성자(Action Creators) 내보내기
export const { } = authSlice.actions;

// 리듀서 내보내기
export default authSlice.reducer;