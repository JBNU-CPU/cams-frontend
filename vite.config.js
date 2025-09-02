import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'
import { VitePWA } from "vite-plugin-pwa"

const base = process.env.BASE_PATH || '/'
const isPreview = process.env.IS_PREVIEW ? true : false;

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview)
  },
  plugins: [
    react(),
    AutoImport({
      imports: [
        {
          'react': [
            'React',
            'useState',
            'useEffect',
            'useContext',
            'useReducer',
            'useCallback',
            'useMemo',
            'useRef',
            'useImperativeHandle',
            'useLayoutEffect',
            'useDebugValue',
            'useDeferredValue',
            'useId',
            'useInsertionEffect',
            'useSyncExternalStore',
            'useTransition',
            'startTransition',
            'lazy',
            'memo',
            'forwardRef',
            'createContext',
            'createElement',
            'cloneElement',
            'isValidElement'
          ]
        },
        {
          'react-router-dom': [
            'useNavigate',
            'useLocation',
            'useParams',
            'useSearchParams',
            'Link',
            'NavLink',
            'Navigate',
            'Outlet'
          ]
        },
        // React i18n
        {
          'react-i18next': [
            'useTranslation',
            'Trans'
          ]
        }
      ],
      dts: true,
    }),
    VitePWA({
      registerType: 'autoUpdate', // 자동 업데이트 할것인지, 서버에 새로운게 들어오면 자동으로 가져올것인지
      devOptions: {
        enabled: true
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // 캐싱할 파일 목록
      },

      includeAssets: ['image/*.png'], // public 폴더안에 있는 것
      manifest: { // manifest.json 파일 생성하는 곳
        name: 'CAMS',
        short_name: 'CAMS',
        description: '설명',
        theme_color: '#000000',
        display: 'standalone', // 상단 주소창을 없애줌, 기본으로 설정되어있음
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
    })
  ],
  base,
  build: {
    sourcemap: true,
    outDir: 'out',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  }
})