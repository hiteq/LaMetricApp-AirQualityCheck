const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*'
}));
app.use(express.json());

// 로깅 미들웨어
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// 캐시 및 레이트 리미팅을 위한 간단한 메모리 저장소
const cache = new Map();
const lastRequestTime = new Map();

// Air Korea API 호출 함수
async function getAirKoreaData(stationName = process.env.DEFAULT_STATION || '종로구') {
    const apiKey = process.env.AIR_KOREA_API_KEY;
    
    if (!apiKey || apiKey === '여기에_발급받은_API키_입력') {
        throw new Error('Air Korea API 키가 설정되지 않았습니다. 환경변수 AIR_KOREA_API_KEY를 확인하세요.');
    }

    const baseUrl = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
    const params = new URLSearchParams({
        serviceKey: apiKey,
        returnType: 'json',
        numOfRows: '1',
        pageNo: '1',
        stationName: stationName,
        dataTerm: 'DAILY',
        ver: '1.3'
    });

    const url = `${baseUrl}?${params.toString()}`;
    
    console.log(`Air Korea API 호출: ${stationName}`);
    
    try {
        const response = await fetch(url);
        
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
            
            const items = data.response.body?.items;
            if (!items || items.length === 0) {
                throw new Error(`측정소 "${stationName}"에 대한 데이터가 없습니다.`);
            }
            
            const item = items[0];
            return {
                stationName: stationName,
                dataTime: item.dataTime || '알 수 없음',
                pm10: {
                    value: parseFloat(item.pm10Value) || null,
                    grade: parseInt(item.pm10Grade) || null
                },
                pm25: {
                    value: parseFloat(item.pm25Value) || null,
                    grade: parseInt(item.pm25Grade) || null
                },
                khaiValue: parseInt(item.khaiValue) || null,
                khaiGrade: parseInt(item.khaiGrade) || null
            };
        } else {
            throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
        
    } catch (error) {
        console.error('Air Korea API 호출 실패:', error.message);
        throw error;
    }
}

// 대기질 등급을 텍스트로 변환
function getAirQualityText(grade) {
    switch (parseInt(grade)) {
        case 1: return '좋음';
        case 2: return '보통';
        case 3: return '나쁨';
        case 4: return '매우나쁨';
        default: return '알수없음';
    }
}

// 대기질 등급에 따른 아이콘 선택
function getAirQualityIcon(grade) {
    switch (parseInt(grade)) {
        case 1: return 'i2395'; // 좋음 - 웃는 얼굴
        case 2: return 'i2396'; // 보통 - 평범한 얼굴  
        case 3: return 'i2397'; // 나쁨 - 우울한 얼굴
        case 4: return 'i2398'; // 매우나쁨 - 매우 우울한 얼굴
        default: return 'i438'; // 기본 아이콘
    }
}

// 전체 대기질 상태 계산
function calculateOverallStatus(airData) {
    const pm25Grade = airData.pm25.grade;
    const pm10Grade = airData.pm10.grade;
    
    // PM2.5가 있으면 우선, 없으면 PM10 사용
    let primaryGrade, primaryValue, primaryType;
    
    if (pm25Grade && airData.pm25.value !== null) {
        primaryGrade = pm25Grade;
        primaryValue = airData.pm25.value;
        primaryType = 'PM2.5';
    } else if (pm10Grade && airData.pm10.value !== null) {
        primaryGrade = pm10Grade;
        primaryValue = airData.pm10.value;
        primaryType = 'PM10';
    } else {
        return {
            grade: 0,
            text: '데이터없음',
            icon: 'i120',
            value: null,
            type: null
        };
    }

    // 더 심각한 등급 선택
    const worstGrade = Math.max(pm25Grade || 0, pm10Grade || 0);
    
    return {
        grade: worstGrade,
        text: getAirQualityText(worstGrade),
        icon: getAirQualityIcon(worstGrade),
        value: primaryValue,
        type: primaryType
    };
}

// LaMetric 형식으로 데이터 변환
function formatForLaMetric(airData, detailed = true) {
    const status = calculateOverallStatus(airData);
    
    let text;
    if (detailed && status.value && status.type) {
        text = `${airData.stationName} ${status.type}:${status.value} (${status.text})`;
    } else if (status.value && status.type) {
        text = `${status.type} ${status.value} (${status.text})`;
    } else {
        text = `${airData.stationName}: ${status.text}`;
    }

    return {
        frames: [
            {
                text: text,
                icon: status.icon
            }
        ]
    };
}

// 레이트 리미팅 체크
function checkRateLimit(clientId = 'default') {
    const now = Date.now();
    const lastRequest = lastRequestTime.get(clientId);
    const minInterval = (process.env.MIN_POLL_INTERVAL || 300) * 1000; // 기본 5분
    
    if (lastRequest && (now - lastRequest) < minInterval) {
        return false;
    }
    
    lastRequestTime.set(clientId, now);
    return true;
}

