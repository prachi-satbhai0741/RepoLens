import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Search.module.css'

export default function Search() {
  const navigate = useNavigate()
  const [repoUrl, setRepoUrl] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!repoUrl.trim() || !query.trim()) {
      setError('Please enter both a repository URL and a search query.')
      return
    }
    setError('')
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim(), query: query.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Search failed')
      setResults(data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Semantic Code Search</h1>
        <p className={styles.subtitle}>
          Search through repository code for functions, patterns, and keywords.
        </p>
      </div>

      <div className={styles.searchCard}>
        <div className={styles.field}>
          <label className={styles.label}>Repository URL</label>
          <input
            className={styles.input}
            type="text"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Search Query</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. authentication, useEffect, database query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          className={styles.searchBtn}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Code'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {results && results.length === 0 && !loading && (
        <p className={styles.noResults}>No matching code found. Try different keywords.</p>
      )}

      {results && results.length > 0 && (
        <div className={styles.results}>
          <p className={styles.resultCount}>
            Found matches in <strong>{results.length}</strong> file{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((file, i) => (
            <div key={i} className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <span className={styles.filePath}>{file.path}</span>
                <span className={styles.matchCount}>
                  {file.totalMatches} match{file.totalMatches !== 1 ? 'es' : ''}
                </span>
              </div>
              <div className={styles.codeBlock}>
                {file.matches.map((match, j) => (
                  <div key={j} className={styles.codeLine}>
                    <span className={styles.lineNumber}>{match.lineNumber}</span>
                    <code className={styles.lineContent}>{match.content}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
