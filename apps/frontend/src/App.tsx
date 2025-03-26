import { useEffect } from 'react'
import './App.css'
import AllRoutes from './components/Routes/Routes'
import { getUserAfterRefresh } from './components/Services/AuthService'

function App() {
  useEffect(() => {
    getUserAfterRefresh();
  }, [])
  return (
    <AllRoutes />
  )
}

export default App
