import "./university.css";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../../config/firbase";
import CommentItem from "../../components/commentsitems/CommentItems";
import RatingWidget from "../../components/rating/RatingWidget";

export default function University() {
  const { id } = useParams();

  const [university, setUniversity] = useState(null);

  // "all" means show every comment
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // =========================
  // GET UNIVERSITY
  // =========================

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
        } else {
          console.log("University not found");
        }
      } catch (error) {
        console.error("Error getting university:", error);
      }
    };

    getUniversity();
  }, [id]);

  // =========================
  // GET COMMENTS
  // =========================

  useEffect(() => {
    if (!id) return;

    const commentsRef = collection(db, "universities", id, "comments");

    let q;

    // Show ALL comments
    if (selectedCategory === "all") {
      q = query(commentsRef, orderBy("createdAt", "desc"));
    }

    // Show only selected category
    else {
      q = query(
        commentsRef,
        where("category", "==", selectedCategory),
        orderBy("createdAt", "desc"),
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const commentsData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setComments(commentsData);
      },
      (error) => {
        console.error("Error getting comments:", error);
      },
    );

    return () => unsubscribe();
  }, [id, selectedCategory]);

  // =========================
  // ADD COMMENT
  // =========================

  const handleAddComment = async (e) => {
    e.preventDefault();

    const text = newComment.trim();

    if (!text) return;

    // Don't allow comments while "All Comments" is selected
    if (selectedCategory === "all") {
      alert("Please select a category before adding a comment.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to comment.");
      return;
    }

    try {
      await addDoc(collection(db, "universities", id, "comments"), {
        text,

        // Save the actual category
        category: selectedCategory,

        parentId: null,

        userId: user.uid,

        likes: [],

        createdAt: serverTimestamp(),
      });

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (!university) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="university-card">
      {/* Back button */}
      <Link to="/" className="back-link">
        ← Back to all universities
      </Link>

      {/* =========================
          UNIVERSITY HERO
      ========================= */}

      <div className="university-hero">
        <img
          className="university-image"
          src={university.image}
          alt={university.name}
        />

        <div className="university-overlay">
          {university.type && (
            <span className="university-badge">{university.type}</span>
          )}

          <h1 className="university-name">{university.name}</h1>

          <p className="university-location">
            <svg
              className="location-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>

            {university.location}
          </p>
        </div>
      </div>

      {/* =========================
          UNIVERSITY CONTENT
      ========================= */}

      <div className="university-card-content">
        {/* About */}
        <p className="university-about">{university.about}</p>
        {/* Rating */}
        <div className="university-rating">
          <RatingWidget universityId={id} />
        </div>

        {/* Majors */}
        <div className="university-majors">
          <h3>Majors:</h3>

          <div className="majors-list">
            {university.majors?.map((major, index) => (
              <span className="major" key={index}>
                {major}
              </span>
            ))}
          </div>
        </div>

        {/* =========================
            COMMENTS
        ========================= */}

        <div className="comments">
          {/* ALL COMMENTS */}
          <button
            type="button"
            className={`commentCategory ${
              selectedCategory === "all" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            💬 All Comments
          </button>

          {/* ACCOMMODATION */}
          <button
            type="button"
            className={`commentCategory ${
              selectedCategory === "accommodation" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("accommodation")}
          >
            🏠 Accommodation
          </button>

          {/* TRANSPORTATION */}
          <button
            type="button"
            className={`commentCategory ${
              selectedCategory === "transportation" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("transportation")}
          >
            🚌 Transportation
          </button>

          {/* TUITION */}
          <button
            type="button"
            className={`commentCategory ${
              selectedCategory === "tuition" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("tuition")}
          >
            💰 Tuition & Fees
          </button>

          {/* ACTIVITIES */}
          <button
            type="button"
            className={`commentCategory ${
              selectedCategory === "activities" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("activities")}
          >
            🎉 Activities
          </button>

          {/* OTHER TOPICS */}
          <button
            type="button"
            className={`commentCategory ${
              selectedCategory === "othertopics" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("othertopics")}
          >
            💬 Other Topics
          </button>

          {/* =========================
              ADD COMMENT FORM
          ========================= */}

          {selectedCategory !== "all" && (
            <form onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />

              <button type="submit">Add Comment</button>
            </form>
          )}

          {/* =========================
              COMMENTS LIST
          ========================= */}

          <div className="comments-list">
            {comments.length === 0 && (
              <p className="no-comments">No comments yet — be the first!</p>
            )}

            {comments
              .filter((comment) => !comment.parentId)
              .map((comment) => (
                <CommentItem
                  key={comment.id}
                  universityId={id}
                  comment={comment}
                  allComments={comments}
                  depth={0}
                  showCategory={selectedCategory === "all"}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
