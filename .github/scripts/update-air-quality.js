const fs = require('fs');
const path = require('path');
// Node.js 18+에서는 fetch가 내장되어 있음

// 설정
const API_KEY = process.env.AIR_KOREA_API_KEY;
const OUTPUT_DIR = './docs'; // GitHub Pages를 위한 docs 폴더
const STATIONS = [
    '종로구', '중구', '강남구', '마포구', '송파구', 
    '강서구', '영등포구', '성북구', '용산구', '서초구'
];

// Air Korea API에서 데이터 가져오기
async function getAirKoreaData(stationName) {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        throw new Error('API 키가 설정되지 않았습니다. GitHub Secrets에서 AIR_KOREA_API_KEY를 확인하세요.');
    }

    const baseUrl = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
    const params = new URLSearchParams({
        serviceKey: API_KEY,
        returnType: 'json',
        numOfRows: '1',
        pageNo: '1',
        stationName: stationName,
        dataTerm: 'DAILY',
        ver: '1.3'
    });

    const url = `${baseUrl}?${params.toString()}`;
    
    console.log(`🌫️ Air Korea API 호출: ${stationName}`);
    
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
                console.warn(`⚠️ 측정소 "${stationName}"에 대한 데이터가 없습니다.`);
                return null;
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
                khaiGrade: parseInt(item.khaiGrade) || null,
                lastUpdated: new Date().toISOString()
            };
        } else {
            throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
        
    } catch (error) {
        console.error(`❌ ${stationName} 데이터 가져오기 실패:`, error.message);
        return null;
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
    if (!airData) {
        return {
            grade: 0,
            text: '데이터없음',
            icon: 'i120',
            value: null,
            type: null
        };
    }

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
    if (!airData) {
        return {
            frames: [
                {
                    text: '데이터 없음',
                    icon: 'i120'
                }
            ]
        };
    }

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

// 메인 실행 함수
async function main() {
    console.log('🚀 대기질 데이터 업데이트 시작...');
    
    // docs 폴더 생성
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 ${OUTPUT_DIR} 폴더를 생성했습니다.`);
    }

    const results = {};
    let successCount = 0;
    let errorCount = 0;

    // 각 측정소별로 데이터 수집
    for (const station of STATIONS) {
        try {
            const airData = await getAirKoreaData(station);
            
            if (airData) {
                results[station] = {
                    raw: airData,
                    lametric: formatForLaMetric(airData, true),
                    lametric_simple: formatForLaMetric(airData, false)
                };
                
                // 개별 측정소 파일 생성
                const stationFile = path.join(OUTPUT_DIR, `${station}.json`);
                fs.writeFileSync(stationFile, JSON.stringify(results[station].lametric, null, 2));
                
                // 간단한 형식 파일도 생성
                const simpleFile = path.join(OUTPUT_DIR, `${station}-simple.json`);
                fs.writeFileSync(simpleFile, JSON.stringify(results[station].lametric_simple, null, 2));
                
                console.log(`✅ ${station}: ${results[station].lametric.frames[0].text}`);
                successCount++;
            } else {
                errorCount++;
            }
            
            // API 호출 간격 (1초)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`❌ ${station} 처리 실패:`, error.message);
            errorCount++;
        }
    }

    // 전체 결과 파일 생성
    const summaryData = {
        lastUpdated: new Date().toISOString(),
        totalStations: STATIONS.length,
        successCount: successCount,
        errorCount: errorCount,
        stations: Object.keys(results),
        data: results
    };

    // 전체 데이터 파일
    fs.writeFileSync(path.join(OUTPUT_DIR, 'all-stations.json'), JSON.stringify(summaryData, null, 2));
    
    // 기본 파일 (종로구 데이터)
    if (results['종로구']) {
        fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(results['종로구'].lametric, null, 2));
    }

    // README 파일 생성
    const readmeContent = `# 미세먼지 데이터 API

마지막 업데이트: ${new Date().toLocaleString('ko-KR')}

## 📊 현재 상태
- 총 측정소: ${STATIONS.length}개
- 성공: ${successCount}개
- 실패: ${errorCount}개

## 🔗 LaMetric URL

### 기본 (종로구)
\`\`\`
https://your-username.github.io/lametric-time-aqcheck/index.json
\`\`\`

### 특정 측정소
\`\`\`
https://your-username.github.io/lametric-time-aqcheck/강남구.json
https://your-username.github.io/lametric-time-aqcheck/마포구.json
https://your-username.github.io/lametric-time-aqcheck/송파구.json
\`\`\`

### 간단한 형식
\`\`\`
https://your-username.github.io/lametric-time-aqcheck/종로구-simple.json
\`\`\`

## 📁 사용 가능한 파일

${Object.keys(results).map(station => 
`- \`${station}.json\` - ${results[station].lametric.frames[0].text}`
).join('\n')}

## 🔄 업데이트 주기
매 15분마다 자동 업데이트됩니다.
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readmeContent);

    console.log('\n📋 업데이트 완료:');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`📁 출력 폴더: ${OUTPUT_DIR}`);
    
    if (errorCount > 0) {
        console.log('⚠️ 일부 측정소에서 데이터를 가져오지 못했습니다.');
    }
}

// 실행
main().catch(error => {
    console.error('💥 스크립트 실행 실패:', error);
    process.exit(1);
}); 