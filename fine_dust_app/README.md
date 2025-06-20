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

## Future Enhancements (Conceptual)

*   Integrate with a live Korean air quality API.
*   Implement dynamic icon coloring or selection based on air quality status, using LaMetric SDK.
*   Refine UI/UX based on actual device testing.
*   Investigate automatic location detection if supported and appropriate for LaMetric.
*   Add robust error handling for API calls and device interactions.
