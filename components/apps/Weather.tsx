'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import {
  CloudSun, Cloud, CloudRain, CloudSnow, Zap, Wind,
  Droplets, Thermometer, Eye, Search, Loader2, MapPin, Sun, CloudDrizzle, Navigation
} from 'lucide-react';

interface WeatherData {
  city: string; country: string; temp: number; feelsLike: number;
  humidity: number; wind: number; windDir: string; visibility: number;
  desc: string; weatherCode: number; uvIndex: number; pressure: number;
  forecast: { day: string; high: number; low: number; code: number }[];
  hourly: { hour: string; temp: number; code: number }[];
}

function weatherIcon(code: number, size = 16): React.ReactNode {
  if (code >= 200 && code < 300) return <Zap size={size} className="text-yellow-400" />;
  if (code >= 300 && code < 400) return <CloudDrizzle size={size} className="text-blue-300" />;
  if (code >= 500 && code < 600) return <CloudRain size={size} className="text-blue-400" />;
  if (code >= 600 && code < 700) return <CloudSnow size={size} className="text-blue-100" />;
  if (code === 800) return <Sun size={size} className="text-yellow-400" />;
  if (code > 800) return <Cloud size={size} className="text-gray-400" />;
  return <CloudSun size={size} className="text-orange-300" />;
}
function weatherEmoji(code: number): string {
  if (code >= 200 && code < 300) return '⛈️';
  if (code >= 300 && code < 400) return '🌦️';
  if (code >= 500 && code < 600) return '🌧️';
  if (code >= 600 && code < 700) return '❄️';
  if (code === 800) return '☀️';
  if (code > 800) return '⛅';
  return '🌤️';
}

