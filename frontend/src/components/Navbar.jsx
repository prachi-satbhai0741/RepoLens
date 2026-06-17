import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home', icon: '🔍' },
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/search', label: 'Search', icon: '🔎' },
  ]

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>🔍</span>
          <span className={styles.brandText}>RepoLens</span>
        </Link>
        <div className={styles.links}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.navLink} ${location.pathname === link.to ? styles.active : ''}`}
            >
              <span className={styles.linkIcon}>{link.icon}</span>
              <span className={styles.linkLabel}>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
