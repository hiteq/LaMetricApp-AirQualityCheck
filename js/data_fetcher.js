// 이 스크립트는 대기질 데이터를 가져오기 위한 플레이스홀더입니다.
// LaMetric의 특정 JavaScript 환경과 HTTP 요청을 처리하는 방법에 따라 조정이 필요합니다
// (예: 전역 fetch를 제공하는지 또는 http.get과 같은 특정 모듈인지).
// 현재 구현은 개발 및 테스트 목적을 위해 목업 데이터를 사용합니다.

// 실제 Air Korea API를 사용하여 대기질 데이터를 가져오는 스크립트
// 공공데이터포털의 한국환경공단 에어코리아 대기오염정보 API 사용

async function getAirQualityData(stationName = '종로구') {
    // 실제 Air Korea API 설정
    // 주의: 실제 사용시 API 키를 환경변수나 설정 파일에서 가져와야 합니다
    const apiKey = getApiKey();
    
    // 실제 에어코리아 API 엔드포인트 - 측정소별 실시간 측정정보 조회
    const baseUrl = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
    
    // API 요청 파라미터 설정
    const params = new URLSearchParams({
        serviceKey: apiKey,
        returnType: 'json', // JSON 형태로 응답 받기
        numOfRows: '1',     // 한 페이지 결과 수
        pageNo: '1',        // 페이지 번호
        stationName: stationName, // 측정소명
        dataTerm: 'DAILY',  // 요청 데이터 기간 (DAILY: 1일)
        ver: '1.3'          // API 버전
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    
    console.log(`측정소 "${stationName}"의 대기질 데이터를 API에서 가져오는 중...`);
    console.log(`요청 URL: ${apiUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);

    try {
        // 실제 HTTP 요청 실행
        // LaMetric 환경에서는 fetch 대신 http.get이나 다른 방법을 사용할 수 있음
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }

        const data = await response.json();
        
        // API 응답 검증
        if (data.response && data.response.header) {
            const resultCode = data.response.header.resultCode;
            
            if (resultCode !== '00') {
                throw new Error(`API 에러! 코드: ${resultCode}, 메시지: ${data.response.header.resultMsg}`);
            }
            
            // 응답 데이터가 있는지 확인
            const items = data.response.body?.items;
            if (!items || items.length === 0) {
                console.warn(`측정소 "${stationName}"에 대한 데이터가 없습니다.`);
                return null;
            }
            
            const item = items[0]; // 첫 번째 데이터 항목 사용
            
            // 대기질 데이터 추출 및 가공
            const airQualityData = {
                stationName: stationName,
                dataTime: item.dataTime || '알 수 없음',
                pm10: {
                    value: parseFloat(item.pm10Value) || null,
                    grade: parseInt(item.pm10Grade) || null,
                    grade24h: parseInt(item.pm10Grade1h) || null
                },
                pm25: {
                    value: parseFloat(item.pm25Value) || null,
                    grade: parseInt(item.pm25Grade) || null,
                    grade24h: parseInt(item.pm25Grade1h) || null
                },
                // 추가 대기질 정보
                so2: parseFloat(item.so2Value) || null,
                co: parseFloat(item.coValue) || null,
                o3: parseFloat(item.o3Value) || null,
                no2: parseFloat(item.no2Value) || null,
                khaiValue: parseInt(item.khaiValue) || null, // 통합대기환경지수
                khaiGrade: parseInt(item.khaiGrade) || null
            };
            
            console.log('대기질 데이터를 성공적으로 가져왔습니다:', airQualityData);
            return airQualityData;
            
        } else {
            throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
        
    } catch (error) {
        console.error('대기질 데이터 가져오기 실패:', error.message);
        
        // 에러 발생시 목업 데이터 반환 (개발/테스트용)
        console.log('에러로 인해 목업 데이터를 반환합니다.');
        return {
            stationName: stationName,
            dataTime: new Date().toLocaleString('ko-KR'),
            pm10: { value: 45, grade: 2, grade24h: 2 },
            pm25: { value: 28, grade: 2, grade24h: 2 },
            so2: 0.003,
            co: 0.6,
            o3: 0.020,
            no2: 0.023,
            khaiValue: 85,
            khaiGrade: 2,
            isTestData: true // 테스트 데이터임을 표시
        };
    }
}

// 측정소 목록을 가져오는 함수 (LaMetric 앱 설정에서 사용할 수 있음)
async function getStationList(addr = '서울') {
    const apiKey = getApiKey();
    const baseUrl = 'http://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getMsrstnList';
    
    const params = new URLSearchParams({
        serviceKey: apiKey,
        returnType: 'json',
        numOfRows: '100',
        pageNo: '1',
        addr: addr
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP 에러! 상태: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.response && data.response.header.resultCode === '00') {
            const items = data.response.body?.items || [];
            return items.map(item => ({
                stationName: item.stationName,
                addr: item.addr,
                dmX: item.dmX, // 위도
                dmY: item.dmY, // 경도
                items: item.item // 측정항목
            }));
        }
        
        throw new Error('측정소 목록을 가져올 수 없습니다.');
        
    } catch (error) {
        console.error('측정소 목록 조회 실패:', error.message);
        
        // 에러시 기본 측정소 목록 반환
        return [
            { stationName: '종로구', addr: '서울 종로구', dmX: '37.5729', dmY: '126.9794' },
            { stationName: '중구', addr: '서울 중구', dmX: '37.5640', dmY: '126.9759' },
            { stationName: '강남구', addr: '서울 강남구', dmX: '37.5172', dmY: '127.0473' }
        ];
    }
}

// 전역 API 키 저장소
let GLOBAL_API_KEY = null;

// API 키 설정 도우미 함수
function setApiKey(key) {
    if (!key || key === 'YOUR_API_KEY_HERE') {
        console.error('❌ 유효하지 않은 API 키입니다.');
        return false;
    }
    
    GLOBAL_API_KEY = key;
    console.log('✅ Air Korea API 키가 설정되었습니다.');
    return true;
}

// API 키 가져오기 함수
function getApiKey() {
    // 1. 전역 변수에서 확인
    if (GLOBAL_API_KEY) {
        return GLOBAL_API_KEY;
    }
    
    // 2. LaMetric 설정에서 확인 (LaMetric 환경인 경우)
    if (typeof LaMetric !== 'undefined' && LaMetric.getConfig) {
        const config = LaMetric.getConfig();
        if (config.apiKey) {
            GLOBAL_API_KEY = config.apiKey;
            return GLOBAL_API_KEY;
        }
    }
    
    // 3. 환경변수에서 확인 (Node.js 환경인 경우)
    if (typeof process !== 'undefined' && process.env && process.env.AIR_KOREA_API_KEY) {
        GLOBAL_API_KEY = process.env.AIR_KOREA_API_KEY;
        return GLOBAL_API_KEY;
    }
    
    // 4. 브라우저 전역 변수에서 확인
    if (typeof window !== 'undefined' && window.AIR_KOREA_API_KEY) {
        GLOBAL_API_KEY = window.AIR_KOREA_API_KEY;
        return GLOBAL_API_KEY;
    }
    
    // API 키가 없는 경우
    return 'YOUR_API_KEY_HERE';
}

// API 키 검증 함수
function validateApiKey() {
    const apiKey = getApiKey();
    
    if (apiKey === 'YOUR_API_KEY_HERE' || !apiKey) {
        console.warn('⚠️ Air Korea API 키가 설정되지 않았습니다!');
        console.warn('   setApiKey() 함수를 사용하여 실제 API 키를 설정해주세요.');
        console.warn('   API 키는 https://data.go.kr 에서 발급받을 수 있습니다.');
        return false;
    }
    
    console.log('✅ API 키가 유효합니다.');
    return true;
}

// API 키 초기화 함수
function clearApiKey() {
    GLOBAL_API_KEY = null;
    console.log('🗑️ API 키가 초기화되었습니다.');
}

// 모듈 내보내기 (LaMetric 환경에 따라 조정 필요)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAirQualityData,
        getStationList,
        setApiKey,
        getApiKey,
        validateApiKey,
        clearApiKey
    };
}