// 캐시 키 생성
function getCacheKey(stationName, detailed) {
    return `${stationName}_${detailed}`;
}

// 메인 API 엔드포인트
app.get('/api/air-quality', async (req, res) => {
    try {
        const stationName = req.query.station || process.env.DEFAULT_STATION || '종로구';
        const detailed = req.query.detailed !== 'false'; // 기본값 true
        const clientId = req.ip;
        
        console.log(`대기질 데이터 요청: ${stationName}, 상세: ${detailed}`);
        
        // 레이트 리미팅 체크 (개발 모드에서는 건너뛰기)
        if (process.env.NODE_ENV === 'production' && !checkRateLimit(clientId)) {
            console.log(`레이트 리미트 초과: ${clientId}`);
            return res.status(429).json({
                error: '너무 자주 요청하고 있습니다. 잠시 후 다시 시도해주세요.'
            });
        }
        
        // 캐시 확인 (5분간 유효)
        const cacheKey = getCacheKey(stationName, detailed);
        const cached = cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000) {
            console.log('캐시된 데이터 반환');
            return res.json(cached.data);
        }
        
        // Air Korea API에서 데이터 가져오기
        const airData = await getAirKoreaData(stationName);
        
        // LaMetric 형식으로 변환
        const laMetricData = formatForLaMetric(airData, detailed);
        
        // 캐시에 저장
        cache.set(cacheKey, {
            data: laMetricData,
            timestamp: Date.now()
        });
        
        console.log('새로운 데이터 반환:', JSON.stringify(laMetricData, null, 2));
        res.json(laMetricData);
        
    } catch (error) {
        console.error('API 에러:', error.message);
        
        // 에러 발생 시 기본 메시지 반환
        const errorResponse = {
            frames: [
                {
                    text: '데이터 로딩 실패',
                    icon: 'i120' // 경고 아이콘
                }
            ]
        };
        
        res.status(200).json(errorResponse); // LaMetric은 200 상태여야 함
    }
});

// 특정 측정소 데이터 엔드포인트
app.get('/api/air-quality/:station', async (req, res) => {
    const stationName = req.params.station;
    const detailed = req.query.detailed !== 'false';
    
    // 원래 엔드포인트로 리다이렉트
    req.query.station = stationName;
    req.query.detailed = detailed.toString();
    
    return app.get('/api/air-quality')(req, res);
});

// 상태 확인 엔드포인트
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: require('./package.json').version
    });
});

// 지원되는 측정소 목록
app.get('/api/stations', (req, res) => {
    const stations = [
        { name: '종로구', region: '서울' },
        { name: '중구', region: '서울' },
        { name: '강남구', region: '서울' },
        { name: '마포구', region: '서울' },
        { name: '송파구', region: '서울' },
        { name: '강서구', region: '서울' },
        { name: '영등포구', region: '서울' },
        { name: '성북구', region: '서울' }
    ];
    
    res.json(stations);
});

// 루트 엔드포인트 - 사용법 안내
app.get('/', (req, res) => {
    res.json({
        name: 'LaMetric 미세먼지 서버',
        version: require('./package.json').version,
        endpoints: {
            '/api/air-quality': '기본 대기질 데이터 (쿼리: station, detailed)',
            '/api/air-quality/:station': '특정 측정소 대기질 데이터',
            '/api/stations': '지원되는 측정소 목록',
            '/health': '서버 상태 확인'
        },
        usage: {
            lametric_url: `${req.protocol}://${req.get('host')}/api/air-quality?station=종로구&detailed=true`,
            examples: [
                `${req.protocol}://${req.get('host')}/api/air-quality?station=강남구`,
                `${req.protocol}://${req.get('host')}/api/air-quality/종로구?detailed=false`
            ]
        }
    });
});

// 404 처리
app.use('*', (req, res) => {
    res.status(404).json({
        error: '엔드포인트를 찾을 수 없습니다.',
        available_endpoints: [
            '/api/air-quality',
            '/api/air-quality/:station',
            '/api/stations',
            '/health'
        ]
    });
});

// 에러 핸들링
app.use((error, req, res, next) => {
    console.error('서버 에러:', error);
    res.status(500).json({
        error: '서버 내부 오류가 발생했습니다.',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 LaMetric 미세먼지 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📍 API 엔드포인트: http://localhost:${PORT}/api/air-quality`);
    console.log(`💡 사용법: http://localhost:${PORT}/`);
    
    if (!process.env.AIR_KOREA_API_KEY || process.env.AIR_KOREA_API_KEY === '여기에_발급받은_API키_입력') {
        console.warn('⚠️  AIR_KOREA_API_KEY 환경변수가 설정되지 않았습니다!');
        console.warn('   .env 파일을 생성하고 API 키를 설정해주세요.');
    }
});

// 종료 시 정리
process.on('SIGTERM', () => {
    console.log('서버 종료 중...');
    process.exit(0);
});

module.exports = app; 