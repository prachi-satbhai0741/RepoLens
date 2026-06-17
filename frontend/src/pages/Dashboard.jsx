import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreGauge from '../components/ScoreGauge.jsx'
import TechBadge from '../components/TechBadge.jsx'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => {
        setHistory(data.history || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          + New Analysis
        </button>
      </div>
      {loading ? (
        <p className={styles.loading}>Loading history...</p>
      ) : history.length === 0 ? (
        <p className={styles.empty}>No repositories analyzed yet.</p>
      ) : (
        <div className={styles.grid}>
          {history.map((item, i) => (
            <div
              key={i}
              className={styles.card}
              onClick={() => navigate('/results', { state: { data: item, repoUrl: item.repoUrl } })}
            >
              <div className={styles.cardHeader}>
                <span className={styles.repoName}>{item.repoUrl?.split('/').slice(-2).join('/')}</span>
                <ScoreGauge score={item.overallScore || 0} size="small" />
              </div>
              <div className={styles.techs}>
                {(item.techStack || []).slice(0, 5).map((t) => (
                  <TechBadge key={t} name={t} />
                ))}
              </div>
              <p className={styles.date}>{item.analyzedAt ? new Date(item.analyzedAt).toLocaleDateString() : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}