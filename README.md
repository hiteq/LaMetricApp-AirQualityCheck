# 미세먼지 알리미 for LaMetric Time

## 🌟 구현 방식

### 🚀 **GitHub Actions 방식 (권장)**
서버 배포 없이 GitHub에서 무료로 운영하는 방식입니다.

- ✅ **완전 무료** (서버 비용 없음)
- ✅ **서버 관리 불필요**
- ✅ **자동 업데이트** (매 15분)
- ✅ **높은 안정성**

👉 **[GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)** 가이드 참조

### 🖥️ **Express 서버 방식**
자체 서버에 배포하는 전통적인 방식입니다.

- 더 빠른 업데이트 (실시간)
- 완전한 제어권
- 서버 비용 및 관리 필요

👉 **[server/README.md](server/README.md)** 가이드 참조

## 설명

이 LaMetric Time 앱은 지정된 한국의 대기질 측정소에서 현재 미세먼지 수준을 표시합니다. 인기 있는 한국 미세먼지 앱과 유사하게 색상 코드를 사용하여 대기질에 대한 빠른 시각적 평가를 제공하는 것을 목표로 합니다.

**프로젝트 목표:** LaMetric Time을 통해 현재 미세먼지 상태를 쉽게 확인하고, LaMetric 마켓에서 배포하는 것을 목적으로 합니다.

## 기능

*   PM10 및 PM2.5 수준에 따른 대기질 상태 표시 (좋음, 보통, 나쁨, 매우 나쁨).
*   빠른 시각적 평가를 위한 개념적 색상 코드 표시 (실제 색상 렌더링은 LaMetric 장치 기능 및 SDK에 대한 특정 구현에 따라 다름).
*   LaMetric 앱 설정을 통한 구성 가능한 측정소명.

## 현재 상태 및 설정 요구사항

*   **실제 API 연동 완료:** 이 앱은 **실제 Air Korea API**와 연동되어 실시간 대기질 데이터를 가져옵니다.
*   **API 키 필수:** 실제 대기질 데이터를 표시하려면 **Air Korea API 키가 필요**합니다:
    *   공공데이터포털(data.go.kr)에서 "에어코리아 대기오염정보" API 키 발급
    *   LaMetric 앱 설정에서 API 키 입력
    *   API 키가 없으면 목업 데이터가 표시됩니다
*   **LAMETRIC SDK 가정:** LaMetric 장치와 상호 작용하는 JavaScript 코드(예: 디스플레이 프레임 업데이트, 설정 처리, 모듈/JS 파일 로딩)는 개발 중 특정 LaMetric 개발자 문서를 사용할 수 없어 **일반적인 가정**에 기반합니다. `js/main.js`의 이러한 부분들(특히 `LaMetric` 목업 객체)은 **실제 LaMetric SDK 호출로 교체되어야 합니다.**
*   **아이콘:** `images/` 디렉토리의 아이콘 파일들(`icon_small.png`, `icon_large.png`)은 현재 **빈 플레이스홀더**입니다. 적절한 크기와 디자인의 실제 PNG 이미지가 필요합니다. 색상 상태를 표시하는 방법(예: 색상 아이콘 또는 배경을 통해)도 LaMetric SDK에 따라 구현되어야 합니다.
*   **위치 설정:** 앱은 설정에서 "측정소명"을 구성할 수 있습니다. 이 설정이 기술적으로 어떻게 읽히고 앱에서 사용되는지는 LaMetric SDK로 확인이 필요합니다.

## 설정 / 구성

1.  **측정소 (`stationName`):**
    *   이 앱은 특정 한국 대기질 측정소명(예: "종로구", "강남대로")으로 구성되도록 설계되었습니다.
    *   이 설정은 `app.json`(`settings -> stationName`)에 정의되어 있으며, 앱이 설치된 후 LaMetric 모바일 앱을 통해 사용자가 구성할 수 있어야 합니다.
    *   기본 측정소는 "종로구"입니다.
2.  **API 키 (미래):**
    *   `js/data_fetcher.js` 파일에는 API 키에 대한 플레이스홀더(`YOUR_API_KEY_HERE`)가 포함되어 있습니다. 실제 API를 통합할 때 이 키를 제공하고 안전하게 처리해야 합니다.

## 파일 구조

*   `app.json`: LaMetric 애플리케이션 매니페스트 파일 (앱 ID, 이름, 프레임, 설정, 아이콘 정의).
*   `images/`: 앱 아이콘을 포함합니다.
    *   `icon_small.png`: 프레임에 표시되는 작은 아이콘의 플레이스홀더.
    *   `icon_large.png`: 더 큰 앱 스토어 아이콘의 플레이스홀더.
