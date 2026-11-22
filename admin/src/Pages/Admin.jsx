import "./Admin.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import AddProduct from "../Components/AddProduct/AddProduct";
import ListProduct from "../Components/ListProduct/ListProduct";
import Dashboard from "./Dashboard";
import { Navigate, Route, Routes } from "react-router-dom";

export default function Admin({ token, onUnauthorized }) {
  return <div className="admin"><Sidebar /><div className="content">
    <Routes>
      <Route path="/" element={<Dashboard token={token} />} />
      <Route path="/dashboard" element={<Dashboard token={token} />} />
      <Route path="/addproduct" element={<AddProduct token={token} />} />
      <Route path="/listproduct" element={<ListProduct token={token} onUnauthorized={onUnauthorized} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div></div>;
}
