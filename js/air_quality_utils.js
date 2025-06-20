// air_quality_utils.js

const AIR_QUALITY_LEVELS = {
    GOOD: { text: '좋음', color: '#007bff', order: 1 },       // 파란색
    MODERATE: { text: '보통', color: '#28a745', order: 2 }, // 초록색
    UNHEALTHY: { text: '나쁨', color: '#ffc107', order: 3 }, // 노란색/주황색
    VERY_UNHEALTHY: { text: '매우 나쁨', color: '#dc3545', order: 4 } // 빨간색
    // 필요한 경우 다섯 번째 레벨 추가 고려, 예: HAZARDOUS: { text: '위험', color: '#800080', order: 5 } // 보라색
};

/**
 * PM2.5 값에 기반하여 대기질 수준을 결정합니다.
 * 이 범위들은 일반적인 국제 표준에 기반하며 특정 한국 가이드라인이나
 * "미세미세" 앱에 맞춰 조정이 필요할 수 있습니다.
 * @param {number} pm25Value - µg/m³ 단위의 PM2.5 농도.
 * @returns {object} 대기질 수준 객체 (text, color, order).
 */
function getPm25Level(pm25Value) {
    if (pm25Value === null || isNaN(pm25Value)) return null; // 데이터 없음
    if (pm25Value <= 15) return AIR_QUALITY_LEVELS.GOOD;
    if (pm25Value <= 35) return AIR_QUALITY_LEVELS.MODERATE;
    if (pm25Value <= 75) return AIR_QUALITY_LEVELS.UNHEALTHY;
    return AIR_QUALITY_LEVELS.VERY_UNHEALTHY;
}

/**
 * PM10 값에 기반하여 대기질 수준을 결정합니다.
 * 이 범위들은 일반적인 국제 표준에 기반하며 특정 한국 가이드라인이나
 * "미세미세" 앱에 맞춰 조정이 필요할 수 있습니다.
 * @param {number} pm10Value - µg/m³ 단위의 PM10 농도.
 * @returns {object} 대기질 수준 객체 (text, color, order).
 */
function getPm10Level(pm10Value) {
    if (pm10Value === null || isNaN(pm10Value)) return null; // 데이터 없음
    if (pm10Value <= 30) return AIR_QUALITY_LEVELS.GOOD;
    if (pm10Value <= 80) return AIR_QUALITY_LEVELS.MODERATE;
    if (pm10Value <= 150) return AIR_QUALITY_LEVELS.UNHEALTHY;
    return AIR_QUALITY_LEVELS.VERY_UNHEALTHY;
}

/**
 * 통합대기환경지수(KHAI)에 기반하여 대기질 수준을 결정합니다.
 * @param {number} khaiValue - 통합대기환경지수 값
 * @returns {object} 대기질 수준 객체 (text, color, order).
 */
function getKhaiLevel(khaiValue) {
    if (khaiValue === null || isNaN(khaiValue)) return null;
    if (khaiValue <= 50) return AIR_QUALITY_LEVELS.GOOD;
    if (khaiValue <= 100) return AIR_QUALITY_LEVELS.MODERATE;
    if (khaiValue <= 150) return AIR_QUALITY_LEVELS.UNHEALTHY;
    return AIR_QUALITY_LEVELS.VERY_UNHEALTHY;
}

/**
 * API 등급을 내부 대기질 수준으로 변환합니다.
 * Air Korea API는 1-4 등급을 사용합니다 (1=좋음, 2=보통, 3=나쁨, 4=매우나쁨)
 * @param {number} apiGrade - API에서 받은 등급 (1-4)
 * @returns {object} 대기질 수준 객체 (text, color, order).
 */
function convertApiGradeToLevel(apiGrade) {
    if (apiGrade === null || isNaN(apiGrade)) return null;
    
    switch (parseInt(apiGrade)) {
        case 1: return AIR_QUALITY_LEVELS.GOOD;
        case 2: return AIR_QUALITY_LEVELS.MODERATE;
        case 3: return AIR_QUALITY_LEVELS.UNHEALTHY;
        case 4: return AIR_QUALITY_LEVELS.VERY_UNHEALTHY;
        default: return null;
    }
}

/**
 * 새로운 API 응답 데이터 구조를 기반으로 전체 대기질 상태를 결정합니다.
 * PM2.5, PM10, KHAI 등을 종합적으로 고려하여 가장 심각한 수준을 반환합니다.
 * @param {object} airQualityData - getAirQualityData()에서 반환된 데이터 객체
 * @returns {object} 전체 대기질 상태 (text, color, order, details)
 */