*   `js/`: 앱의 JavaScript 로직을 포함합니다.
    *   `main.js`: 메인 애플리케이션 스크립트; 데이터 가져오기, 처리 및 디스플레이 업데이트를 조율합니다. 목업 LaMetric 환경을 포함합니다.
    *   `data_fetcher.js`: 대기질 데이터 가져오기를 담당합니다. **현재 목업 데이터를 반환합니다.**
    *   `air_quality_utils.js`: PM 값에 기반하여 대기질 상태와 색상을 결정하는 유틸리티 함수를 제공합니다.
*   `README.md`: 이 파일.

## LaMetric 마켓을 위한 개념적 패키징

*   LaMetric 마켓에서 이 앱을 배포하려면 이 `fine_dust_app` 디렉토리 내의 모든 파일과 폴더를 일반적으로 하나의 ZIP 아카이브로 패키징합니다.
*   이 ZIP 파일은 LaMetric 개발자 포털을 통해 업로드됩니다.

## 🔧 설정 및 사용법

### 🌐 방법 1: Poll 서버 방식 (권장)

LaMetric 개발자 포털에서 Poll 방식으로 쉽게 구현할 수 있습니다.

#### 1단계: 서버 설정

```bash
# 서버 폴더로 이동
cd server

# 의존성 설치
npm install

# 환경변수 설정
cp env.example .env
# .env 파일에서 AIR_KOREA_API_KEY 설정

# 서버 실행
npm start
```

#### 2단계: LaMetric 개발자 포털 설정

