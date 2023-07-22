import axios from 'axios'

export const getWeather = (lat, lon, timezone) => {
    return axios.get(
        "https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime",
        {
            params: {
                latitude: lat,
                longitude: lon,
                timezone,
            },
        }
        )
        .then(({ data }) => {
            return {
                current: parseCurrentWeather(data),
                daily: parseDailyWeather(data),
                //hourly: parseHourlyWeather(data),
            }
        })
}

const parseDailyWeather = ({ daily }) => {
    return daily.time.map((time, index) => {
        return {
            timestamp: time * 1000,
            iconCode: daily.weathercode[index],
            maxTemp: Math.round(daily.temperature_2m_max[index])
        }
    })
}

const parseHourlyWeather = ({hourly, current_weather}) => {
    return hourly.time.map((time, index) => {
        return {
            timestamp: time * 1000,
            iconCode: hourly.weatherCode[index],
            temp: Math.round(hourly.temperature_2m[index]),
            feelsLike: Math.round(hourly.apparent_temperature[index]),
            windSpeed: Math.round(hourly.windSpeed_10m[index]),
            precip: Math.round(hourly.precipitation[index] * 100) / 100,
        }
    }).filter(({ timestamp }) => timestamp >= current_weather.time * 1000)
}

const parseCurrentWeather = ({ current_weather, daily}) => {
    const { 
        temperature: currentTemp,
        windSpeed: windSpeed,
        weatherCode: iconCode,
     } = current_weather
     
     const {
        temperature_2m_max: [maxTemp],
        temperature_2m_min: [minTemp],
        apparent_temperature_max: [maxFeelsLike],
        temperature_2m_min: [minFeelsLike],
        precipitation_sum: [precip],

     } = daily

     //const maxTemp = daily.temperature_2m_max[0];


    return {
        currentTemp: Math.round(currentTemp),
        highTemp: Math.round(maxTemp),
        lowTemp: Math.round(minTemp),
        highFeelsLike: Math.round(maxFeelsLike),
        lowFeelsLike: Math.round(minFeelsLike),
        windSpeed: Math.round(windSpeed),
        precip: Math.round(precip * 100) / 100,
        iconCode,
    }
}

