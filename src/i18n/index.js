import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

i18n
  // 사용자의 브라우저 언어를 감지합니다.
  .use(LanguageDetector)
  // i18n 인스턴스를 react-i18next에 전달합니다.
  .use(initReactI18next)
  // i18next를 초기화합니다.
  .init({
    // 기본 언어를 'en'(영어)로 설정합니다.
    lng: 'en',
    // 설정된 언어의 번역이 없을 경우, 대체 언어를 설정합니다.
    fallbackLng: 'en',
    // 개발 중 디버그 메시지를 콘솔에 출력하지 않습니다.
    debug: false,
    // 번역 메시지 리소스를 설정합니다.
    resources: messages,
    // 변수 등을 삽입할 때 XSS 공격을 방지하기 위한 값 이스케이프를 비활성화합니다.
    // React는 기본적으로 XSS 방어 기능이 내장되어 있어 false로 설정해도 안전합니다.
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;