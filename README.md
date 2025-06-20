# 미세먼지 알리미 (Fine Dust Notifier) for LaMetric Time

## Description

This LaMetric Time app displays the current fine dust (미세먼지) levels for a specified Korean air quality monitoring station. It aims to provide a quick visual assessment of air quality using color codes, similar to popular Korean fine dust apps.

**Project Goal:** To easily check the current fine dust status via LaMetric Time, intended for distribution on the LaMetric Market.

## Features

*   Displays air quality status based on PM10 and PM2.5 levels (좋음, 보통, 나쁨, 매우 나쁨).
*   Conceptual color-coded display for quick visual assessment (actual color rendering depends on LaMetric device capabilities and specific implementation against its SDK).
*   Configurable monitoring station name via LaMetric app settings.

## Current Status & IMPORTANT LIMITATIONS

*   **MOCK DATA:** This version of the app currently uses **MOCK (SIMULATED) AIR QUALITY DATA** located in `js/data_fetcher.js`. It does NOT fetch live data from any external API.
*   **REAL API REQUIRED:** For actual functionality, the app must be integrated with a live air quality data API (e.g., Air Korea). This involves:
    *   Obtaining an API key if required.
    *   Updating `js/data_fetcher.js` to make real HTTP requests.
    *   Properly parsing the API response.
*   **LAMETRIC SDK ASSUMPTIONS:** The JavaScript code for interacting with the LaMetric device (e.g., updating display frames, handling settings, loading modules/JS files) is based on **general assumptions** due to the unavailability of specific LaMetric developer documentation during development. These parts in `js/main.js` (especially the `LaMetric` mock object) **will need to be replaced with actual LaMetric SDK calls.**
*   **ICONS:** The icon files in the `images/` directory (`icon_small.png`, `icon_large.png`) are currently **empty placeholders**. Actual PNG images with appropriate dimensions and design are needed. The method for displaying colored status (e.g., via colored icons or background) also needs to be implemented per LaMetric SDK.
*   **LOCATION SETTING:** The app allows configuring a "측정소명" (monitoring station name) in settings. How this setting is technically read and used by the app needs to be verified with LaMetric SDK.

## Setup / Configuration

1.  **Monitoring Station (`stationName`):**
    *   This app is designed to be configured with a specific Korean air quality monitoring station name (e.g., "종로구", "강남대로").
    *   This setting is defined in `app.json` (`settings -> stationName`) and should be configurable by the user through the LaMetric mobile app once the app is installed.
    *   The default station is "종로구".
2.  **API Key (Future):**
    *   The file `js/data_fetcher.js` contains a placeholder for an API key (`YOUR_API_KEY_HERE`). When integrating a real API, this key will need to be provided and handled securely.

## File Structure

*   `app.json`: The LaMetric application manifest file (defines app ID, name, frames, settings, icons).
*   `images/`: Contains app icons.
    *   `icon_small.png`: Placeholder for the small icon shown in the frame.
    *   `icon_large.png`: Placeholder for the larger app store icon.
*   `js/`: Contains the JavaScript logic for the app.
    *   `main.js`: Main application script; orchestrates data fetching, processing, and display updates. Contains a mock LaMetric environment.
    *   `data_fetcher.js`: Responsible for fetching air quality data. **Currently returns mock data.**
    *   `air_quality_utils.js`: Provides utility functions to determine air quality status and color based on PM values.
*   `README.md`: This file.

## Conceptual Packaging for LaMetric Market

*   To distribute this app on the LaMetric Market, all files and folders within this `fine_dust_app` directory would typically be packaged into a single ZIP archive.
*   This ZIP file would then be uploaded through the LaMetric developer portal.

### Conceptual Local Testing (PC Environment)

While this application is designed for a LaMetric Time device, you can conceptually test parts of its JavaScript logic on your local computer using a Node.js environment. This can help you understand the data transformations and status logic. **This is NOT a substitute for testing on an actual LaMetric device or emulator.**

**Prerequisites:**
*   Node.js installed on your computer.

**1. Testing `air_quality_utils.js`:**

This file contains the logic for determining air quality status and colors.

