// air_quality_utils.js

const AIR_QUALITY_LEVELS = {
    GOOD: { text: '좋음', color: '#007bff', order: 1 },       // Blue
    MODERATE: { text: '보통', color: '#28a745', order: 2 }, // Green
    UNHEALTHY: { text: '나쁨', color: '#ffc107', order: 3 }, // Yellow/Orange
    VERY_UNHEALTHY: { text: '매우 나쁨', color: '#dc3545', order: 4 } // Red
    // Consider adding a FIFTH level if needed, e.g., HAZARDOUS: { text: '위험', color: '#800080', order: 5 } // Purple
};

/**
 * Determines the air quality level based on PM2.5 value.
 * These ranges are based on common international standards and might need
 * adjustment to match specific Korean guidelines or the "미세미세" app.
 * @param {number} pm25Value - The PM2.5 concentration in µg/m³.
 * @returns {object} The air quality level object (text, color, order).
 */
function getPm25Level(pm25Value) {
    if (pm25Value === null || isNaN(pm25Value)) return null; // No data
    if (pm25Value <= 15) return AIR_QUALITY_LEVELS.GOOD;
    if (pm25Value <= 35) return AIR_QUALITY_LEVELS.MODERATE;
    if (pm25Value <= 75) return AIR_QUALITY_LEVELS.UNHEALTHY;
    return AIR_QUALITY_LEVELS.VERY_UNHEALTHY;
}

/**
 * Determines the air quality level based on PM10 value.
 * These ranges are based on common international standards and might need
 * adjustment to match specific Korean guidelines or the "미세미세" app.
 * @param {number} pm10Value - The PM10 concentration in µg/m³.
 * @returns {object} The air quality level object (text, color, order).
 */
function getPm10Level(pm10Value) {
    if (pm10Value === null || isNaN(pm10Value)) return null; // No data
    if (pm10Value <= 30) return AIR_QUALITY_LEVELS.GOOD;
    if (pm10Value <= 80) return AIR_QUALITY_LEVELS.MODERATE;
    if (pm10Value <= 150) return AIR_QUALITY_LEVELS.UNHEALTHY;
    return AIR_QUALITY_LEVELS.VERY_UNHEALTHY;
}

/**
 * Determines the overall air quality status based on PM10 and PM2.5 values.
 * The more severe of the two pollutants determines the overall status.
 * @param {number|null} pm10 - The PM10 value.
 * @param {number|null} pm25 - The PM2.5 value.
 * @returns {object} An object containing { status, color, pm10Value, pm25Value, levelText }.
 *                   Returns a default error-like state if no data.
 */
function getOverallAirQualityStatus(pm10, pm25) {
    const pm10Level = getPm10Level(pm10);
    const pm25Level = getPm25Level(pm25);

    let finalLevel = null;
    let dominantPollutantValue = null;
    let dominantPollutantType = '';


    if (pm10Level && pm25Level) {
        finalLevel = pm10Level.order >= pm25Level.order ? pm10Level : pm25Level;
        dominantPollutantValue = pm10Level.order >= pm25Level.order ? pm10 : pm25;
        dominantPollutantType = pm10Level.order >= pm25Level.order ? 'PM10' : 'PM2.5';
    } else if (pm10Level) {
        finalLevel = pm10Level;
        dominantPollutantValue = pm10;
        dominantPollutantType = 'PM10';
    } else if (pm25Level) {
        finalLevel = pm25Level;
        dominantPollutantValue = pm25;
        dominantPollutantType = 'PM2.5';
    }

    if (finalLevel) {
        return {
            status: finalLevel.text,
            color: finalLevel.color,
            levelOrder: finalLevel.order,
            pm10Value: pm10,
            pm25Value: pm25,
            dominantValueDisplay: `${dominantPollutantType}: ${dominantPollutantValue}` // Text to show which value is displayed
        };
    }

    // Default/error state if no data or invalid data
    return {
        status: '정보 없음', // No Information
        color: '#808080',    // Grey
        levelOrder: 0,
        pm10Value: pm10,
        pm25Value: pm25,
        dominantValueDisplay: 'N/A'
    };
}

// Example Usage (for testing purposes):
// console.log("PM10: 25 (Good), PM2.5: 10 (Good) ->", getOverallAirQualityStatus(25, 10));
// console.log("PM10: 70 (Moderate), PM2.5: 10 (Good) ->", getOverallAirQualityStatus(70, 10));
// console.log("PM10: 70 (Moderate), PM2.5: 30 (Moderate) ->", getOverallAirQualityStatus(70, 30));
// console.log("PM10: 160 (Very Unhealthy), PM2.5: 30 (Moderate) ->", getOverallAirQualityStatus(160, 30));
// console.log("PM10: null, PM2.5: 30 (Moderate) ->", getOverallAirQualityStatus(null, 30));
// console.log("PM10: 50, PM2.5: null ->", getOverallAirQualityStatus(50, null));
// console.log("PM10: null, PM2.5: null ->", getOverallAirQualityStatus(null, null));
// console.log("PM10: 200, PM2.5: 80 ->", getOverallAirQualityStatus(200, 80));


// If LaMetric requires exporting the function differently, this needs to be adjusted.
// export { getOverallAirQualityStatus, AIR_QUALITY_LEVELS };
