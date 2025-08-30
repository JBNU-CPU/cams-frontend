import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router'; // 방금 만든 파일
import App from './App'; // App.jsx가 있다면
import './index.css'; // 👈 이 줄을 추가하세요!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* App.jsx가 레이아웃을 담당하고 AppRouter가 페이지를 바꾸는 구조 */}
      <App>
        <AppRouter />
      </App>
    </BrowserRouter>
  </React.StrictMode>
);