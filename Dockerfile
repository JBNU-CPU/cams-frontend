## 1. 기본 이미지 설정 (Nginx)
#FROM nginx:alpine
#
## 2. out 폴더의 모든 파일을 Nginx 웹 서버의 기본 폴더로 복사
## [설명] COPY {복사할 폴더 이름}/ /usr/share/nginx/html/
##        'out/'으로 작성해야 'out' 폴더 안의 내용물이 복사됩니다.
#COPY out/ /usr/share/nginx/html/
#
## 3. Nginx의 기본 설정을 우리 앱에 맞게 덮어쓰기 (선택 사항이지만 권장)
##    아래 'nginx.conf' 파일을 생성하고 설정해야 합니다.
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#
## 4. 80번 포트를 외부에 노출
#EXPOSE 80
#
## 5. 컨테이너가 시작될 때 Nginx 실행
#CMD ["nginx", "-g", "daemon off;"]


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

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
