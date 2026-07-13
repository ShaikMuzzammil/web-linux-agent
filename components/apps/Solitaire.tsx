'use client';
import { useState, useCallback } from 'react';
import { useOSStore } from '@/hooks/useOSStore';
import { RotateCcw, Trophy } from 'lucide-react';
const SUITS=['♠','♥','♦','♣'];const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
type Card={suit:string;rank:string;faceUp:boolean};
function makeAndShuffle():Card[]{const d=SUITS.flatMap(s=>RANKS.map(r=>({suit:s,rank:r,faceUp:false})));for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function rankVal(r:string){return r==='A'?1:r==='J'?11:r==='Q'?12:r==='K'?13:parseInt(r)||0;}
function isRed(s:string){return s==='♥'||s==='♦';}
function deal(deck:Card[]):{tableau:Card[][];stock:Card[];foundations:Card[][]}{
  const d=[...deck];const t:Card[][]=Array.from({length:7},(_,i)=>Array.from({length:i+1},(_,j)=>({...d.shift()!,faceUp:j===i})));
  return{tableau:t,stock:d,foundations:[[],[],[],[]]};
}
export default function Solitaire({windowId}:{windowId:string}){
  const {theme}=useOSStore();
  const [deck]=useState(makeAndShuffle);
  const [{tableau,stock,foundations},setState]=useState(()=>deal(makeAndShuffle()));
  const [drawn,setDrawn]=useState<Card[]>([]);
  const [sel,setSel]=useState<{pile:string;idx:number}|null>(null);
  const [score,setScore]=useState(0);
  const reset=()=>{setState(deal(makeAndShuffle()));setDrawn([]);setSel(null);setScore(0);};
  const draw=()=>{
    if(stock.length===0){setState(s=>({...s,stock:[...drawn].reverse().map(c=>({...c,faceUp:false})),foundations:s.foundations}));setDrawn([]);return;}
    setState(s=>{const ns=[...s.stock];const c={...ns.pop()!,faceUp:true};return{...s,stock:ns};});
    setDrawn(d=>[...d,{...stock[stock.length-1],faceUp:true}]);
    setState(s=>({...s,stock:s.stock.slice(0,-1)}));
  };
  const canStack=(top:Card,bot:Card)=>rankVal(bot.rank)===rankVal(top.rank)+1&&isRed(bot.suit)!==isRed(top.suit);
  const canFoundation=(card:Card,pile:Card[])=>{
    if(pile.length===0)return rankVal(card.rank)===1;
    const top=pile[pile.length-1];return top.suit===card.suit&&rankVal(card.rank)===rankVal(top.rank)+1;
  };
  const moveToFoundation=(card:Card,from:string)=>{
    const fi=foundations.findIndex(p=>canFoundation(card,p));
    if(fi<0)return false;
    const nf=foundations.map((p,i)=>i===fi?[...p,card]:p);
    if(from.startsWith('t')){const ti=parseInt(from[1]);const nt=tableau.map((p,i)=>i===ti?p.slice(0,-1).map((c,j,a)=>j===a.length-1?{...c,faceUp:true}:c):p);setState(s=>({...s,tableau:nt,foundations:nf}));}
    else setDrawn(d=>{const nd=d.slice(0,-1);setState(s=>({...s,foundations:nf}));return nd;});
    setScore(s=>s+10);return true;
  };
  const Card2D=({card,small}:{card:Card;small?:boolean})=>(
    <div className="rounded flex items-center justify-center font-bold select-none" style={{width:small?30:48,height:small?42:64,background:card.faceUp?'#fff':'#1e3a5f',border:'1px solid rgba(0,0,0,0.2)',color:isRed(card.suit)?'#dc2626':'#111',fontSize:small?9:11,flexShrink:0,cursor:'pointer',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}>
      {card.faceUp?<><div className="text-left leading-tight px-0.5">{card.rank}{card.suit}</div></>:<div style={{background:'repeating-linear-gradient(45deg,#1e3a5f,#1e3a5f 3px,#2a4f7c 3px,#2a4f7c 6px)',width:'100%',height:'100%',borderRadius:3}}/>}
    </div>
  );
  const won=foundations.every(f=>f.length===13);
  return(
    <div className="flex flex-col h-full p-2 gap-2 overflow-hidden" style={{background:theme.mode==='dark'?'#0a4a0a':'#1a5c1a',userSelect:'none'}}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex gap-1">
          <div className="rounded border-2 border-white/20 cursor-pointer flex items-center justify-center" style={{width:48,height:64,background:'rgba(255,255,255,0.1)'}} onClick={draw}>
            {stock.length>0?<div style={{background:'repeating-linear-gradient(45deg,#1e3a5f,#1e3a5f 3px,#2a4f7c 3px,#2a4f7c 6px)',width:46,height:62,borderRadius:3}}/>:<span className="text-white/30 text-xs">↺</span>}
          </div>
          {drawn.length>0&&<div onClick={()=>moveToFoundation(drawn[drawn.length-1],'d')}><Card2D card={drawn[drawn.length-1]}/></div>}
        </div>
        <div className="flex-1"/>
        <div className="flex gap-1">
          {foundations.map((f,i)=>(
            <div key={i} className="rounded border-2 border-white/20 flex items-center justify-center" style={{width:48,height:64,background:'rgba(255,255,255,0.05)'}}>
              {f.length>0?<Card2D card={f[f.length-1]}/>:<span className="text-white/20 text-lg">{SUITS[i]}</span>}
            </div>
          ))}
        </div>
        <div className="text-white text-xs opacity-60">Score: {score}</div>
        <button onClick={reset} className="p-1.5 rounded text-white/60 hover:text-white"><RotateCcw size={14}/></button>
      </div>
      {won&&<div className="flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-white" style={{background:'rgba(255,215,0,0.3)'}}><Trophy size={16}/>You Won! 🎉</div>}
      <div className="flex gap-1 flex-1 overflow-hidden">
        {tableau.map((pile,pi)=>(
          <div key={pi} className="flex-1 relative">
            <div className="rounded border-2 border-white/10" style={{width:'100%',minHeight:64,background:'rgba(255,255,255,0.05)'}}/>
            {pile.map((card,ci)=>(
              <div key={ci} className="absolute w-full" style={{top:ci*18}} onClick={()=>{if(!card.faceUp)return;if(ci===pile.length-1)moveToFoundation(card,`t${pi}`);}}> 
                <Card2D card={card}/>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
