import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Results from './pages/Results.jsx'
import Review from './pages/Review.jsx'
import Search from './pages/Search.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/review" element={<Review />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  )
}