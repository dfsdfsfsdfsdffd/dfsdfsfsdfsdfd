'use client';
import { useState, useEffect } from 'react';

export default function Game() {
  const [hp, setHp] = useState(100);
  const [gold, setGold] = useState(0);
  const [logs, setLogs] = useState(["Welcome to the realm, traveler."]);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5));

  const fight = () => {
    const damage = Math.floor(Math.random() * 20);
    const loot = Math.floor(Math.random() * 10);
    if (hp - damage <= 0) {
      setHp(100); setGold(0);
      addLog("💀 You died! Stats reset.");
    } else {
      setHp(hp - damage);
      setGold(gold + loot);
      addLog(`⚔️ Fought a monster! Took ${damage} dmg, found ${loot} gold.`);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 font-mono">
      {/* HUD */}
      <div className="flex justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 uppercase">Health</span>
          <span className="text-xl font-bold text-red-500">{hp}%</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-zinc-500 uppercase">Gold</span>
          <span className="text-xl font-bold text-yellow-500">{gold}g</span>
        </div>
      </div>

      {/* ACTION LOG */}
      <div className="h-48 bg-zinc-950 border border-zinc-900 p-4 rounded-xl mb-6 overflow-y-auto">
        {logs.map((log, i) => (
          <p key={i} className={i === 0 ? "text-indigo-400" : "text-zinc-600"}>{log}</p>
        ))}
      </div>

      {/* BUTTONS */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={fight} className="p-8 bg-zinc-900 border border-indigo-900/50 rounded-2xl hover:bg-indigo-900/20 transition-all active:scale-95">
          <span className="block text-2xl mb-2">⚔️</span>
          <span className="font-bold">EXPLORE</span>
        </button>
        <button onClick={() => setHp(100)} className="p-8 bg-zinc-900 border border-green-900/50 rounded-2xl hover:bg-green-900/20 transition-all active:scale-95">
          <span className="block text-2xl mb-2">⛺</span>
          <span className="font-bold">REST</span>
        </button>
      </div>
    </main>
  );
}