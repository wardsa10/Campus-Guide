import { Link } from "react-router-dom";
import "./header.css";
import { useUser } from "../../hooks/UserContext";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { auth } from "../../config/firbase";

export default function Header() {
  const { user, loading } = useUser();
 
  if (loading) return null;


  return (

    
    <div className="header">
      <div className="headerTop">
        <Link to={"/"} id="campusIcon">
          <span className="icon">🎓</span> Campus Guide
        </Link>
      

        {user ? (
          <div className="userProfile">
            <div className="userAvatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="userInfo">
              <span className="userName">{user.name || "User"}</span>
              <span className="userRole"> {user.role || "Student"}</span>
            </div>
            <button className="logoutBtn" onClick={() => signOut(auth)}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="buttons">
            <Link to={"/login"} className="signinBtn">
              Sign in
            </Link>
            <Link to={"/register"} className="registerBtn">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
