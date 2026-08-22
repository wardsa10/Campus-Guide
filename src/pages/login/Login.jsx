

import { auth, db } from "../../config/firbase";
import { Link, useNavigate } from "react-router-dom";
import useResize from "../../hooks/useResize";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
export default function Login() {
  const [user, setUser] = useState({
    email: "",
    password:""
 })
  const navigate = useNavigate();
const { size, handleMouseDown } = useResize(500, 400);
const handleChange = (e) => {
  setUser({
    ...user,
    [e.target.name]: e.target.value,
  });
};

 const login = async (e) => {
   e.preventDefault();

   try {
     // Check email + password using Firebase Authentication
     const result = await signInWithEmailAndPassword(
       auth,
       user.email,
       user.password,
     );

     // Get UID of logged-in user
     const uid = result.user.uid;

     // Get this user's document from Firestore
     const userSnapshot = await getDoc(doc(db, "users", uid));

     if (userSnapshot.exists()) {
       const userData = userSnapshot.data();

     

       alert(`Welcome ${userData.name}`);
     navigate("/");
     } else {
       alert("User account exists, but user data was not found.");
     }
   } catch (error) {
    
       alert(error.message);
     
   }
 };

  return (
    <div className="modalOverlay">
      <div
        className="registerModal"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
      >
        <div className="resizeHandle" onMouseDown={handleMouseDown} />
        <Link to={"/"} className="closeBtn">
          ✕
        </Link>
        <div className="modalHeader">
          <span className="icon">🎓</span>
          <h2>Welcome Back</h2>
        </div>
        <form onSubmit={login}>
          <div className="formGroup">
            <label>email</label>
            <input
              type="email"
              value={user.email}
              name="email"
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="formGroup">
            {" "}
            <label>Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={user.password}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit">Sign in</button>
        </form>
        Don't have an account? <Link to={"/register"}> Register</Link>
        <div className="resizeHandle" onMouseDown={handleMouseDown} />
      </div>
    </div>
  );
}
