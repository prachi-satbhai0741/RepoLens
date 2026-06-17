import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'
import styles from './Navbar.module.css'

export default function Navbar() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/search', label: 'Search' },
  ]

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandText}>RepoLens</span>
        </Link>
        <div className={styles.links}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.navLink} ${location.pathname === link.to ? styles.active : ''}`}
            >
              <span className={styles.linkLabel}>{link.label}</span>
            </Link>
          ))}
          <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </nav>
  )
}
