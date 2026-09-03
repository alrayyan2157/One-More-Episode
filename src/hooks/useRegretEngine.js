// src/hooks/useRegretEngine.js
// The Mathematical Regret Formula Engine — exact spec implementation

import { useMemo } from 'react';

export function useRegretEngine({ episodes, runtime, wakeUpTime, stakes, cliffhanger, now }) {
  return useMemo(() => {
    // 1. Total binge in minutes
    const totalBingeMinutes = episodes * runtime;

    // 2. Time remaining until wake-up (in minutes)
    const [wakeH, wakeM] = wakeUpTime.split(':').map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const wakeMinutes = wakeH * 60 + wakeM;
    const minutesUntilWake = wakeMinutes > nowMinutes
      ? wakeMinutes - nowMinutes
      : (wakeMinutes + 1440) - nowMinutes;
    const timeRemaining = Math.max(15, minutesUntilWake - totalBingeMinutes - 15); // 15 min fall-asleep overhead

    // 3. Sleep Deficit Ratio
    const sleepDeficitRatio = totalBingeMinutes / (totalBingeMinutes + timeRemaining);

    // 4. Base Regret
    const baseRegret = Math.pow(sleepDeficitRatio, 1.35) * 100;

    // 5. Stakes Multiplier
    const stakesMap = { 0: 0.82, 1: 1.00, 2: 1.48 };
    const stakesMultiplier = stakesMap[stakes] ?? 1.0;

    // 6. Cliffhanger Coefficient bonus
    const cliffhangerBonusMap = { 0: 0, 1: 4.25, 2: 11.8 };
    const cliffhangerBonus = cliffhangerBonusMap[cliffhanger] ?? 0;

    // 7. Micro-jitter — deterministic, based on exact minute + runtime
    const microJitter = (now.getSeconds() % 60 * 0.001) + (runtime % 7) * 0.137;

    // 8. Final Regret
    const rawRegret = baseRegret * stakesMultiplier + cliffhangerBonus + microJitter;
    const finalRegret = Math.min(99.999, Math.max(4.105, rawRegret));

    // Projected sleep hours
    const finishTime = new Date(now.getTime() + totalBingeMinutes * 60000);
    const sleepTime = new Date(finishTime.getTime() + 15 * 60000);
    let wakeDate = new Date(sleepTime);
    wakeDate.setHours(wakeH, wakeM, 0, 0);
    if (wakeDate <= sleepTime) wakeDate.setDate(wakeDate.getDate() + 1);
    const sleepHours = Math.max(0, (wakeDate - sleepTime) / 3600000);

    // Color thresholds
    let accentColor = '#00F5D4'; // cyan
    if (finalRegret > 50) accentColor = '#F5A623'; // amber
    if (finalRegret > 75) accentColor = '#FF2A54'; // crimson

    // Tomorrow You message tier
    let txTier = 0;
    if (finalRegret >= 40) txTier = 1;
    if (finalRegret >= 75) txTier = 2;
    if (finalRegret >= 95) txTier = 3;

    return {
      finalRegret,
      sleepHours,
      finishTime,
      sleepTime,
      accentColor,
      txTier,
      totalBingeMinutes,
      sleepDeficitRatio,
    };
  }, [episodes, runtime, wakeUpTime, stakes, cliffhanger, now]);
}