function getOverallAirQualityStatus(airQualityData) {
    if (!airQualityData) {
        return {
            text: '데이터 없음',
            color: '#808080',
            order: 0,
            details: '대기질 데이터를 가져올 수 없습니다.'
        };
    }

    const levels = [];
    let primaryValue = null;
    let primaryType = null;

    // PM2.5 수준 평가 (우선순위 높음)
    if (airQualityData.pm25 && airQualityData.pm25.value !== null) {
        // API 등급이 있으면 사용, 없으면 수치로 계산
        const pm25Level = airQualityData.pm25.grade ? 
            convertApiGradeToLevel(airQualityData.pm25.grade) : 
            getPm25Level(airQualityData.pm25.value);
        
        if (pm25Level) {
            levels.push(pm25Level);
            primaryValue = airQualityData.pm25.value;
            primaryType = 'PM2.5';
        }
    }

    // PM10 수준 평가
    if (airQualityData.pm10 && airQualityData.pm10.value !== null) {
        const pm10Level = airQualityData.pm10.grade ? 
            convertApiGradeToLevel(airQualityData.pm10.grade) : 
            getPm10Level(airQualityData.pm10.value);
        
        if (pm10Level) {
            levels.push(pm10Level);
            // PM2.5가 없는 경우에만 PM10을 주 지표로 사용
            if (!primaryValue) {
                primaryValue = airQualityData.pm10.value;
                primaryType = 'PM10';
            }
        }
    }

    // 통합대기환경지수(KHAI) 평가
    if (airQualityData.khaiValue !== null) {
        const khaiLevel = airQualityData.khaiGrade ? 
            convertApiGradeToLevel(airQualityData.khaiGrade) : 
            getKhaiLevel(airQualityData.khaiValue);
        
        if (khaiLevel) {
            levels.push(khaiLevel);
        }
    }

    // 가장 심각한 수준 선택
    if (levels.length === 0) {
        return {
            text: '데이터 부족',
            color: '#808080',
            order: 0,
            details: '유효한 대기질 데이터가 없습니다.'
        };
    }

    // 가장 높은 order 값(가장 나쁜 상태)을 가진 레벨 선택
    const worstLevel = levels.reduce((worst, current) => 
        current.order > worst.order ? current : worst
    );

    // 상세 정보 생성
    const details = [];
    if (primaryValue && primaryType) {
        details.push(`${primaryType}: ${primaryValue}㎍/㎥`);
    }
    if (airQualityData.khaiValue) {
        details.push(`통합지수: ${airQualityData.khaiValue}`);
    }

    return {
        text: worstLevel.text,
        color: worstLevel.color,
        order: worstLevel.order,
        details: details.join(', '),
        primaryValue: primaryValue,
        primaryType: primaryType,
        stationName: airQualityData.stationName,
        dataTime: airQualityData.dataTime
    };
}

/**
 * 대기질 수치에 대한 건강 권고사항을 반환합니다.
 * @param {object} status - getOverallAirQualityStatus()에서 반환된 상태 객체
 * @returns {string} 건강 권고사항
 */
function getHealthRecommendation(status) {
    switch (status.order) {
        case 1: // 좋음
            return '외출 및 실외 활동에 좋은 날씨입니다.';
        case 2: // 보통
            return '일반적인 외출에는 무리가 없으나, 민감한 분들은 주의하세요.';
        case 3: // 나쁨
            return '장시간 외출을 자제하고, 외출시 마스크 착용을 권장합니다.';
        case 4: // 매우 나쁨
            return '외출을 최대한 자제하고, 실내 공기정화에 신경쓰세요.';
        default:
            return '대기질 정보를 확인할 수 없습니다.';
    }
}

/**
 * 레거시 호환성을 위한 함수 (기존 코드와의 호환성 유지)
 * @deprecated 새로운 getOverallAirQualityStatus() 함수 사용 권장
 */
function getOverallAirQualityStatusLegacy(pm10Value, pm25Value) {
    console.warn('getOverallAirQualityStatusLegacy()는 더 이상 사용되지 않습니다. 새로운 getOverallAirQualityStatus() 함수를 사용하세요.');
    
    // 레거시 형식으로 데이터 변환
    const legacyData = {
        pm10: { value: pm10Value, grade: null },
        pm25: { value: pm25Value, grade: null },
        khaiValue: null,
        khaiGrade: null,
        stationName: '알 수 없음',
        dataTime: new Date().toLocaleString('ko-KR')
    };
    
    return getOverallAirQualityStatus(legacyData);
}

/**
 * 대기질 데이터의 유효성을 검증합니다.
 * @param {object} airQualityData - 검증할 대기질 데이터
 * @returns {boolean} 유효한 데이터인지 여부
 */
function validateAirQualityData(airQualityData) {
    if (!airQualityData || typeof airQualityData !== 'object') {
        return false;
    }
    
    // 최소한 PM10 또는 PM2.5 중 하나는 있어야 함
    const hasPm10 = airQualityData.pm10 && airQualityData.pm10.value !== null;
    const hasPm25 = airQualityData.pm25 && airQualityData.pm25.value !== null;
    
    return hasPm10 || hasPm25;
}

// 사용 예시 및 테스트 함수
function testAirQualityUtils() {
    console.log('=== 대기질 유틸리티 테스트 ===');
    
    const testData = {
        stationName: '종로구',
        dataTime: '2024-01-15 14:00',
        pm10: { value: 45, grade: 2 },
        pm25: { value: 28, grade: 2 },
        khaiValue: 85,
        khaiGrade: 2
    };
    
    const status = getOverallAirQualityStatus(testData);
    console.log('테스트 결과:', status);
    console.log('건강 권고사항:', getHealthRecommendation(status));
    console.log('데이터 유효성:', validateAirQualityData(testData));
    
    console.log('=============================');
}

// 모듈 내보내기 (LaMetric 환경에 따라 조정 필요)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getOverallAirQualityStatus,
        getOverallAirQualityStatusLegacy,
        getPm25Level,
        getPm10Level,
        getKhaiLevel,
        convertApiGradeToLevel,
        getHealthRecommendation,
        validateAirQualityData,
        testAirQualityUtils,
        AIR_QUALITY_LEVELS
    };
}
