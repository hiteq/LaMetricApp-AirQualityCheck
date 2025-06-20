// main.js - LaMetric 미세먼지 앱의 메인 스크립트

// --- 개념적 Import ---
// LaMetric 환경은 JS 파일을 다르게 처리할 수 있습니다.
// 이것들은 Node.js나 유사한 환경에서 다른 스크립트를 포함하는 방법에 대한 플레이스홀더입니다.
// data_fetcher.js와 air_quality_utils.js의 함수들이 전역적으로 사용 가능하거나
// LaMetric의 특정 메커니즘을 통해 로드/import되었다고 가정합니다.
// 이 하위 작업의 목적상, getAirQualityData와 getOverallAirQualityStatus가 정의되어 있다고 가정합니다.
// 실제 LaMetric 앱이었다면, 이들은 다음과 같이 로드될 것입니다:
// 예: var DataFetcher = require('./data_fetcher.js');
// 예: var Utils = require('./air_quality_utils.js');

// LaMetric의 프레임 및 앱 생명주기 관리 방법에 대한 플레이스홀더.
// 이것은 매우 개념적입니다.
const LaMetric = {
    frames: {
        main_frame: { // app.json의 ID와 일치
            text: '초기화 중...',
            icon: 'i438', // app.json의 기본 아이콘
            // 'backgroundColor'나 특정 색상 아이콘과 같은 잠재적인 다른 속성들
        }
    },
    // 장치에 프레임 업데이트를 푸시하는 것을 시뮬레이션하는 목업 함수
    pushFrame: function(frameId, frameData) {
        console.log(`LaMetric에 프레임 "${frameId}"을(를) 푸시 중:`, frameData);
        // 실제 LaMetric 환경에서는 장치 디스플레이를 업데이트하는 실제 호출이 될 것입니다
    },
    // 앱 설정에서 사용자 구성을 가져오는 것을 시뮬레이션
    getConfig: function() {
        // 실제 LaMetric에서는 앱 설정 UI에서 사용자가 설정한 값들을 반환
        // 여기서는 목업 데이터를 사용하지만, 실제 환경에서는 LaMetric OS가 제공
        return {
            apiKey: null, // 실제로는 사용자가 입력한 API 키
            stationName: '종로구', // 사용자가 선택한 측정소
            refreshInterval: 15, // 분 단위 (15분)
            showDetailedInfo: true
        };
    },
    
    // 실제 LaMetric 환경에서 설정을 가져오는 함수
    getSettings: function() {
        // 실제 LaMetric OS에서 제공되는 설정 데이터
        // 이것은 목업이며, 실제 LaMetric에서는 다르게 구현됨
        return this.getConfig();
    }
};

// 앱의 메인 실행 함수
async function runAirQualityApp() {
    try {
        console.log('미세먼지 LaMetric 앱 시작...');
        
        // 앱 설정 가져오기
        const config = LaMetric.getConfig();
        console.log('앱 설정:', config);
        
        // API 키 설정 및 유효성 검사
        if (config.apiKey) {
            setApiKey(config.apiKey);
        }
        
        if (typeof validateApiKey === 'function' && !validateApiKey()) {
            console.error('❌ API 키가 설정되지 않았습니다.');
            updateDisplayFrame('API키 필요', 'i120'); // 경고 아이콘
            return;
        }
        
        // 대기질 데이터 가져오기
        console.log(`"${config.stationName}" 측정소의 대기질 데이터를 가져오는 중...`);
        const airQualityData = await getAirQualityData(config.stationName);
        
        if (!airQualityData) {
            console.error('대기질 데이터를 가져올 수 없습니다.');
            updateDisplayFrame('데이터 없음', 'i120');
            return;
        }
        
        // 데이터 유효성 검사
        if (airQualityData.isTestData) {
            console.log('⚠️ 테스트 데이터 사용 중 - 실제 API 키를 설정해주세요');
        }
        
        console.log('가져온 대기질 데이터:', airQualityData);
        
        // 전체 대기질 상태 계산
        const overallStatus = getOverallAirQualityStatus(airQualityData);
        console.log('전체 대기질 상태:', overallStatus);
        
        // LaMetric 디스플레이 업데이트
        updateAirQualityDisplay(airQualityData, overallStatus, config);
        
    } catch (error) {
        console.error('앱 실행 중 오류 발생:', error);
        updateDisplayFrame('오류 발생', 'i120');
    }
}

