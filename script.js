// Weather App JavaScript
class WeatherApp {
    constructor() {
        this.baseUrl = 'https://api.open-meteo.com/v1';
        
        // DOM elements
        this.cityInput = document.getElementById('city-input');
        this.searchBtn = document.getElementById('search-btn');
        this.weatherInfo = document.getElementById('weather-info');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        
        // Weather display elements
        this.cityElement = document.getElementById('city');
        this.dateElement = document.getElementById('date');
        this.tempElement = document.getElementById('temp');
        this.descriptionElement = document.getElementById('description');
        this.weatherIconElement = document.getElementById('weather-icon');
        this.feelsLikeElement = document.getElementById('feels-like');
        this.humidityElement = document.getElementById('humidity');
        this.windSpeedElement = document.getElementById('wind-speed');
        this.visibilityElement = document.getElementById('visibility');
        this.forecastContainer = document.getElementById('forecast-container');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        
        // Do NOT load any city by default
        this.weatherInfo.classList.remove('active');
        this.loading.classList.remove('active');
        this.error.classList.remove('active');
    }
    
    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }
    
    handleSearch() {
        const city = this.cityInput.value.trim();
        if (city) {
            this.getWeatherByCity(city);
        }
    }
    
    async getWeatherByCity(city) {
        this.showLoading();
        
        try {
            // First get coordinates for the city
            const coordinates = await this.getCityCoordinates(city);
            
            // Then get weather data
            const weatherData = await this.fetchWeatherData(coordinates.lat, coordinates.lon);
            
            this.displayWeather(city, weatherData);
            this.hideLoading();
            this.hideError();
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError('City not found. Please try again.');
            this.hideLoading();
        }
    }
    
    async getCityCoordinates(city) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('City not found');
        }
        
        return {
            lat: data.results[0].latitude,
            lon: data.results[0].longitude
        };
    }
    
    async fetchWeatherData(lat, lon) {
        const url = `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        
        return await response.json();
    }
    
    displayWeather(city, weatherData) {
        const current = weatherData.current;
        
        // Update current weather
        this.cityElement.textContent = city;
        this.tempElement.textContent = Math.round(current.temperature_2m);
        this.descriptionElement.textContent = this.getWeatherDescription(current.weather_code);
        this.feelsLikeElement.textContent = Math.round(current.apparent_temperature) + '°C';
        this.humidityElement.textContent = current.relative_humidity_2m + '%';
        this.windSpeedElement.textContent = Math.round(current.wind_speed_10m * 3.6) + ' km/h';
        this.visibilityElement.textContent = (current.visibility / 1000) + ' km';
        
        // Update weather icon
        this.updateWeatherIcon(current.weather_code);
        
        // Update forecast
        this.displayForecast(weatherData.daily);
        
        // Show weather info
        this.weatherInfo.classList.add('active');
    }
    
    getWeatherDescription(weatherCode) {
        const descriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        
        return descriptions[weatherCode] || 'Unknown';
    }
    
    updateWeatherIcon(weatherCode) {
        const iconMap = {
            0: 'fas fa-sun',
            1: 'fas fa-sun',
            2: 'fas fa-cloud-sun',
            3: 'fas fa-cloud',
            45: 'fas fa-smog',
            48: 'fas fa-smog',
            51: 'fas fa-cloud-drizzle',
            53: 'fas fa-cloud-drizzle',
            55: 'fas fa-cloud-drizzle',
            61: 'fas fa-cloud-rain',
            63: 'fas fa-cloud-rain',
            65: 'fas fa-cloud-showers-heavy',
            71: 'fas fa-snowflake',
            73: 'fas fa-snowflake',
            75: 'fas fa-snowflake',
            77: 'fas fa-snowflake',
            80: 'fas fa-cloud-rain',
            81: 'fas fa-cloud-showers-heavy',
            82: 'fas fa-cloud-showers-heavy',
            85: 'fas fa-snowflake',
            86: 'fas fa-snowflake',
            95: 'fas fa-bolt',
            96: 'fas fa-bolt',
            99: 'fas fa-bolt'
        };
        
        this.weatherIconElement.className = iconMap[weatherCode] || 'fas fa-cloud';
    }
    
    displayForecast(dailyData) {
        this.forecastContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            const date = new Date(dailyData.time[i]);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(dailyData.temperature_2m_max[i]);
            const weatherCode = dailyData.weather_code[i];
            
            forecastItem.innerHTML = `
                <div class="day">${dayName}</div>
                <div class="forecast-icon">${this.getForecastIcon(weatherCode)}</div>
                <div class="forecast-temp">${temp}°C</div>
            `;
            
            this.forecastContainer.appendChild(forecastItem);
        }
    }
    
    getForecastIcon(weatherCode) {
        const iconMap = {
            0: '☀️',
            1: '☀️',
            2: '⛅',
            3: '☁️',
            45: '🌫️',
            48: '🌫️',
            51: '🌦️',
            53: '🌦️',
            55: '🌦️',
            61: '🌧️',
            63: '🌧️',
            65: '🌧️',
            71: '❄️',
            73: '❄️',
            75: '❄️',
            77: '❄️',
            80: '🌧️',
            81: '🌧️',
            82: '🌧️',
            85: '❄️',
            86: '❄️',
            95: '⛈️',
            96: '⛈️',
            99: '⛈️'
        };
        
        return iconMap[weatherCode] || '☁️';
    }
    
    updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        this.dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
    
    showLoading() {
        this.loading.classList.add('active');
        this.weatherInfo.classList.remove('active');
        this.error.classList.remove('active');
    }
    
    hideLoading() {
        this.loading.classList.remove('active');
    }
    
    showError(message) {
        document.getElementById('error-message').textContent = message;
        this.error.classList.add('active');
        this.weatherInfo.classList.remove('active');
    }
    
    hideError() {
        this.error.classList.remove('active');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
}); 