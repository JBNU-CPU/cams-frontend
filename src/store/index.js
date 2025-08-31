import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        // 다른 slice가 있다면 여기에 추가
    },
});

export default store;
