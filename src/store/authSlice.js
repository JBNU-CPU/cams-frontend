import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

// 로그인 비동기 액션 (Thunk)
export const login = createAsyncThunk(
    'auth/login',
    async ({ studentId, password }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/login', {
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
        logout: (state) => {
            localStorage.removeItem('accessToken');
            state.accessToken = null;
            state.isLoggedIn = false;
            state.status = 'idle';
            state.error = null;
        },
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
            });
    },
});

// 액션 생성자(Action Creators) 내보내기
export const { logout } = authSlice.actions;

// 리듀서 내보내기
export default authSlice.reducer;
