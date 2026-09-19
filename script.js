/* =========================================
   WEATHER DASHBOARD
   REST API + FETCH + ASYNC/AWAIT
========================================= */


/* =========================================
   API ENDPOINTS
========================================= */

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


/* =========================================
   DOM ELEMENTS
========================================= */

const searchForm =
    document.getElementById("searchForm");

const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const weatherDashboard =
    document.getElementById("weatherDashboard");

const welcomeMessage =
    document.getElementById("welcomeMessage");


/* =========================================
   WEATHER CODE DESCRIPTIONS
========================================= */

const weatherCodes = {

    0: {
        description: "Clear Sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly Clear",
        icon: "🌤️"
    },

    2: {
        description: "Partly Cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Foggy",
        icon: "🌫️"
    },

    48: {
        description: "Depositing Rime Fog",
        icon: "🌫️"
    },

    51: {
        description: "Light Drizzle",
        icon: "🌦️"
    },

    53: {
        description: "Moderate Drizzle",
        icon: "🌦️"
    },

    55: {
        description: "Dense Drizzle",
        icon: "🌧️"
    },

    61: {
        description: "Slight Rain",
        icon: "🌦️"
    },

    63: {
        description: "Moderate Rain",
        icon: "🌧️"
    },

    65: {
        description: "Heavy Rain",
        icon: "🌧️"
    },

    71: {
        description: "Slight Snow",
        icon: "🌨️"
    },

    73: {
        description: "Moderate Snow",
        icon: "❄️"
    },

    75: {
        description: "Heavy Snow",
        icon: "❄️"
    },

    80: {
        description: "Rain Showers",
        icon: "🌦️"
    },

    81: {
        description: "Moderate Rain Showers",
        icon: "🌧️"
    },

    82: {
        description: "Violent Rain Showers",
        icon: "⛈️"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        description: "Thunderstorm with Hail",
        icon: "⛈️"
    },

    99: {
        description: "Thunderstorm with Heavy Hail",
        icon: "⛈️"
    }

};


/* =========================================
   EVENT LISTENER
========================================= */

searchForm.addEventListener(
    "submit",
    handleSearch
);


/* =========================================
   SEARCH HANDLER
========================================= */

async function handleSearch(event) {

    event.preventDefault();

    const city =
        cityInput.value.trim();

    if (!city) {

        showError(
            "Please enter a city name."
        );

        return;
    }

    await getWeather(city);
}


/* =========================================
   MAIN WEATHER FUNCTION
========================================= */

async function getWeather(city) {

    try {

        showLoading(true);

        hideError();

        /*
         * STEP 1:
         * Find latitude and longitude
         * using the Geocoding API.
         */

        const location =
            await getLocation(city);


        /*
         * STEP 2:
         * Fetch weather information
         * using latitude and longitude.
         */

        const weather =
            await getWeatherData(
                location.latitude,
                location.longitude
            );


        /*
         * STEP 3:
         * Render the JSON data
         * dynamically on the page.
         */

        displayWeather(
            location,
            weather
        );


    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong while fetching weather data."
        );

    } finally {

        /*
         * This always executes,
         * whether request succeeds or fails.
         */

        showLoading(false);
    }
}


/* =========================================
   GET LOCATION
========================================= */

async function getLocation(city) {

    const url =
        `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;


    const response =
        await fetch(url);


    /*
     * Check HTTP response status.
     */

    if (!response.ok) {

        throw new Error(
            `Location request failed: ${response.status}`
        );
    }


    /*
     * Convert response into JSON.
     */

    const data =
        await response.json();


    /*
     * Check whether a location exists.
     */

    if (
        !data.results ||
        data.results.length === 0
    ) {

        throw new Error(
            `No location found for "${city}". Please check the city name.`
        );
    }


    /*
     * Return first matching location.
     */

    return data.results[0];
}


/* =========================================
   GET WEATHER DATA
========================================= */

async function getWeatherData(
    latitude,
    longitude
) {

    const url =
        `${WEATHER_API}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
        `&timezone=auto`;


    const response =
        await fetch(url);


    /*
     * Handle failed HTTP response.
     */

    if (!response.ok) {

        throw new Error(
            `Weather request failed: ${response.status}`
        );
    }


    /*
     * Convert JSON response.
     */

    const data =
        await response.json();


    /*
     * Validate current weather data.
     */

    if (!data.current) {

        throw new Error(
            "Weather information is currently unavailable."
        );
    }


    return data;
}


