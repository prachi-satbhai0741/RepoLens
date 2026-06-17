import React from 'react'
import styles from './TechBadge.module.css'

const colorMap = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  go: '#00add8',
  rust: '#dea584',
  java: '#ed8b00',
  docker: '#2496ed',
  kubernetes: '#326ce5',
  react: '#61dafb',
  node: '#339933',
  default: '#8b949e',
}

export default function TechBadge({ name }) {
  const color = colorMap[name?.toLowerCase()] || colorMap.default
  return (
    <span className={styles.badge} style={{ borderColor: color, color }}>
      {name}
    </span>
  )
}