# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# 패키지 메타만 먼저 복사 → 캐시 최적화
COPY package.json .
COPY package-lock.json .

# CI 환경 설치 (package-lock.json 기반)
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# --- Run stage (Nginx) ---
FROM nginx:1.25-alpine

# envsubst 명령어를 사용하기 위해 gettext 패키지를 설치합니다. (매우 중요!)
RUN apk update && apk add gettext

# Nginx 설정 템플릿을 복사합니다.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# 위에서 만든 커스텀 시작 스크립트를 복사하고 실행 권한을 줍니다.
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

# 정적 파일 복사
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80

# 컨테이너의 시작점으로 우리의 커스텀 스크립트를 지정합니다.
ENTRYPOINT ["/entrypoint.sh"]

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
