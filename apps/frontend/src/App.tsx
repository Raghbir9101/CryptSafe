import { useEffect } from 'react'
import './App.css'
import AllRoutes from './components/Routes/Routes'
import { getUserAfterRefresh, logout } from './components/Services/AuthService'
import { Box, Button } from '@mui/material'
import { NavLink, useNavigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
function App() {
  const nav = useNavigate();

  useEffect(() => {
    getUserAfterRefresh();
  }, [])
  return (
    <Box>
      <Toaster />
      <Box padding={"20px"} display={"flex"} gap={"20px"} alignItems={"center"} justifyContent={"space-between"} >
        <Box display={"flex"} gap={"20px"} alignItems={"center"}>
          <NavLink to={"/tables"}>Tables</NavLink>
          <NavLink to={"/users"}>Users</NavLink>
        </Box>
        <Box display={"flex"} gap={"20px"} alignItems={"center"}>
          <Button onClick={() => {
            nav("/tables/create")
          }} variant='contained'>Add
          </Button>
          <Button onClick={() => {
            nav("/login")
            logout()
          }} variant='contained'>Log Out
          </Button>
        </Box>
      </Box>
      <AllRoutes />
    </Box>
  )
}

export default App
