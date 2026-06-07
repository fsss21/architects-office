import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import StartScreen from './components/StartScreen'
import AppLayout from './components/AppLayout'
import MainMenu from './pages/MainMenu'
import Biography from './pages/Biography'
import Principles from './pages/Principles'
import About from './pages/About'

function App() {
  const [showStartScreen, setShowStartScreen] = useState(true)

  return (
    <>
      {showStartScreen && (
        <StartScreen onContinue={() => setShowStartScreen(false)} />
      )}
      {!showStartScreen && (
        <Routes>
          <Route path="/" element={<AppLayout onBackToStart={() => setShowStartScreen(true)} />}>
            <Route index element={<MainMenu />} />
            <Route path="biography/:personId" element={<Biography />} />
            <Route path="principles" element={<Principles />} />
          </Route>
          <Route path="/about" element={<About />} />
        </Routes>
      )}
    </>
  )
}

export default App
