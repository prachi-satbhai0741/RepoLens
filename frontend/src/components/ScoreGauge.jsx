import React from 'react'
import styles from './ScoreGauge.module.css'

function getColor(score) {
  if (score >= 80) return '#3fb950'
  if (score >= 60) return '#d29922'
  return '#f85149'
}

export default function ScoreGauge({ score, size = 'large' }) {
  const radius = size === 'large' ? 54 : 28
  const stroke = size === 'large' ? 8 : 5
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const dim = (radius + stroke) * 2
  const color = getColor(score)

  return (
    <div className={`${styles.wrapper} ${size === 'large' ? styles.large : styles.small}`}>
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="#21262d"
          strokeWidth={stroke}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        />
      </svg>
      <span className={styles.label} style={{ color }}>
        {score}
      </span>
    </div>
  )
}