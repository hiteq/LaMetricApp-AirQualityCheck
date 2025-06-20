// main.js - Main script for the LaMetric Fine Dust App

// --- Conceptual Imports ---
// LaMetric environment might handle JS files differently.
// These are placeholders for how one might include other scripts if it were Node.js or similar.
// Assume functions from data_fetcher.js and air_quality_utils.js are available globally
// or loaded/imported via LaMetric's specific mechanism.
// For the purpose of this subtask, we'll assume getAirQualityData and getOverallAirQualityStatus are defined.
// If this were a real LaMetric app, these would be loaded via:
// e.g. var DataFetcher = require('./data_fetcher.js');
// e.g. var Utils = require('./air_quality_utils.js');

// Placeholder for LaMetric's way of managing frames and app lifecycle.
// This is highly conceptual.
const LaMetric = {
    frames: {
        main_frame: { // Matches the ID in app.json
            text: 'Initializing...',
            icon: 'i438', // Default icon from app.json
            // Potentially other properties like 'backgroundColor' or specific colored icons
        }
    },
    // Mock function to simulate pushing frame updates to the device
    pushFrame: function(frameId, frameData) {
        if (this.frames[frameId]) {
            Object.assign(this.frames[frameId], frameData);
            console.log(`LAMETRIC_PUSH_FRAME: ID=${frameId}, DATA=${JSON.stringify(this.frames[frameId])}`);
        } else {
            console.error(`LAMETRIC_PUSH_FRAME: Unknown frame ID: ${frameId}`);
        }
    },
    // Mock function for app lifecycle: onReady, onNextFrame, etc.
    onReady: function(callback) {
        console.log('LAMETRIC_LIFECYCLE: App ready.');
        if(callback) callback();
    },
    // Function to get settings. In a real app, LaMetric OS provides these.
    getSettings: function() {
        // This mock should reflect settings defined in app.json
        // 'stationName' would be populated by user input in LaMetric app configuration.
        return {
            stationName: '종로구' // Default value if not set by user, or actual value from LaMetric
        };
    }
};

// --- Main Application Logic ---

async function updateDisplay() {
    console.log('Updating display...');
    // Get configured station from LaMetric settings (mocked here)
    const settings = LaMetric.getSettings();
    const stationName = settings.stationName; // Ensure this is used

    // console.log(`Using station name: ${stationName} from settings.`); // For debugging

    // 1. Fetch air quality data (currently mock)
    // In a real scenario: const airData = await DataFetcher.getAirQualityData(stationName);
    const airData = await getAirQualityData(stationName); // Pass the stationName

    let displayText = '정보 없음';
    let displayIcon = 'i438'; // Default icon
    let frameColor = '#808080'; // Default grey color

    if (airData && !airData.error) {
        // 2. Determine air quality status and color
        // In a real scenario: const status = Utils.getOverallAirQualityStatus(airData.pm10, airData.pm25);
        const status = getOverallAirQualityStatus(airData.pm10, airData.pm25); // Assumes global from air_quality_utils.js

        // 3. Format text for display
        // Example: "종로구: 좋음 (PM10: 25)" or "종로구: 보통 (PM2.5: 30)"
        displayText = `${airData.station || stationName}: ${status.status}`;
        if (status.dominantValueDisplay && status.dominantValueDisplay !== 'N/A') {
            displayText += ` (${status.dominantValueDisplay})`;
        }

        frameColor = status.color;

        // Icon handling:
        // Ideally, we'd have different icons for different states (e.g., icon_blue, icon_green)
        // or use LaMetric's built-in colored icons if their names were known.
        // For now, we're just setting the color property conceptually.
        // If LaMetric uses specific icon names for colors:
        // displayIcon = getIconForStatus(status.levelOrder); // e.g. a function that returns 'a74_blue', 'a74_green'
        // For this example, we'll stick to the single icon and rely on the 'frameColor' being used.
        // The 'icon' field in the frame could also be dynamically set to a pre-defined colored icon.
        // e.g. displayIcon = `i_AQI_${status.levelOrder}`; (assuming icons like i_AQI_1, i_AQI_2 exist)

        console.log(`Formatted display text: ${displayText}, Color: ${frameColor}`);

    } else {
        displayText = airData.message || '데이터 로딩 실패';
        console.error('Failed to get air quality data or error in data:', airData);
    }

    // 4. Update LaMetric Frame
    // This is a conceptual update. The actual API might be different.
    // It might involve creating a new frame object and returning it.
    LaMetric.pushFrame('main_frame', {
        text: displayText,
        icon: displayIcon, // Could be dynamic based on status
        // LaMetric might support 'backgroundColor: frameColor' or specific colored icons.
        // For now, we are just logging the intended color.
        // If using icons like 'a1234_#FF0000_text', the color is embedded.
        // If frames have a color property, it would be set here.
        // This is a major point of uncertainty without docs.
    });
    console.log(`Intended frame color for display: ${frameColor}`);
}

// --- App Initialization and Polling ---
LaMetric.onReady(async () => {
    await updateDisplay(); // Initial update

    // Set up polling - LaMetric might have its own scheduler or way to declare update frequency.
    // This setInterval is a generic JavaScript way to do it.
    const updateInterval = 15 * 60 * 1000; // 15 minutes
    setInterval(async () => {
        await updateDisplay();
    }, updateInterval);

    console.log(`App initialized. Display will update every ${updateInterval / 1000 / 60} minutes.`);
});

// This makes the functions available if they are not truly global (e.g. if files are concatenated)
// This part might not be necessary depending on LaMetric's JS environment.
// window.getAirQualityData = typeof getAirQualityData !== 'undefined' ? getAirQualityData : (async () => ({error: true, message: "Not loaded"}));
// window.getOverallAirQualityStatus = typeof getOverallAirQualityStatus !== 'undefined' ? getOverallAirQualityStatus : (() => ({status: 'N/A', color: '#808080'}));
