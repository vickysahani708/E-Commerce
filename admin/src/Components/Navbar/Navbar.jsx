import "./Navbar.css";
import navlogo from "../../assets/Admin_Assets/nav-logo.svg";
import navProfile from "../../assets/Admin_Assets/nav-profile.svg";

export default function Navbar({ onLogout }) {
  return <header className="navbar"><img className="nav-logo" src={navlogo} alt="Store admin" /><div className="navbar-actions"><img className="nav-profile" src={navProfile} alt="" /><button onClick={onLogout}>Sign out</button></div></header>;
}
