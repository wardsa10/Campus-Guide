import { useEffect, useState } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";

import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../../config/firbase";

import { Link, useNavigate } from "react-router-dom";

import useResize from "../../hooks/useResize";

import "./register.css";

export default function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    universityId: "",
  });

  const [universities, setUniversities] = useState([]);

  const navigate = useNavigate();

  const { size, handleMouseDown } = useResize(500, 600);

  // Get universities
  useEffect(() => {
    const getUniversities = async () => {
      try {
        const snapshot = await getDocs(collection(db, "universities"));

        const universitiesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUniversities(universitiesData);
      } catch (error) {
        console.error("Error getting universities:", error);
      }
    };

    getUniversities();
  }, []);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const selectRole = (role) => {
    setUser({
      ...user,
      role,
      // Clear university if visitor is selected
      universityId: role === "visitor" ? "" : user.universityId,
    });
  };

  const register = async (e) => {
    e.preventDefault();

    // Make sure account type is selected
    if (!user.role) {
      alert("Please select Student or Visitor");
      return;
    }

    // Student must select university
    if (user.role === "student" && !user.universityId) {
      alert("Please select your university");
      return;
    }

    try {
      // 1. Create Firebase Authentication account
      const userDoc = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password,
      );

      // 2. Get Firebase UID
      const uid = userDoc.user.uid;

      // 3. Create user document
      await setDoc(doc(db, "users", uid), {
        name: user.name,
        email: user.email,
        role: user.role,

        // Student's university
        universityId: user.role === "student" ? user.universityId : null,

        created_at: serverTimestamp(),
      });

      alert("Account created successfully!");

      navigate("/");

      // Clear form
      setUser({
        name: "",
        email: "",
        password: "",
        role: "",
        universityId: "",
      });
    } catch (err) {
      console.log(err);
      alert("Something went wrong. Please try again.");
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
          <h2>Create Account</h2>
        </div>

        <form onSubmit={register}>
          {/* Name */}
          <div className="formGroup">
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          {/* Email */}
          <div className="formGroup">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="formGroup">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Account Type */}
          <div className="formGroup">
            <label>Account Type</label>

            <div className="accountTypeGroup">
              {/* Student */}
              <div
                className={`accountTypeCard ${
                  user.role === "student" ? "selected" : ""
                }`}
                onClick={() => selectRole("student")}
              >
                <span className="cardIcon">🎓</span>

                <div className="cardTitle">Student</div>

                <div className="cardDesc">Comments & reviews</div>
              </div>

              {/* Visitor */}
              <div
                className={`accountTypeCard ${
                  user.role === "visitor" ? "selected" : ""
                }`}
                onClick={() => selectRole("visitor")}
              >
                <span className="cardIcon">🏛️</span>

                <div className="cardTitle">Visitor</div>

                <div className="cardDesc">
                  Search for your university and ask questions on comments
                </div>
              </div>
            </div>
          </div>

          {/* University selection - STUDENTS ONLY */}
          {user.role === "student" && (
            <div className="formGroup">
              <label>Your University</label>

              <select
                name="universityId"
                value={user.universityId}
                onChange={handleChange}
                required
              >
                <option value="">Select your university</option>

                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit">Create Account</button>

          <Link to={"/"}>cancel</Link>

          <h4>
            Already have an account? <Link to={"/login"}>Sign In</Link>
          </h4>
        </form>

        <div className="resizeHandle" onMouseDown={handleMouseDown} />
      </div>
    </div>
  );
}
