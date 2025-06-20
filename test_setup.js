// 테스트 및 개발용 API 키 설정 스크립트
// 실제 API 키를 발급받은 후 이 파일에서 테스트할 수 있습니다.

console.log('🧪 LaMetric 미세먼지 앱 테스트 시작...');

// 필요한 스크립트 파일들이 로드되었는지 확인
function checkRequiredFunctions() {
    const requiredFunctions = [
        'setApiKey',
        'validateApiKey',
        'getAirQualityData',
        'getOverallAirQualityStatus'
    ];
    
    const missing = requiredFunctions.filter(funcName => typeof window[funcName] !== 'function');
    
    if (missing.length > 0) {
        console.error('❌ 필수 함수가 누락되었습니다:', missing);
        console.error('   다음 파일들이 로드되었는지 확인하세요:');
        console.error('   - js/data_fetcher.js');
        console.error('   - js/air_quality_utils.js');
        console.error('   - js/main.js');
        return false;
    }
    
    console.log('✅ 모든 필수 함수가 로드되었습니다.');
    return true;
}

// API 키 테스트 함수
async function testApiKey(apiKey) {
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.error('❌ 유효한 API 키를 입력해주세요.');
        console.log('💡 API 키 발급 방법:');
        console.log('   1. https://data.go.kr 접속');
        console.log('   2. "에어코리아 대기오염정보" 검색');
        console.log('   3. 활용신청 후 API 키 발급');
        return false;
    }
    
    console.log('🔑 API 키 설정 중...');
    const success = setApiKey(apiKey);
    
    if (!success) {
        console.error('❌ API 키 설정 실패');
        return false;
    }
    
    console.log('🔍 API 키 유효성 검사 중...');
    if (!validateApiKey()) {
        console.error('❌ API 키 유효성 검사 실패');
        return false;
    }
    
    console.log('🌫️ 대기질 데이터 테스트 중...');
    try {
        const testData = await getAirQualityData('종로구');
        
        if (!testData) {
            console.error('❌ 대기질 데이터를 가져올 수 없습니다.');
            return false;
        }
        
        if (testData.isTestData) {
            console.warn('⚠️ 목업 데이터가 반환되었습니다.');
            console.warn('   API 키가 올바르지 않거나 네트워크 문제일 수 있습니다.');
        } else {
            console.log('✅ 실제 API 데이터를 성공적으로 가져왔습니다!');
            console.log('📊 데이터 미리보기:');
            console.log(`   📍 측정소: ${testData.stationName}`);
            console.log(`   🕐 측정시간: ${testData.dataTime}`);
            if (testData.pm25.value !== null) {
                console.log(`   🌫️ PM2.5: ${testData.pm25.value}㎍/㎥ (등급: ${testData.pm25.grade})`);
            }
            if (testData.pm10.value !== null) {
                console.log(`   🌫️ PM10: ${testData.pm10.value}㎍/㎥ (등급: ${testData.pm10.grade})`);
            }
        }
        
        // 대기질 상태 계산 테스트
        const status = getOverallAirQualityStatus(testData);
        console.log(`🎯 전체 대기질 상태: ${status.text} (${status.details})`);
        
        return true;
        
    } catch (error) {
        console.error('❌ 대기질 데이터 테스트 실패:', error.message);
        return false;
    }
}

// 전체 앱 테스트 함수
async function testFullApp() {
    console.log('\n🚀 전체 앱 테스트 시작...');
    
    if (!checkRequiredFunctions()) {
        return false;
    }
    
    // API 키 입력 요청
    const apiKey = prompt('Air Korea API 키를 입력하세요:');
    
    if (!apiKey) {
        console.log('⏸️ 테스트가 취소되었습니다.');
        return false;
    }
    
    const success = await testApiKey(apiKey);
    
    if (success) {
        console.log('\n🎉 모든 테스트가 성공했습니다!');
        console.log('💡 이제 실제 LaMetric 장치에서 앱을 실행할 수 있습니다.');
        
        // LaMetric 앱 시뮬레이션 실행
        console.log('\n🔄 LaMetric 앱 시뮬레이션 실행...');
        if (typeof initializeApp === 'function') {
            initializeApp();
        } else {
            console.warn('⚠️ initializeApp 함수를 찾을 수 없습니다.');
        }
    } else {
        console.log('\n❌ 테스트 실패. 설정을 확인하고 다시 시도해주세요.');
    }
    
    return success;
}

// 빠른 목업 데이터 테스트
function testMockData() {
    console.log('\n🎭 목업 데이터 테스트...');
    
    // API 키 없이 목업 데이터로 테스트
    getAirQualityData('종로구').then(data => {
        console.log('📊 목업 데이터:', data);
        
        if (data.isTestData) {
            console.log('✅ 목업 데이터가 정상적으로 반환되었습니다.');
            
            const status = getOverallAirQualityStatus(data);
            console.log(`🎯 대기질 상태: ${status.text}`);
            
            console.log('💡 실제 데이터를 사용하려면 API 키를 설정하세요.');
        }
    }).catch(error => {
        console.error('❌ 목업 데이터 테스트 실패:', error);
    });
}

// 사용법 안내
function showUsage() {
    console.log('\n📖 사용법:');
    console.log('');
    console.log('🔹 전체 테스트:');
    console.log('   testFullApp()');
    console.log('');
    console.log('🔹 API 키만 테스트:');
    console.log('   testApiKey("여기에_API키_입력")');
    console.log('');
    console.log('🔹 목업 데이터 테스트:');
    console.log('   testMockData()');
    console.log('');
    console.log('🔹 함수 확인:');
    console.log('   checkRequiredFunctions()');
    console.log('');
}

// 초기 실행
if (typeof window !== 'undefined') {
    // 브라우저 환경
    window.testFullApp = testFullApp;
    window.testApiKey = testApiKey;
    window.testMockData = testMockData;
    window.checkRequiredFunctions = checkRequiredFunctions;
    window.showUsage = showUsage;
    
    console.log('🌐 브라우저 환경에서 실행 중입니다.');
    showUsage();
    
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js 환경
    module.exports = {
        testFullApp,
        testApiKey,
        testMockData,
        checkRequiredFunctions,
        showUsage
    };
    
    console.log('🖥️ Node.js 환경에서 실행 중입니다.');
    showUsage();
    
} else {
    // LaMetric 환경
    console.log('📱 LaMetric 환경에서 실행 중입니다.');
    showUsage();
}

console.log('\n✨ 테스트 스크립트가 로드되었습니다!'); 