// Open-Meteo API (free, no key required)
async function fetchWeather(city: string): Promise<WeatherData> {
  // First get coords via geocoding
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  const geoData = await geoRes.json();
  if (!geoData.results?.length) throw new Error(`City "${city}" not found`);
  const { latitude, longitude, name, country_code } = geoData.results[0];

  const wxRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,visibility,surface_pressure` +
    `&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=7&forecast_hours=24`
  );
  const wx = await wxRes.json();
  const c = wx.current;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const forecast = wx.daily.time.map((t: string, i: number) => ({
    day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[new Date(t).getDay()],
    high: Math.round(wx.daily.temperature_2m_max[i]),
    low: Math.round(wx.daily.temperature_2m_min[i]),
    code: wx.daily.weather_code[i],
  }));
  const now = new Date().getHours();
  const hourly = wx.hourly.time.slice(now, now + 8).map((t: string, i: number) => ({
    hour: i === 0 ? 'Now' : new Date(t).getHours() + ':00',
    temp: Math.round(wx.hourly.temperature_2m[now + i]),
    code: wx.hourly.weather_code[now + i],
  }));
  const windDirs = ['N','NE','E','SE','S','SW','W','NW'];
  const windDir = windDirs[Math.round(c.wind_direction_10m / 45) % 8];
  return {
    city: name, country: country_code?.toUpperCase() || '',
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    wind: Math.round(c.wind_speed_10m),
    windDir,
    visibility: Math.round((c.visibility || 10000) / 1000),
    desc: codeToDesc(c.weather_code),
    weatherCode: c.weather_code,
    uvIndex: 3, pressure: Math.round(c.surface_pressure),
    forecast, hourly,
  };
}

function codeToDesc(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 9) return 'Overcast';
  if (code <= 29) return 'Mist / Fog';
  if (code <= 39) return 'Drifting snow';
  if (code <= 49) return 'Drizzle';
  if (code <= 59) return 'Freezing drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 84) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 89) return 'Hail';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

const QUICK_CITIES = ['New York', 'London', 'Tokyo', 'Mumbai', 'Sydney', 'Dubai', 'Paris', 'Singapore'];

export default function Weather({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [city, setCity] = useState('New York');
  const [input, setInput] = useState('');
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = useCallback(async (q?: string) => {
    const target = (q || input.trim() || city);
    setLoading(true); setError('');
    try {
      const d = await fetchWeather(target);
      setData(d); setCity(d.city);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load weather');
    } finally { setLoading(false); setInput(''); }
  }, [input, city]);

  useEffect(() => { search('New York'); }, []);

  const tempColor = data ? (data.temp > 28 ? '#fb923c' : data.temp > 18 ? '#fbbf24' : data.temp > 5 ? '#60a5fa' : '#93c5fd') : '#fff';
  const dk = theme.mode === 'dark';
  const bg = dk ? '#0d0d1a' : '#f5f5fb';
  const txt = dk ? '#e2e8f0' : '#1e1e2e';
  const card = dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const border = dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: bg, color: txt }}>
      {/* Search bar */}
      <div className="flex gap-2 px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: card, border: `1px solid ${border}` }}>
          <Search size={13} className="opacity-30 flex-shrink-0" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') search(); }}
            placeholder="Search city…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ caretColor: theme.accent, color: txt }}
          />
        </div>
        <button onClick={() => search()} disabled={loading}
          className="px-3 py-2 rounded-xl text-white font-medium flex-shrink-0"
          style={{ background: theme.accent }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
        </button>
      </div>

      {/* Quick cities */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto flex-shrink-0">
        {QUICK_CITIES.map(c => (
          <button key={c} onClick={() => search(c)}
            className="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap flex-shrink-0 transition-colors"
            style={{ background: city === c ? `${theme.accent}25` : card, color: city === c ? theme.accent : txt + '80', border: `1px solid ${city === c ? theme.accent + '40' : border}` }}>
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: theme.accent }} />
        </div>
      )}

      {data && (
        <div className="flex-1 px-4 pb-4 flex flex-col gap-3">
          {/* Main card */}
          <div className="p-5 rounded-2xl relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${theme.accent}20 0%, rgba(255,255,255,0.03) 100%)`, border: `1px solid ${theme.accent}20` }}>
            <div className="absolute top-3 right-4 text-5xl opacity-90">
              {weatherEmoji(data.weatherCode)}
            </div>
            <div className="flex items-start gap-1.5 mb-1">
              <MapPin size={12} className="mt-0.5 opacity-50" />
              <p className="text-sm font-semibold">{data.city}, {data.country}</p>
            </div>
            <p className="text-xs opacity-50 mb-3">{data.desc}</p>
            <div className="flex items-end gap-3">
              <p className="font-light" style={{ fontSize: 52, lineHeight: 1, color: tempColor }}>{data.temp}°C</p>
              <div className="pb-1">
                <p className="text-xs opacity-50">Feels like</p>
                <p className="text-base font-semibold">{data.feelsLike}°C</p>
              </div>
            </div>
          </div>

          {/* Hourly forecast */}
          <div>
            <p className="text-[10px] font-semibold opacity-40 uppercase tracking-widest mb-2">Hourly</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.hourly.map((h, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 p-2.5 rounded-xl" style={{ background: card, border: `1px solid ${border}`, minWidth: 52 }}>
                  <p className="text-[9px] opacity-40">{h.hour}</p>
                  {weatherIcon(h.code, 14)}
                  <p className="text-xs font-bold">{h.temp}°</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Droplets size={13} />, label: 'Humidity', value: `${data.humidity}%` },
              { icon: <Wind size={13} />, label: 'Wind', value: `${data.wind} km/h ${data.windDir}` },
              { icon: <Eye size={13} />, label: 'Visibility', value: `${data.visibility} km` },
              { icon: <Thermometer size={13} />, label: 'Pressure', value: `${data.pressure} hPa` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: card, border: `1px solid ${border}` }}>
                <span style={{ color: theme.accent }}>{icon}</span>
                <div>
                  <p className="text-[9px] opacity-40">{label}</p>
                  <p className="text-xs font-semibold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 7-day forecast */}
          <div>
            <p className="text-[10px] font-semibold opacity-40 uppercase tracking-widest mb-2">7-Day Forecast</p>
            <div className="flex flex-col gap-1">
              {data.forecast.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/04 transition-colors" style={{ background: i === 0 ? `${theme.accent}08` : 'transparent', border: `1px solid ${i === 0 ? theme.accent + '20' : 'transparent'}` }}>
                  <p className="text-xs w-16 font-medium" style={{ color: i === 0 ? theme.accent : txt + '80' }}>{f.day}</p>
                  <div className="w-4">{weatherIcon(f.code, 14)}</div>
                  <div className="flex-1 h-1 rounded-full overflow-hidden mx-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, #60a5fa, #fb923c)`, width: `${Math.min(100, ((f.high - f.low) / 20) * 100)}%` }} />
                  </div>
                  <p className="text-xs opacity-40 w-8 text-right">{f.low}°</p>
                  <p className="text-xs font-bold w-8 text-right">{f.high}°</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] opacity-20 text-center">Powered by Open-Meteo (free, no key required)</p>
        </div>
      )}
    </div>
  );
}
