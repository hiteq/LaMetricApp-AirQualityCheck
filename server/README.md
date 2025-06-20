# LaMetric 미세먼지 서버

LaMetric Time 장치에서 Poll 방식으로 한국 대기질 데이터를 제공하는 Node.js 서버입니다.

## 🚀 빠른 시작

### 1. 설치

```bash
cd server
npm install
```

### 2. 환경 설정

```bash
# .env 파일 생성
cp env.example .env

# API 키 설정
# .env 파일을 열어서 AIR_KOREA_API_KEY에 실제 API 키 입력
```

### 3. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

---

## 🔧 API 엔드포인트

### 기본 대기질 데이터
```
GET /api/air-quality?station=종로구&detailed=true
```

**쿼리 파라미터:**
- `station`: 측정소명 (기본값: 종로구)
- `detailed`: 상세 정보 표시 여부 (기본값: true)

**응답 형식:**
```json
{
  "frames": [
    {
      "text": "종로구 PM2.5:28 (보통)",
      "icon": "i2396"
    }
  ]
}
```

### 특정 측정소 데이터
```
GET /api/air-quality/강남구?detailed=false
```

### 지원 측정소 목록
```
GET /api/stations
```

### 서버 상태 확인
```
GET /health
```

---

## 🌐 LaMetric 설정

### 1. LaMetric 개발자 포털에서 앱 생성

1. **Communication type**: `Poll` 선택
2. **URL to get data from**: `https://your-server.com/api/air-quality?station=종로구`
3. **Poll frequency**: `5 min` (또는 원하는 간격)
4. **Data format**: `Predefined (LaMetric Format)`

### 2. URL 예시

```
# 기본 사용
https://your-server.com/api/air-quality

# 특정 측정소
https://your-server.com/api/air-quality?station=강남구

# 간단한 형식
https://your-server.com/api/air-quality?station=마포구&detailed=false
```

---

## 🔐 환경변수 설정

`.env` 파일에서 설정:

```bash
# 필수: Air Korea API 키
AIR_KOREA_API_KEY=발급받은_API키

# 선택: 서버 설정
PORT=3000
NODE_ENV=production
DEFAULT_STATION=종로구
MIN_POLL_INTERVAL=300

# 선택: CORS 설정
ALLOWED_ORIGINS=*
```

---

## 📊 지원되는 측정소

- **서울**: 종로구, 중구, 강남구, 마포구, 송파구, 강서구, 영등포구, 성북구
- 기타 지역도 Air Korea API에서 지원하는 모든 측정소 사용 가능

---

## 🧪 로컬 테스트

### 서버 테스트
```bash
# 서버 상태 확인
curl http://localhost:3000/health

# 기본 대기질 데이터
curl http://localhost:3000/api/air-quality

# 특정 측정소
curl "http://localhost:3000/api/air-quality?station=강남구"

# 간단한 형식
curl "http://localhost:3000/api/air-quality?detailed=false"
```

### 브라우저에서 확인
```
http://localhost:3000/
http://localhost:3000/api/air-quality
http://localhost:3000/api/stations
```

---

## 🚀 배포

### Heroku 배포 예시

```bash
# Heroku CLI 설치 후
heroku create your-app-name
heroku config:set AIR_KOREA_API_KEY=발급받은_API키
git push heroku main
```

### Vercel 배포 예시

```bash
# Vercel CLI 설치 후
vercel --prod
# 환경변수는 Vercel 대시보드에서 설정
```

### Railway 배포 예시

```bash
# Railway CLI 설치 후
railway login
railway new
railway add AIR_KOREA_API_KEY=발급받은_API키
railway up
```

---

## 🛠️ 개발

### 스크립트

```bash
npm start     # 서버 실행
npm run dev   # 개발 모드 (nodemon)
npm test      # 테스트 실행
```

### 로그 확인

서버는 다음과 같은 로그를 출력합니다:

```
🚀 LaMetric 미세먼지 서버가 포트 3000에서 실행 중입니다.
📍 API 엔드포인트: http://localhost:3000/api/air-quality
💡 사용법: http://localhost:3000/

2024-01-15T10:30:00.123Z - GET /api/air-quality - IP: ::1
대기질 데이터 요청: 종로구, 상세: true
Air Korea API 호출: 종로구
새로운 데이터 반환: {"frames":[{"text":"종로구 PM2.5:28 (보통)","icon":"i2396"}]}
```

---

## ⚠️ 주의사항

1. **API 키 보안**: `.env` 파일을 `.gitignore`에 추가하여 버전 관리에서 제외
2. **레이트 리미팅**: 프로덕션에서는 5분 간격으로 요청 제한
3. **캐싱**: 동일한 요청은 5분간 캐시된 결과 반환
4. **에러 처리**: API 오류 시에도 LaMetric 형식의 응답 반환

---

## 🔗 관련 링크

- [LaMetric Developer](https://developer.lametric.com/)
- [Air Korea API](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15073861)
- [공공데이터포털](https://data.go.kr/)

---

## 📞 문의

문제가 있거나 개선사항이 있으면 이슈를 등록해주세요. 