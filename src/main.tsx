import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import './logic/i18n'
import App from './App.tsx'
import { loadRemoteConfig } from './logic/config'

// 앱 초기화 및 원격 설정 로드
const initApp = async () => {
  await loadRemoteConfig();
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>
  );
};

initApp();