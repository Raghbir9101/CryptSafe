import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Authorization/Login/Login'
import Register from './components/Authorization/Register/Register'
import Tables from './components/Table/Tables'
import TableContent from './components/Table/TableContent'
import TableCreate from './components/Table/TableCreate'
import TableUpdate from './components/Table/TableUpdate'
import Users from './components/Users/Users'
import UsersCreate from './components/Users/UsersCreate'
import UsersUpdate from './components/Users/UsersUpdate'
import AllRoutes from './components/Routes/Routes'

function App() {
  return (
    <>
      <AllRoutes />
    </>
  )
}

export default App
