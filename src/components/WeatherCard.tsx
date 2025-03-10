import { motion } from 'framer-motion';
import { FaCloudSun, FaCloudRain, FaSun, FaCloud, FaSnowflake } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const WeatherCard = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [weather, setWeather] = useState({ temp: 18, humidity: 65, condition: 'clear' });
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const API_KEY = '97f10cfebb1d5ca73174cf0ac588290d';

  useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Dakar&appid=${API_KEY}&units=metric`)
      .then(res => res.json())
      .then(data => {
        if (data.cod === 200) {
          setWeather({
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            condition: data.weather[0].main.toLowerCase(),
          });
        } else {
          console.error('Erreur API:', data.message);
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données météo:', error);
      });
  }, [API_KEY]);

  // Typage simple pour condition avec les valeurs possibles de l'API
  const getWeatherIcon = (condition: 'clear' | 'clouds' | 'rain' | 'snow' | string) => {
    switch (condition) {
      case 'clear':
        return <FaSun className="text-yellow-400" />; 
      case 'clouds':
        return <FaCloud className="text-gray-400" />; 
      case 'rain':
        return <FaCloudRain className="text-blue-500" />; 
      case 'snow':
        return <FaSnowflake className="text-cyan-300" />; 
      default:
        return <FaCloudSun className="text-blue-400" />; 
    }
  };

  return (
    <motion.div
      className={`relative p-6 rounded-2xl flex items-center space-x-5 shadow-xl border ${
        isDarkMode
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-green-100 border-green-400' 
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)' }}
    >
      <div
        className={`absolute inset-0 opacity-20 ${
          isDarkMode ? 'bg-gray-700' : 'bg-green-300'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Icône météo */}
      <motion.div
        initial={{ scale: 0.8, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 text-4xl"
      >
        {getWeatherIcon(weather.condition)}
      </motion.div>

      {/* Informations avec couleurs forcées */}
      <div className="relative z-10">
        <motion.p
          className={`text-xl font-bold tracking-wide ${
            isDarkMode ? 'text-white' : 'text-green-900'
          }`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Dakar - {currentDate}
        </motion.p>
        <motion.div
          className="flex items-center space-x-3 text-base"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <span className={`${isDarkMode ? 'text-yellow-300' : 'text-green-700'} font-semibold`}>
            {weather.temp}°C
          </span>
          <span className={`${isDarkMode ? 'text-gray-400' : 'text-green-600'}`}>|</span>
          <span className={`${isDarkMode ? 'text-cyan-200' : 'text-green-800'} font-medium`}>
            Humidité: {weather.humidity}%
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;