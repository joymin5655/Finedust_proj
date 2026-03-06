#!/bin/bash
# AirLens 로컬 개발 서버
echo "🌍 AirLens 로컬 서버 시작 — http://localhost:8080"
npx http-server app -p 8080 -c-1 --cors
