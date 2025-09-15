#!/bin/sh
# 명령어가 실패하면 즉시 스크립트를 종료합니다.
set -e

# 입력될 템플릿 파일과, 생성될 설정 파일의 경로를 변수로 지정합니다.
TEMPLATE_FILE="/etc/nginx/templates/default.conf.template"
CONFIG_FILE="/etc/nginx/conf.d/default.conf"

# envsubst를 사용하여 템플릿 파일에서 변수를 치환하고, 최종 설정 파일을 생성합니다.
# Nginx의 자체 변수($host 등)와 충돌하지 않도록 치환할 변수를 명시적으로 지정합니다.
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < "$TEMPLATE_FILE" > "$CONFIG_FILE"

# 이 스크립트로 전달된 원래 명령어(Dockerfile의 CMD)를 실행합니다.
exec "$@"