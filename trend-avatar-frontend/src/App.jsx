import { useState } from 'react'
import * as ReactRouter from 'react-router-dom'
import Home from './components/Home'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <ReactRouter.BrowserRouter>
      <div className="app">
        <ReactRouter.Routes>
          <ReactRouter.Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
        </ReactRouter.Routes>
      </div>
    </ReactRouter.BrowserRouter>
  )
}

export default App
