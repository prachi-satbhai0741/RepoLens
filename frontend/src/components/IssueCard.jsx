import React from 'react'
import styles from './IssueCard.module.css'

const severityConfig = {
  high: { color: '#f85149', label: 'High' },
  medium: { color: '#d29922', label: 'Medium' },
  low: { color: '#3fb950', label: 'Low' },
  info: { color: '#58a6ff', label: 'Info' },
}

export default function IssueCard({ issue }) {
  const config = severityConfig[issue.severity?.toLowerCase()] || severityConfig.info
  return (
    <div className={styles.card} style={{ borderLeftColor: config.color }}>
      <div className={styles.header}>
        <span className={styles.title}>{issue.title}</span>
        <span className={styles.badge} style={{ color: config.color, borderColor: config.color }}>
          {config.label}
        </span>
      </div>
      {issue.description && <p className={styles.desc}>{issue.description}</p>}
      {issue.file && <span className={styles.file}>{issue.file}</span>}
    </div>
  )
}