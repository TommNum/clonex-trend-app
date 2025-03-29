import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
