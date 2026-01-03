import React from 'react'
import './Admin.css'
import Sidebar from '../Components/Sidebar/Sidebar'
import AddProduct from '../Components/AddProduct/AddProduct'
import ListProduct from '../Components/ListProduct/ListProduct'
import { Navigate, Route, Routes } from 'react-router-dom'

function Admin() {
  return (


 <div className="admin">
      <Sidebar />

      <div className="content">
        <Routes>
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/listproduct" element={<ListProduct />} />
        </Routes>
      </div>
    </div>

  )
}

export default Admin
