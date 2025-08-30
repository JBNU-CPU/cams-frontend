// Vite의 import.meta.glob 기능을 사용하여 현재 디렉토리의 모든 하위 폴더에 있는
// .ts 또는 .js 파일을 즉시 로드합니다.
// 예를 들어, './en/common.js', './ko/common.js' 같은 파일들을 모두 가져옵니다.
const modules = import.meta.glob('./*/*.js', { eager: true });

// i18next 리소스로 사용될 최종 객체를 초기화합니다.
const messages = {};

// 불러온 모듈들의 경로를 순회합니다.
Object.keys(modules).forEach((path) => {
  // 정규식을 사용해 파일 경로에서 언어 코드(lang)를 추출합니다.
  // 예: './en/common.js' -> 'en'
  const match = path.match(/\.\/([^/]+)\/([^/]+)\.js$/);
  
  if (match) {
    const [, lang] = match;
    const module = modules[path];
    
    // messages 객체에 해당 언어의 공간이 없으면 새로 생성합니다.
    // 예: messages['en'] = { translation: {} };
    if (!messages[lang]) {
      messages[lang] = { translation: {} };
    }
    
    // 각 파일에서 export default로 내보낸 번역 내용을 기존 번역에 병합합니다.
    // 이를 통해 'en' 폴더의 여러 파일 내용이 messages.en.translation 객체 하나로 합쳐집니다.
    if (module.default) {
      messages[lang].translation = {
        ...messages[lang].translation,
        ...module.default
      };
    }
  }
});

// 완성된 messages 객체를 내보냅니다.
export default messages;