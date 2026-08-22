import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {  useNavigate, useParams } from "react-router-dom";
import { db } from "../../config/firbase";
import "./editUniversity.css";

export default function EditUniversity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [university, setUniversity] = useState(null);

  // Get one university
  useEffect(() => {
    const getUniversity = async () => {
      try {
        const universityRef = doc(db, "universities", id);
        const universitySnap = await getDoc(universityRef);

        if (universitySnap.exists()) {
          setUniversity({
            id: universitySnap.id,
            ...universitySnap.data(),
          });
        }
      } catch (error) {
        console.error("Error getting university:", error);
      }
    };

    getUniversity();
  }, [id]);

  // Handle normal inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUniversity((prev) => ({
      ...prev,
      [name]: name === "reviews" ? Number(value) : value,
    }));
  };



  // Update university
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const universityRef = doc(db, "universities", id);

      await updateDoc(universityRef, {
        name: university.name,
        location: university.location,
        type: university.type,
        image: university.image,
       
      });

      console.log("University updated successfully");

      // Go back to universities page
      navigate("/");
    } catch (error) {
      console.error("Error updating university:", error);
    }
  };

  if (!university) {
    return <p>Loading...</p>;
  }

  return (
    <div className="editPage">
      <form className="editForm" onSubmit={handleSubmit}>
        <div className="editHeader">
          <h2>Edit University</h2>

          <button type="button" onClick={() => navigate("/")}>
            ✕
          </button>
        </div>

        <label>University Name</label>

        <input
          type="text"
          name="name"
          value={university.name || ""}
          onChange={handleChange}
          required
        />

        <label>Location</label>

        <input
          type="text"
          name="location"
          value={university.location || ""}
          onChange={handleChange}
        
        />

        <label>University Type</label>

        <select
          name="type"
          value={university.type || "frontaly"}
          onChange={handleChange}
        >
          
          <option value="frontaly">frontaly</option>
          <option value="zome">Learning By Zome</option>
        </select>

        <label>Image URL</label>

        <input
          type="text"
          name="image"
          value={university.image || ""}
          onChange={handleChange}
        />

        <div className="editFormButtons">
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>

          <button type="submit">Update University</button>
        </div>
      </form>
    </div>
  );
}
