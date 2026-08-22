import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../config/firbase";
import "./addUniversity.css";

export default function AddUniversity({ onClose, onUniversityAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    location: "",
    image: "",
    type: "frontaly",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await addDoc(collection(db, "universities"), {
        name: formData.name.trim(),
        about: formData.about.trim(),
        location: formData.type === "frontaly" ? formData.location.trim() : "",
        image: formData.image.trim(),
        type: formData.type,
        reviews: 0,
        majors: [
          "Computer Science",
          "Software Engineering",
          "Information Technology",
          "Business Administration",
          "Accounting",
          "Economics",
          "Electrical Engineering",
          "Mechanical Engineering",
          "Civil Engineering",
          "Architecture",
          "Psychology",
          "Education",
          "Biology",
          "Chemistry",
          "Mathematics",
          "Physics",
          "Nursing",
          "Medicine",
          "Law",
          "Communication",
        ],
      });

      alert("University added successfully!");
      await onUniversityAdded();
    } catch (error) {
      console.error("Error adding university:", error);
      alert("Failed to add university");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addUniversityOverlay">
      <div className="addUniversity">
        <div className="addUniversityHeader">
          <h1>Add University</h1>

          <button
            type="button"
            className="addUniversityCloseBtn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="addUniversityForm" onSubmit={handleSubmit}>
          <div className="addUniversityField">
            <label>University Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="wrtie name of university.."
              required
            />
          </div>

          <div className="addUniversityField">
            <label>About University</label>

            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Write information about the university..."
              rows={8}
              required
            />
          </div>

          <div className="addUniversityField">
            <label>University Type</label>

            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="frontaly">frontaly</option>
              <option value="zome">Learning By Zoom</option>
            </select>
          </div>

          {formData.type === "frontaly" && (
            <div className="addUniversityField">
              <label>Location</label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="wrtie location of university.."
                required
              />
            </div>
          )}

          <div className="addUniversityField">
            <label>Image URL</label>

            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="addUniversityActions">
            <button
              type="button"
              className="addUniversityCancelBtn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="addUniversitySubmitBtn"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add University"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
