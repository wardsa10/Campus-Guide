import { useState, useEffect } from "react";

import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { db, auth } from "../../config/firbase";

import "./ratingWidget.css";

export default function RatingWidget({ universityId, interactive = true }) {
  const [ratings, setRatings] = useState([]);
  const [hoverValue, setHoverValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // Listen for login/logout changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Get current user's Firestore data
  useEffect(() => {
    if (!currentUser) {
      setUserData(null);
      return;
    }

    const getUserData = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);

        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data());
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    getUserData();
  }, [currentUser]);

  // Listen to all ratings for this university
  useEffect(() => {
    if (!universityId) return;

    const ratingsRef = collection(db, "universities", universityId, "ratings");

    const unsubscribe = onSnapshot(
      ratingsRef,
      (snapshot) => {
        const ratingsData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setRatings(ratingsData);
      },
      (error) => {
        console.error("Error getting ratings:", error);
      },
    );

    return () => unsubscribe();
  }, [universityId]);

  // Number of ratings
  const reviewCount = ratings.length;

  // Calculate average
  const average =
    reviewCount > 0
      ? ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount
      : 0;

  // Find current user's rating
  const myRating = currentUser
    ? ratings.find((r) => r.id === currentUser.uid)?.rating || 0
    : 0;

  // Check if current user can rate this university
  const canRate =
    currentUser &&
    userData?.role === "student" &&
    userData?.universityId === universityId;

  // Add or update rating
  const handleRate = async (value) => {
    // Must be logged in
    if (!currentUser) {
      alert("Please log in to rate this university.");
      return;
    }

    // Must be a student
    if (userData?.role !== "student") {
      alert("Only students can rate universities.");
      return;
    }

    // Must belong to this university
    if (userData?.universityId !== universityId) {
      alert("You can only rate your own university.");
      return;
    }

    if (!universityId) {
      console.error("University ID is missing.");
      return;
    }

    setSubmitting(true);

    try {
      const ratingRef = doc(
        db,
        "universities",
        universityId,
        "ratings",
        currentUser.uid,
      );

      await setDoc(ratingRef, {
        rating: value,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      console.log("Rating saved successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setSubmitting(false);
      setHoverValue(0);
    }
  };

  // Render stars
  const renderStars = (value, isInteractive = false) => {
    return (
      <div className={`star-row ${isInteractive ? "interactive" : ""}`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = isInteractive
            ? i <= (hoverValue || myRating)
            : i <= Math.round(Number(value));

          return (
            <span
              key={i}
              className={`star ${filled ? "star-filled" : ""}`}
              onMouseEnter={isInteractive ? () => setHoverValue(i) : undefined}
              onMouseLeave={isInteractive ? () => setHoverValue(0) : undefined}
              onClick={isInteractive ? () => handleRate(i) : undefined}
            >
              ★
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="rating-widget">
      {/* Average rating */}
      <div className="rating-summary">
        <span className="rating-label">RATING</span>

        <span className="rating-average">
          {reviewCount > 0 ? average.toFixed(1) : "—"}
        </span>

        {renderStars(average)}

        <span className="rating-count">
          {reviewCount === 0
            ? "No ratings yet"
            : reviewCount === 1
              ? "(1 rating)"
              : `(${reviewCount} ratings)`}
        </span>
      </div>

      {/* Only show rating input if this user is allowed */}
      {interactive && canRate && (
        <div className="rating-user-input">
          <span className="rating-user-label">
            {myRating > 0 ? "Your rating:" : "Rate this university:"}
          </span>

          {renderStars(myRating, true)}

          {submitting && <span className="rating-saving">Saving...</span>}
        </div>
      )}
    </div>
  );
}