/* =========================================
   DISPLAY WEATHER
========================================= */

function displayWeather(
    location,
    weather
) {

    const current =
        weather.current;


    /*
     * Extract weather code.
     */

    const weatherCode =
        current.weather_code;


    const weatherInfo =
        weatherCodes[weatherCode] ||
        {
            description: "Unknown Weather",
            icon: "🌤️"
        };


    /*
     * Location
     */

    document.getElementById(
        "cityName"
    ).textContent =
        location.name;


    document.getElementById(
        "locationDetails"
    ).textContent =
        `${location.admin1 || ""}, ${location.country}`;


    /*
     * Date and time
     */

    const dateTime =
        new Date(
            current.time
        );


    document.getElementById(
        "currentDate"
    ).textContent =
        dateTime.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    document.getElementById(
        "currentTime"
    ).textContent =
        dateTime.toLocaleTimeString(
            undefined,
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    /*
     * Main temperature
     */

    document.getElementById(
        "temperature"
    ).textContent =
        Math.round(
            current.temperature_2m
        );


    document.getElementById(
        "temperatureMetric"
    ).textContent =
        Math.round(
            current.temperature_2m
        );


    /*
     * Weather description
     */

    document.getElementById(
        "weatherDescription"
    ).textContent =
        weatherInfo.description;


    /*
     * Weather icons
     */

    document.getElementById(
        "mainWeatherIcon"
    ).textContent =
        weatherInfo.icon;


    document.getElementById(
        "weatherIcon"
    ).textContent =
        weatherInfo.icon;


    /*
     * Humidity
     */

    document.getElementById(
        "humidity"
    ).textContent =
        current.relative_humidity_2m;


    /*
     * Wind speed
     */

    document.getElementById(
        "windSpeed"
    ).textContent =
        Math.round(
            current.wind_speed_10m
        );


    /*
     * Precipitation
     */

    document.getElementById(
        "precipitation"
    ).textContent =
        current.precipitation;


    /*
     * Feels like temperature
     */

    document.getElementById(
        "feelsLike"
    ).textContent =
        `${Math.round(
            current.apparent_temperature
        )} °C`;


    /*
     * Wind direction
     */

    document.getElementById(
        "windDirection"
    ).textContent =
        `${current.wind_direction_10m}°`;


    /*
     * Weather code
     */

    document.getElementById(
        "weatherCode"
    ).textContent =
        weatherCode;


    /*
     * Updated time
     */

    document.getElementById(
        "updatedTime"
    ).textContent =
        current.time;


    /*
     * Show dashboard
     */

    weatherDashboard.classList.remove(
        "hidden"
    );

    welcomeMessage.classList.add(
        "hidden"
    );
}


/* =========================================
   LOADING STATE
========================================= */

function showLoading(isLoading) {

    if (isLoading) {

        loading.classList.remove(
            "hidden"
        );

        searchButton.disabled =
            true;

        searchButton.textContent =
            "Searching...";

    } else {

        loading.classList.add(
            "hidden"
        );

        searchButton.disabled =
            false;

        searchButton.textContent =
            "Search";
    }
}


/* =========================================
   ERROR HANDLING
========================================= */

function showError(message) {

    errorText.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );
}


/* =========================================
   DEFAULT CITY
========================================= */

/*
 * Load a default city when the page opens.
 */

getWeather("Bengaluru");
