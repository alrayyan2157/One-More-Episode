import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [wakeUpTime, setWakeUpTime] = useState('07:00')
  const [episodeLength, setEpisodeLength] = useState(45)
  const [episodes, setEpisodes] = useState(1)
  const [fallAsleepTime, setFallAsleepTime] = useState(15)
  const [now, setNow] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const calculateStats = () => {
    const watchDurationMs = episodes * episodeLength * 60000
    const fallAsleepMs = fallAsleepTime * 60000
    
    const finishTime = new Date(now.getTime() + watchDurationMs)
    const sleepTime = new Date(finishTime.getTime() + fallAsleepMs)

    // Calculate wake up time date
    const [wakeHour, wakeMinute] = wakeUpTime.split(':').map(Number)
    let wakeDate = new Date(sleepTime)
    wakeDate.setHours(wakeHour, wakeMinute, 0, 0)
    
    // If wake time is before sleep time, it means they wake up the next day
    if (wakeDate < sleepTime) {
      wakeDate.setDate(wakeDate.getDate() + 1)
    }

    const totalSleepMs = wakeDate.getTime() - sleepTime.getTime()
    const totalSleepHours = totalSleepMs / (1000 * 60 * 60)

    let regretLevel = 'None'
    let regretColor = '#4ade80' // green
    let message = 'You will be well rested!'

    if (totalSleepHours < 4) {
      regretLevel = 'Extreme'
      regretColor = '#ef4444' // red
      message = 'You will be a zombie tomorrow. Go to sleep!'
    } else if (totalSleepHours < 6) {
      regretLevel = 'High'
      regretColor = '#f97316' // orange
      message = 'Coffee will be your best friend tomorrow.'
    } else if (totalSleepHours < 7.5) {
      regretLevel = 'Mild'
      regretColor = '#eab308' // yellow
      message = 'You might feel a bit groggy, but manageable.'
    }

    return {
      finishTime: finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sleepTime: sleepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalSleepHours: totalSleepHours.toFixed(1),
      regretLevel,
      regretColor,
      message
    }
  }

  const stats = calculateStats()

  return (
    <div className="container">
      <header>
        <h1>📺 One More Episode...</h1>
        <p className="subtitle">The Sleep Regret Calculator</p>
      </header>

      <main>
        <div className="card inputs-card">
          <h2>Configure Your Binge</h2>
          
          <div className="input-group">
            <label>Current Time</label>
            <div className="current-time">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>

          <div className="input-group">
            <label htmlFor="wakeUpTime">I need to wake up at</label>
            <input 
              type="time" 
              id="wakeUpTime" 
              value={wakeUpTime} 
              onChange={(e) => setWakeUpTime(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label htmlFor="episodeLength">Episode length (minutes)</label>
            <input 
              type="number" 
              id="episodeLength" 
              min="1" 
              value={episodeLength} 
              onChange={(e) => setEpisodeLength(Number(e.target.value))} 
            />
          </div>

          <div className="input-group">
            <label htmlFor="episodes">"Just" how many episodes?</label>
            <input 
              type="number" 
              id="episodes" 
              min="1" 
              value={episodes} 
              onChange={(e) => setEpisodes(Number(e.target.value))} 
            />
          </div>

          <div className="input-group">
            <label htmlFor="fallAsleepTime">Time to fall asleep (minutes)</label>
            <input 
              type="number" 
              id="fallAsleepTime" 
              min="0" 
              value={fallAsleepTime} 
              onChange={(e) => setFallAsleepTime(Number(e.target.value))} 
            />
          </div>
        </div>

        <div className="card results-card" style={{ borderTop: `4px solid ${stats.regretColor}` }}>
          <h2>The Brutal Truth</h2>
          
          <div className="result-item">
            <span>You'll finish watching at:</span>
            <strong>{stats.finishTime}</strong>
          </div>
          
          <div className="result-item">
            <span>You'll actually fall asleep at:</span>
            <strong>{stats.sleepTime}</strong>
          </div>
          
          <div className="result-item highlight">
            <span>Total sleep:</span>
            <strong style={{ color: stats.regretColor }}>{stats.totalSleepHours} hours</strong>
          </div>

          <div className="regret-meter">
            <div className="regret-label">Regret Level:</div>
            <div className="regret-badge" style={{ backgroundColor: stats.regretColor }}>
              {stats.regretLevel}
            </div>
          </div>
          
          <p className="message">{stats.message}</p>
        </div>
      </main>
    </div>
  )
}

export default App
