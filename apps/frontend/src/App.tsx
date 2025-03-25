import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Login/Login'
import Register from './components/Register/Register'
import Tables from './components/Table/Tables'
import TableContent from './components/Table/TableContent'
import TableCreate from './components/Table/TableCreate'
import TableUpdate from './components/Table/TableUpdate'
import Users from './components/Users/Users'
import UsersCreate from './components/Users/UsersCreate'
import UsersUpdate from './components/Users/UsersUpdate'

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      <Route path='/tables' element={<Tables />} />
      <Route path='/tables/:id' element={<TableContent />} />
      <Route path='/tables/create' element={<TableCreate />} />
      <Route path='/tables/update/:id' element={<TableUpdate />} />

      <Route path='/users' element={<Users />} />
      <Route path='/users/create' element={<UsersCreate />} />
      <Route path='/users/update/:id' element={<UsersUpdate />} />
    </Routes>
  )
}

export default App
