import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ScoreGauge from '../components/ScoreGauge.jsx'
import TechBadge from '../components/TechBadge.jsx'
import FileTree from '../components/FileTree.jsx'
import IssueCard from '../components/IssueCard.jsx'
import styles from './Results.module.css'

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state || !state.data) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>No results found. <span className={styles.link} onClick={() => navigate('/')}>Go back</span></p>
      </div>
    )
  }

  const { data, repoUrl } = state

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>Back</button>
        <span className={styles.repoUrl}>{repoUrl}</span>
        <button className={styles.dashBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
      </div>

      <div className={styles.scoreSection}>
        <ScoreGauge score={data.overallScore || 0} size="large" />
        <div className={styles.scoreMeta}>
          <h2 className={styles.repoTitle}>{repoUrl?.split('/').slice(-2).join('/')}</h2>
          <p className={styles.scoreLabel}>Overall Score</p>
          <div className={styles.subScores}>
            {data.scores && Object.entries(data.scores).map(([key, val]) => (
              <div key={key} className={styles.subScore}>
                <span className={styles.subScoreKey}>{key}</span>
                <span className={styles.subScoreVal}>{val}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.techStack && data.techStack.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Tech Stack</h3>
          <div className={styles.techRow}>
            {data.techStack.map((t) => <TechBadge key={t} name={t} />)}
          </div>
        </div>
      )}

      {data.summary && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Summary</h3>
          <p className={styles.summary}>{data.summary}</p>
        </div>
      )}

      {data.issues && data.issues.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Issues</h3>
          <div className={styles.issues}>
            {data.issues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
          </div>
        </div>
      )}

      {data.fileTree && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>File Structure</h3>
          <FileTree tree={data.fileTree} />
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.reviewBtn}
          onClick={() => navigate('/review', { state: { data, repoUrl } })}
        >
          Get AI Review
        </button>
      </div>
    </div>
  )
}