1. [LaMetric Developer](https://developer.lametric.com/)에서 앱 생성
2. **Communication type**: `Poll` 선택
3. **URL**: `https://your-server.com/api/air-quality?station=종로구`
4. **Poll frequency**: `5 min`
5. **Data format**: `Predefined (LaMetric Format)`

#### 3단계: 배포

**Heroku 배포:**
```bash
heroku create your-app-name
heroku config:set AIR_KOREA_API_KEY=발급받은_API키
git push heroku main
```

**Vercel/Railway 등 다른 플랫폼도 지원**

---

### 📱 방법 2: 클라이언트 앱 방식

#### 1단계: API 키 발급

1. **공공데이터포털 가입**: https://data.go.kr
2. **API 신청**: "에어코리아 대기오염정보" 검색 후 활용신청
3. **API 키 발급**: 승인 후 "일반 인증키(Encoding)" 복사

#### 2단계: LaMetric 앱 설정

1. LaMetric 앱에서 "미세먼지 알리미" 설치
2. 앱 설정에서 다음 정보 입력:
   - **Air Korea API Key**: 발급받은 API 키
   - **측정소명**: 원하는 지역 (예: 종로구, 강남구)
   - **업데이트 간격**: 5-60분 선택
   - **상세 정보 표시**: 켜기/끄기

#### 3단계: 개발자 테스트

```bash
# 프로젝트 폴더에서 HTTP 서버 실행
python -m http.server 8000

# 브라우저에서 접속 후 개발자 콘솔에서:
setApiKey('발급받은_API키');
testFullApp(); // 전체 앱 테스트
```

**자세한 설정 방법은 `API_SETUP.md` 파일을 참조하세요.**

### 🧪 로컬 테스트 (개발자용)

이 애플리케이션은 LaMetric Time 장치용으로 설계되었지만, Node.js 환경을 사용하여 로컬 컴퓨터에서 JavaScript 로직의 일부를 개념적으로 테스트할 수 있습니다. 이를 통해 데이터 변환 및 상태 로직을 이해하는 데 도움이 됩니다. **이것은 실제 LaMetric 장치나 에뮬레이터에서의 테스트를 대체하지 않습니다.**

**전제 조건:**
*   컴퓨터에 Node.js가 설치되어 있어야 합니다.

**1. `air_quality_utils.js` 테스트:**

이 파일에는 대기질 상태와 색상을 결정하는 로직이 포함되어 있습니다.

*   터미널에서 `js/` 디렉토리로 이동합니다.
*   다음과 같은 내용으로 임시 테스트 스크립트(예: `test_utils.js`)를 생성합니다:

    ```javascript
    // test_utils.js
    const { getOverallAirQualityStatus, AIR_QUALITY_LEVELS } = require('./air_quality_utils.js'); // Node용 CommonJS export 가정

    console.log("--- air_quality_utils.js 테스트 ---");

    console.log("테스트 케이스 1: PM10 좋음, PM2.5 좋음");
    let status1 = getOverallAirQualityStatus(25, 10);
    console.log(status1);
    // 예상: { status: '좋음', color: '#007bff', levelOrder: 1, ... }

    console.log("\n테스트 케이스 2: PM10 보통, PM2.5 좋음");
    let status2 = getOverallAirQualityStatus(70, 10);
    console.log(status2);
    // 예상: { status: '보통', color: '#28a745', levelOrder: 2, dominantValueDisplay: 'PM10: 70', ... }

    console.log("\n테스트 케이스 3: PM10 좋음, PM2.5 나쁨");
    let status3 = getOverallAirQualityStatus(20, 60);
    console.log(status3);
    // 예상: { status: '나쁨', color: '#ffc107', levelOrder: 3, dominantValueDisplay: 'PM2.5: 60', ... }

    console.log("\n테스트 케이스 4: 데이터 없음");
    let status4 = getOverallAirQualityStatus(null, null);
    console.log(status4);
    // 예상: { status: '정보 없음', color: '#808080', ... }

    // Node에서 실행 가능하게 하려면, air_quality_utils.js가 함수를 export해야 할 수 있습니다. 예: 파일 끝에:
    // module.exports = { getOverallAirQualityStatus, AIR_QUALITY_LEVELS, getPm10Level, getPm25Level };
    ```
*   Node.js 테스트를 위해 `air_quality_utils.js`가 함수를 제대로 export하도록 수정해야 할 수 있습니다 (예: `module.exports` 사용). 예를 들어, `air_quality_utils.js` 끝에 다음을 추가:
    ```javascript
    // Node.js 테스트를 위해 air_quality_utils.js 끝에 추가
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            AIR_QUALITY_LEVELS,
            getPm25Level,
            getPm10Level,
            getOverallAirQualityStatus
        };
    }
    ```
*   `js/` 디렉토리 내에서 테스트 스크립트 실행: `node test_utils.js`
*   콘솔 출력을 관찰합니다.

**2. `data_fetcher.js` 관찰 (목업 데이터 출력):**

이 파일은 현재 목업 대기질 데이터를 반환합니다.

*   `js/` 디렉토리로 이동합니다.
*   다른 임시 테스트 스크립트(예: `test_fetcher.js`)를 생성합니다:

    ```javascript
    // test_fetcher.js
    const { getAirQualityData } = require('./data_fetcher.js'); // CommonJS export 가정

    async function main() {
        console.log("--- data_fetcher.js 테스트 (목업 데이터) ---");
        const airQuality = await getAirQualityData('종로구'); // 예시 측정소
        console.log(airQuality);
        // 예상: 랜덤한 pm10Value, pm25Value를 가진 목업 데이터 구조.
    }

    main();

    // Node에서 실행 가능하게 하려면, data_fetcher.js가 함수를 export해야 할 수 있습니다. 예: 파일 끝에:
    // module.exports = { getAirQualityData };
    ```
*   마찬가지로, Node.js를 위해 `data_fetcher.js`가 `getAirQualityData`를 export하도록 수정:
    ```javascript
    // Node.js 테스트를 위해 data_fetcher.js 끝에 추가
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { getAirQualityData };
    }
    ```
*   스크립트 실행: `node test_fetcher.js`
*   콘솔에 출력된 목업 데이터 구조를 관찰합니다.

**3. `main.js` 플로우 이해 (개념적):**

`main.js`는 앱을 조율하고 목업 `LaMetric` 객체를 포함합니다. 의도된 작업 플로우와 LaMetric 디스플레이로 전송될 데이터를 이해하기 위해 `console.log` 문을 읽을 수 있습니다. LaMetric 특정 목업 객체로 인해 Node.js에서 직접 실행하기는 어렵지만, 다른 두 파일의 로그를 읽고 코드를 읽으면 통찰력을 얻을 수 있습니다.

**주의사항:** 이러한 로컬 테스트는 JavaScript 로직의 일부만 검증합니다. 실제 사용자 경험, 디스플레이 렌더링, 설정 관리 및 LaMetric 장치에서의 API 통신은 공식 LaMetric SDK로 코드를 적응한 후 실제 LaMetric 환경에서 테스트가 필요합니다.

## 향후 개선사항 (개념적)

*   실시간 한국 대기질 API와 통합.
*   LaMetric SDK를 사용하여 대기질 상태에 기반한 동적 아이콘 색상 지정 또는 선택 구현.
*   실제 장치 테스트를 기반으로 UI/UX 개선.
*   LaMetric에서 지원되고 적절한 경우 자동 위치 감지 조사.
*   API 호출 및 장치 상호 작용에 대한 강력한 오류 처리 추가.
