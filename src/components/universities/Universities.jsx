import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

import { useEffect, useState } from "react";
import { db } from "../../config/firbase";
import { Link, useNavigate } from "react-router-dom";
import "./universities.css";
import { useUser } from "../../hooks/UserContext";
import AddUniversity from "../addUniversity/AddUniversity";
import RatingWidget from "../rating/RatingWidget";

export default function Universities() {
  const [universities, setUniversities] = useState([]);
  const [showAddUniversity, setShowAddUniversity] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const { user } = useUser();

  // Get universities from Firestore
  const getUniversities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "universities"));

      const universitiesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUniversities(universitiesData);
    } catch (error) {
      console.error("Error getting universities:", error);
    }
  };

  // Get universities when page loads
  useEffect(() => {
    getUniversities();
  }, []);

  // Search universities
  const filteredUniversities = universities.filter((university) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    const universityName = university.name?.toLowerCase() || "";

    const location = university.location?.toLowerCase() || "";

    const majors = university.majors?.join(" ").toLowerCase() || "";

    return (
      universityName.includes(searchText) ||
      location.includes(searchText) ||
      majors.includes(searchText)
    );
  });

  // Called after successfully adding a university
  const handleUniversityAdded = async () => {
    setShowAddUniversity(false);

    // Refresh universities
    await getUniversities();
  };

  // Called when Cancel / X is clicked
  const handleCloseAddUniversity = () => {
    setShowAddUniversity(false);
  };

  // Delete university
  const onDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "universities", id));

      // Refresh universities after deleting
      await getUniversities();

      console.log("University deleted successfully");
    } catch (error) {
      console.error("Error deleting university:", error);
    }
  };

  return (
    <>
      <nav className="nav">
        <h3 className="eyebrow">NATIONAL UNIVERSITY DIRECTORY</h3>

        <h1 className="heroTitle">Find Your University</h1>

        <h2 className="heroSubtitle">
          Explore accredited institutions, read authentic student reviews, and
          get answers directly from other students or help people to find their
          university.
        </h2>
      </nav>

      <div className="universities-section">
        {/* ADD UNIVERSITY BUTTON */}
        {user?.role === "admin" && (
          <button
            className="addUniversityBtn"
            onClick={() => setShowAddUniversity(true)}
          >
            + Add University
          </button>
        )}

        {/* ADD UNIVERSITY FORM */}
        {showAddUniversity && user?.role === "admin" && (
          <AddUniversity
            onClose={handleCloseAddUniversity}
            onUniversityAdded={handleUniversityAdded}
          />
        )}

        <br />

        {/* SEARCH */}
        <div className="search-row">
          <p className="universities-count">
            {search
              ? `Showing ${filteredUniversities.length} ${
                  filteredUniversities.length === 1
                    ? "university"
                    : "universities"
                }`
              : `Showing ${universities.length} ${
                  universities.length === 1 ? "university" : "universities"
                }`}
          </p>

          <div className="university-search">
            <input
              id="universitySearch"
              type="text"
              placeholder="Search for university, location ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button className="clearSearchBtn" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* UNIVERSITIES */}
        <div className="universities-container">
          {filteredUniversities.length > 0 ? (
            filteredUniversities.map((university) => (
              <Link
                to={`/university/${university.id}`}
                className="universitys-card"
                key={university.id}
              >
                {/* UNIVERSITY IMAGE */}
                <img
                  className="university-image"
                  src={university.image}
                  alt={university.name}
                />

                {/* UNIVERSITY NAME */}
                <h2>{university.name}</h2>

                {/* LOCATION */}
                <p>
                  {university.type === "frontaly" && (
                    <svg
                      className="location-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                    </svg>
                  )}

                  {university.location}
                </p>

                {/* RATING */}
                <RatingWidget
                  universityId={university.id}
                  interactive={false}
                />

                {/* MAJORS */}
                <div className="majors-list">
                  {university.majors?.map((major, index) => (
                    <span className="major" key={index}>
                      {major}
                    </span>
                  ))}
                </div>

                {/* ADMIN ACTIONS */}
                {user?.role === "admin" && (
                  <div className="universityActions">
                    {/* EDIT */}
                    <button
                      type="button"
                      className="editBtn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        navigate(`/university/edit/${university.id}`);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      className="deleteBtn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        onDelete(university.id);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                )}
              </Link>
            ))
          ) : (
            <div className="noUniversities">
              <h3>No universities found</h3>

              <p>Try searching for another university, location, or major.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
