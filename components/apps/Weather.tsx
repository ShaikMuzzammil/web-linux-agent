'use client';
import { useState, useEffect } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { CloudSun, Cloud, CloudRain, Wind, Droplets, Thermometer, Eye, Search, Loader2 } from 'lucide-react';
const MOCK = (city:string) => ({
  city, country:'US', temp:Math.round(15+Math.random()*20), feels:Math.round(12+Math.random()*20),
  humidity:Math.round(40+Math.random()*50), wind:Math.round(5+Math.random()*30), visibility:10,
  desc:['Partly cloudy','Sunny','Overcast','Light rain','Clear skies'][Math.floor(Math.random()*5)],
  forecast:Array.from({length:7},(_,i)=>({day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][(new Date().getDay()+i)%7],high:Math.round(18+Math.random()*12),low:Math.round(8+Math.random()*10),icon:['☀️','⛅','🌧️','🌤️'][Math.floor(Math.random()*4)]}))
});
export default function Weather({ windowId }: { windowId: string }) {
  const { theme } = useOSStore();
  const [city, setCity] = useState('New York');
  const [input, setInput] = useState('');
  const [data, setData] = useState(MOCK('New York'));
  const [loading, setLoading] = useState(false);
  const search = () => {
    const c = input.trim() || city;
    setLoading(true); setTimeout(()=>{ setData(MOCK(c)); setCity(c); setLoading(false); }, 800);
    setInput('');
  };
  const tempColor = data.temp > 25 ? '#fb923c' : data.temp > 15 ? '#fbbf24' : '#60a5fa';
  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-y-auto" style={{background:theme.mode==='dark'?'#0d0d1a':'#f5f5fb',color:theme.mode==='dark'?'#e2e8f0':'#1e1e2e'}}>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')search();}} placeholder="Search city…" className="flex-1 px-3 py-2 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.07)',caretColor:theme.accent}} />
        <button onClick={search} className="px-3 py-2 rounded-xl text-white" style={{background:theme.accent}}>{loading?<Loader2 size={16} className="animate-spin"/>:<Search size={16}/>}</button>
      </div>
      {!loading && (
        <>
          <div className="p-5 rounded-2xl flex items-center gap-4" style={{background:`linear-gradient(135deg, ${theme.accent}20, rgba(255,255,255,0.04))`,border:`1px solid ${theme.accent}20`}}>
            <div className="text-5xl">⛅</div>
            <div className="flex-1">
              <p className="text-lg font-bold">{data.city}</p>
              <p className="text-sm opacity-50">{data.desc}</p>
              <p className="text-4xl font-light mt-1" style={{color:tempColor}}>{data.temp}°C</p>
              <p className="text-xs opacity-40">Feels like {data.feels}°C</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              {icon:<Droplets size={14}/>,label:'Humidity',value:`${data.humidity}%`},
              {icon:<Wind size={14}/>,label:'Wind',value:`${data.wind} km/h`},
              {icon:<Thermometer size={14}/>,label:'Feels Like',value:`${data.feels}°C`},
              {icon:<Eye size={14}/>,label:'Visibility',value:`${data.visibility} km`},
            ].map(({icon,label,value})=>(
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{background:'rgba(255,255,255,0.04)'}}>
                <span className="opacity-40">{icon}</span>
                <div><p className="text-[10px] opacity-40">{label}</p><p className="text-sm font-semibold">{value}</p></div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold opacity-40 mb-2 uppercase tracking-wider">7-Day Forecast</p>
            <div className="flex gap-1">
              {data.forecast.map((f,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl text-center" style={{background:'rgba(255,255,255,0.04)'}}>
                  <p className="text-[9px] opacity-40">{f.day}</p>
                  <p className="text-base">{f.icon}</p>
                  <p className="text-[10px] font-bold">{f.high}°</p>
                  <p className="text-[9px] opacity-40">{f.low}°</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
