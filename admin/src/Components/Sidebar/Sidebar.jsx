import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import add_product_icon from "../../assets/Admin_Assets/Product_Cart.svg";
import list_product_icon from "../../assets/Admin_Assets/Product_list_icon.svg";

export default function Sidebar() {
  return <aside className="sidebar">
    <NavLink to="/dashboard" className="sidebar-item"> <span className="sidebar-symbol">▦</span><p>Analytics</p></NavLink>
    <NavLink to="/addproduct" className="sidebar-item"><img src={add_product_icon} alt="" /><p>Add Product</p></NavLink>
    <NavLink to="/listproduct" className="sidebar-item"><img src={list_product_icon} alt="" /><p>Product list</p></NavLink>
  </aside>;
}