// LaMetric 디스플레이 업데이트 함수
function updateAirQualityDisplay(data, overallStatus, config) {
    // 주요 미세먼지 수치 선택 (PM2.5 우선, 없으면 PM10)
    const primaryPM = data.pm25.value !== null ? data.pm25 : data.pm10;
    const primaryType = data.pm25.value !== null ? 'PM2.5' : 'PM10';
    
    if (!primaryPM.value) {
        console.warn('유효한 미세먼지 데이터가 없습니다.');
        updateDisplayFrame('데이터 없음', 'i120');
        return;
    }
    
    // 상태에 따른 아이콘 선택
    const statusIcon = getStatusIcon(overallStatus);
    
    // 기본 표시 텍스트 생성
    let displayText;
    if (config.showDetailedInfo) {
        // 상세 정보 표시
        displayText = `${data.stationName} ${primaryType}:${primaryPM.value}㎍/㎥ (${overallStatus.text})`;
    } else {
        // 간단한 정보 표시
        displayText = `${primaryType} ${primaryPM.value} (${overallStatus.text})`;
    }
    
    // LaMetric 프레임 데이터 생성
    const frameData = {
        text: displayText,
        icon: statusIcon,
        // 상태에 따른 색상 적용 (LaMetric이 지원하는 경우)
        // color: overallStatus.color // LaMetric 환경에 따라 조정 필요
    };
    
    console.log('디스플레이 업데이트:', frameData);
    
    // LaMetric 장치에 프레임 푸시
    updateDisplayFrame(frameData.text, frameData.icon);
    
    // 추가 정보 로깅
    logDetailedAirQualityInfo(data);
}

// 상태에 따른 아이콘 선택 함수
function getStatusIcon(status) {
    // LaMetric 아이콘 ID에 맞게 조정 필요
    switch (status.order) {
        case 1: return 'i2395'; // 좋음 - 웃는 얼굴
        case 2: return 'i2396'; // 보통 - 평범한 얼굴
        case 3: return 'i2397'; // 나쁨 - 우울한 얼굴
        case 4: return 'i2398'; // 매우 나쁨 - 매우 우울한 얼굴
        default: return 'i438'; // 기본 아이콘
    }
}

// LaMetric 프레임 업데이트 헬퍼 함수
function updateDisplayFrame(text, icon) {
    LaMetric.frames.main_frame.text = text;
    LaMetric.frames.main_frame.icon = icon;
    LaMetric.pushFrame('main_frame', LaMetric.frames.main_frame);
}

// 상세 대기질 정보 로깅
function logDetailedAirQualityInfo(data) {
    console.log('=== 상세 대기질 정보 ===');
    console.log(`측정소: ${data.stationName}`);
    console.log(`측정시간: ${data.dataTime}`);
    
    if (data.pm10.value !== null) {
        console.log(`PM10: ${data.pm10.value}㎍/㎥ (등급: ${data.pm10.grade})`);
    }
    
    if (data.pm25.value !== null) {
        console.log(`PM2.5: ${data.pm25.value}㎍/㎥ (등급: ${data.pm25.grade})`);
    }
    
    if (data.khaiValue !== null) {
        console.log(`통합대기환경지수: ${data.khaiValue} (등급: ${data.khaiGrade})`);
    }
    
    // 기타 대기질 정보
    const additionalData = [];
    if (data.so2 !== null) additionalData.push(`SO2: ${data.so2}ppm`);
    if (data.co !== null) additionalData.push(`CO: ${data.co}ppm`);
    if (data.o3 !== null) additionalData.push(`O3: ${data.o3}ppm`);
    if (data.no2 !== null) additionalData.push(`NO2: ${data.no2}ppm`);
    
    if (additionalData.length > 0) {
        console.log(`기타: ${additionalData.join(', ')}`);
    }
    
    console.log('========================');
}

// 주기적 업데이트 함수
function startPeriodicUpdates() {
    const config = LaMetric.getConfig();
    const intervalMinutes = config.refreshInterval || 15; // 기본 15분
    const interval = intervalMinutes * 60 * 1000; // 분을 밀리초로 변환
    
    console.log(`${intervalMinutes}분(${interval / 1000}초)마다 대기질 데이터 업데이트를 시작합니다.`);
    
    // 즉시 한 번 실행
    runAirQualityApp();
    
    // 주기적 실행
    setInterval(() => {
        console.log('주기적 대기질 데이터 업데이트...');
        runAirQualityApp();
    }, interval);
}

// 앱 초기화 및 시작
function initializeApp() {
    console.log('LaMetric 미세먼지 앱 초기화 중...');
    
    // 필요한 함수들이 정의되어 있는지 확인
    if (typeof getAirQualityData !== 'function') {
        console.error('getAirQualityData 함수를 찾을 수 없습니다. data_fetcher.js가 로드되었는지 확인하세요.');
        return;
    }
    
    if (typeof getOverallAirQualityStatus !== 'function') {
        console.error('getOverallAirQualityStatus 함수를 찾을 수 없습니다. air_quality_utils.js가 로드되었는지 확인하세요.');
        return;
    }
    
    console.log('모든 필수 함수가 사용 가능합니다. 앱을 시작합니다.');
    
    // 주기적 업데이트 시작
    startPeriodicUpdates();
}

// LaMetric 환경에서 앱이 시작될 때 호출되는 함수
// 실제 LaMetric 환경에서는 다른 이벤트나 시작점이 있을 수 있습니다
if (typeof window !== 'undefined') {
    // 브라우저 환경에서 테스트하는 경우
    window.addEventListener('load', initializeApp);
} else {
    // LaMetric 환경이나 Node.js 환경에서 즉시 실행
    initializeApp();
}

// 수동 실행 함수 (디버깅/테스트용)
function manualRefresh() {
    console.log('수동 새로고침 요청됨...');
    runAirQualityApp();
}

// 모듈 내보내기 (필요한 경우)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAirQualityApp,
        initializeApp,
        manualRefresh
    };
}