*   Navigate to the `js/` directory in your terminal.
*   Create a temporary test script (e.g., `test_utils.js`) with content like this:

    ```javascript
    // test_utils.js
    const { getOverallAirQualityStatus, AIR_QUALITY_LEVELS } = require('./air_quality_utils.js'); // Assuming CommonJS export for Node

    console.log("--- Testing air_quality_utils.js ---");

    console.log("Test Case 1: PM10 Good, PM2.5 Good");
    let status1 = getOverallAirQualityStatus(25, 10);
    console.log(status1);
    // Expected: { status: '좋음', color: '#007bff', levelOrder: 1, ... }

    console.log("\nTest Case 2: PM10 Moderate, PM2.5 Good");
    let status2 = getOverallAirQualityStatus(70, 10);
    console.log(status2);
    // Expected: { status: '보통', color: '#28a745', levelOrder: 2, dominantValueDisplay: 'PM10: 70', ... }

    console.log("\nTest Case 3: PM10 Good, PM2.5 Unhealthy");
    let status3 = getOverallAirQualityStatus(20, 60);
    console.log(status3);
    // Expected: { status: '나쁨', color: '#ffc107', levelOrder: 3, dominantValueDisplay: 'PM2.5: 60', ... }

    console.log("\nTest Case 4: No data");
    let status4 = getOverallAirQualityStatus(null, null);
    console.log(status4);
    // Expected: { status: '정보 없음', color: '#808080', ... }

    // To make this runnable in Node, air_quality_utils.js might need to export its functions, e.g., at the end of the file:
    // module.exports = { getOverallAirQualityStatus, AIR_QUALITY_LEVELS, getPm10Level, getPm25Level };
    ```
*   You might need to modify `air_quality_utils.js` to properly export functions for Node.js (e.g., using `module.exports`). For example, add this to the end of `air_quality_utils.js`:
    ```javascript
    // Add this to the end of air_quality_utils.js for Node.js testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            AIR_QUALITY_LEVELS,
            getPm25Level,
            getPm10Level,
            getOverallAirQualityStatus
        };
    }
    ```
*   Run the test script from within the `js/` directory: `node test_utils.js`
*   Observe the console output.

**2. Observing `data_fetcher.js` (Mock Data Output):**

This file currently returns mock air quality data.

*   Navigate to the `js/` directory.
*   Create another temporary test script (e.g., `test_fetcher.js`):

    ```javascript
    // test_fetcher.js
    const { getAirQualityData } = require('./data_fetcher.js'); // Assuming CommonJS export

    async function main() {
        console.log("--- Testing data_fetcher.js (Mock Data) ---");
        const airQuality = await getAirQualityData('종로구'); // Example station
        console.log(airQuality);
        // Expected: Mock data structure with random pm10Value, pm25Value.
    }

    main();

    // To make this runnable in Node, data_fetcher.js might need to export its functions, e.g., at the end of the file:
    // module.exports = { getAirQualityData };
    ```
*   Similarly, modify `data_fetcher.js` to export `getAirQualityData` for Node.js:
    ```javascript
    // Add this to the end of data_fetcher.js for Node.js testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { getAirQualityData };
    }
    ```
*   Run the script: `node test_fetcher.js`
*   Observe the mock data structure printed to the console.

**3. Understanding `main.js` Flow (Conceptual):**

`main.js` orchestrates the app and contains a mock `LaMetric` object. You can read its `console.log` statements to understand the intended flow of operations and what data would be sent to the LaMetric display. Direct execution in Node.js is less straightforward due to its LaMetric-specific mock object, but reading the code and the logs from the other two files will give insights.

**Reminder:** These local tests only verify parts of the JavaScript logic. The actual user experience, display rendering, settings management, and API communication on a LaMetric device will require testing in the actual LaMetric environment after adapting the code with the official LaMetric SDK.

## Future Enhancements (Conceptual)

*   Integrate with a live Korean air quality API.
*   Implement dynamic icon coloring or selection based on air quality status, using LaMetric SDK.
*   Refine UI/UX based on actual device testing.
*   Investigate automatic location detection if supported and appropriate for LaMetric.
*   Add robust error handling for API calls and device interactions.
