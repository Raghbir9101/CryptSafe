import { Navigate, Route, Routes } from "react-router-dom";
import Tables from "../Table/Tables";
import Register from "../Authorization/Register/Register";
import Login from "../Authorization/Login/Login";
import TableContent from "../Table/TableContent";
import UsersCreate from "../Users/UsersCreate";
import Users from "../Users/Users";
import TableUpdate from "../Table/TableUpdate";
import TableCreate from "../Table/TableCreate";
import UsersUpdate from "../Users/UsersUpdate";
import { isAuthenticated } from "../Services/AuthService";
import TableShare from "../Table/TableShare";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated.value) {
        return children;
    }
    return <Navigate to='/login' />;
}

export default function AllRoutes() {
    return (
        <Routes>
            <Route path='/login' element={isAuthenticated.value ? <Navigate to={"/tables"} /> : <Login />} />
            <Route path='/register' element={isAuthenticated.value ? <Navigate to={"/tables"} /> : <Register />} />

            <Route path='/tables' element={<ProtectedRoute><Tables /></ProtectedRoute>} />
            <Route path='/tables/create' element={<ProtectedRoute><TableCreate /></ProtectedRoute>} />
            <Route path='/tables/:id' element={<ProtectedRoute><TableContent /></ProtectedRoute>} />
            <Route path='/tables/share/:id' element={<ProtectedRoute><TableShare /></ProtectedRoute>} />
            <Route path='/tables/update/:id' element={<ProtectedRoute><TableUpdate /></ProtectedRoute>} />

            <Route path='/users' element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path='/users/create' element={<ProtectedRoute><UsersCreate /></ProtectedRoute>} />
            <Route path='/users/update/:id' element={<ProtectedRoute><UsersUpdate /></ProtectedRoute>} />

            <Route path='*' element={<Navigate to={"/login"} />} />
        </Routes>
    )
}