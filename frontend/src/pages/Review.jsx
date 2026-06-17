import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './Review.module.css'

export default function Review() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!state || !state.repoUrl) {
      navigate('/')
      return
    }
    fetch('/api/analyze/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl: state.repoUrl, analysisData: state.data }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setReview(d.review || '')
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>Back</button>
        <h1 className={styles.title}>AI Code Review</h1>
      </div>
      {loading && <p className={styles.loading}>Generating AI review...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div className={styles.reviewBox}>
          <pre className={styles.reviewText}>{review}</pre>
        </div>
      )}
    </div>
  )
}