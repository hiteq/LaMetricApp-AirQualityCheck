# Air Korea API 설정 가이드

## 📋 개요

LaMetric Time 미세먼지 앱이 실제 대기질 데이터를 표시하려면 Air Korea API 키가 필요합니다.

---

## 🔑 API 키 발급 방법

### 1단계: 공공데이터포털 회원가입

1. **공공데이터포털** 접속: https://data.go.kr
2. 회원가입 및 로그인

### 2단계: Air Korea API 신청

1. **검색**: "에어코리아 대기오염정보" 검색
2. **직접 링크**: https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15073861
3. **활용신청** 버튼 클릭
4. 신청 정보 입력:
   - **활용목적**: 개인 프로젝트 또는 LaMetric 앱 개발
   - **서비스명**: LaMetric 미세먼지 앱
   - **일일 호출건수**: 500건 (개발계정)

### 3단계: API 키 확인

1. **마이페이지** → **활용신청 목록**
2. 승인된 "에어코리아 대기오염정보" 클릭
3. **"일반 인증키 (Encoding)"** 복사

---

## ⚙️ API 키 설정 방법

### 방법 1: JavaScript에서 직접 설정

```javascript
// API 키 설정
setApiKey('여기에_발급받은_API키_입력');

// 대기질 데이터 가져오기
const airData = await getAirQualityData('종로구');
console.log(airData);
```

### 방법 2: 환경변수 설정 (권장)

**Node.js 환경:**
```bash
export AIR_KOREA_API_KEY="여기에_발급받은_API키_입력"
```

**LaMetric 환경:**
```javascript
// LaMetric 앱 설정에서 API 키를 입력받아 사용
const apiKey = LaMetric.getSettings().apiKey;
setApiKey(apiKey);
```

---

## 🧪 API 테스트 방법

### 브라우저에서 직접 테스트

다음 URL을 브라우저에 입력해서 테스트하세요:

```
http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=여기에_API키_입력&returnType=json&numOfRows=1&pageNo=1&stationName=종로구&dataTerm=DAILY&ver=1.3
```

**성공시 응답 예시:**
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL_SERVICE"
    },
    "body": {
      "items": [
        {
          "stationName": "종로구",
          "dataTime": "2024-01-15 14:00",
          "pm10Value": "45",
          "pm25Value": "28",
          "pm10Grade": "2",
          "pm25Grade": "2"
        }
      ]
    }
  }
}
```

### JavaScript 코드 테스트

```javascript
// API 키 설정
setApiKey('여기에_발급받은_API키_입력');

// API 키 유효성 확인
if (validateApiKey()) {
    console.log('✅ API 키가 올바르게 설정되었습니다.');
    
    // 대기질 데이터 테스트
    getAirQualityData('종로구').then(data => {
        console.log('🌫️ 대기질 데이터:', data);
        
        if (data.isTestData) {
            console.log('⚠️ 목업 데이터가 반환되었습니다. API 키를 확인하세요.');
        } else {
            console.log('✅ 실제 API 데이터를 성공적으로 가져왔습니다!');
        }
    });
} else {
    console.log('❌ API 키가 설정되지 않았습니다.');
}
```

---

## 📍 사용 가능한 측정소 목록

### 서울 주요 측정소

- **종로구**: 서울 종로구 (기본값)
- **중구**: 서울 중구
- **강남구**: 서울 강남구
- **마포구**: 서울 마포구
- **송파구**: 서울 송파구
- **강서구**: 서울 강서구

### 측정소 목록 확인 방법

```javascript
// 서울 지역 측정소 목록 가져오기
getStationList('서울').then(stations => {
    console.log('📍 서울 측정소 목록:');
    stations.forEach(station => {
        console.log(`- ${station.stationName}: ${station.addr}`);
    });
});
```

---

## 🔧 LaMetric 앱에서의 설정

### app.json 설정 추가

```json
{
  "settings": [
    {
      "name": "apiKey",
      "label": "Air Korea API Key",
      "type": "string",
      "required": true,
      "help": "공공데이터포털에서 발급받은 API 키를 입력하세요"
    },
    {
      "name": "stationName", 
      "label": "측정소명",
      "type": "string",
      "default": "종로구",
      "help": "대기질을 확인할 측정소명을 입력하세요"
    }
  ]
}
```

### LaMetric 앱에서 API 키 사용

```javascript
function initializeApp() {
    const settings = LaMetric.getSettings();
    
    // API 키 설정
    if (settings.apiKey) {
        setApiKey(settings.apiKey);
        console.log('✅ API 키가 설정되었습니다.');
    } else {
        console.log('❌ API 키가 설정되지 않았습니다. 앱 설정에서 API 키를 입력하세요.');
        updateDisplayFrame('API키 필요', 'i120');
        return;
    }
    
    // 앱 시작
    startPeriodicUpdates();
}
```

---

## ⚠️ 주의사항

### API 사용 제한

- **개발계정**: 일일 500회 호출 제한
- **15분 간격**: 앱에서 15분마다 업데이트 (하루 96회 호출)
- **운영계정**: 더 많은 호출이 필요한 경우 운영계정 신청

### 보안 주의사항

- **API 키 노출 금지**: 코드에 직접 하드코딩하지 말 것
- **환경변수 사용**: 가능한 환경변수나 설정 파일 사용
- **버전 관리 제외**: `.gitignore`에 API 키 파일 추가

### 에러 처리

API 호출 실패시 목업 데이터가 반환됩니다:
```javascript
{
  stationName: "종로구",
  dataTime: "2024-01-15 14:00",
  pm10: { value: 45, grade: 2 },
  pm25: { value: 28, grade: 2 },
  isTestData: true // 목업 데이터임을 표시
}
```

---

## 📞 문의 및 지원

- **공공데이터포털 고객센터**: 1566-0025
- **에어코리아 문의**: https://www.airkorea.or.kr
- **API 문서**: 공공데이터포털에서 "한국환경공단 에어코리아 OpenAPI 기술문서" 다운로드

---

## ✅ 설정 완료 체크리스트

- [ ] 공공데이터포털 회원가입
- [ ] Air Korea API 활용신청
- [ ] API 키 발급 확인  
- [ ] 브라우저에서 API 테스트
- [ ] JavaScript에서 API 키 설정
- [ ] 대기질 데이터 가져오기 성공
- [ ] LaMetric 앱 설정에 API 키 입력
- [ ] 실제 데이터 표시 확인

모든 항목이 완료되면 LaMetric Time에서 실시간 미세먼지 정보를 확인할 수 있습니다! 🎉 