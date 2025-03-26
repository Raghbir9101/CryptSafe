import { Route, Routes } from "react-router-dom";
import Tables from "../Table/Tables";
import Register from "../Authorization/Register/Register";
import Login from "../Authorization/Login/Login";
import TableContent from "../Table/TableContent";
import UsersCreate from "../Users/UsersCreate";
import Users from "../Users/Users";
import TableUpdate from "../Table/TableUpdate";
import TableCreate from "../Table/TableCreate";
import UsersUpdate from "../Users/UsersUpdate";

export default function AllRoutes() {
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