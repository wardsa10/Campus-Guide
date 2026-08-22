import { useState, useEffect } from "react";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { db, auth } from ".././config/firbase";

// =========================
// AVATAR COLORS
// =========================

const AVATAR_COLORS = [
  "#1e2a4a",
  "#047857",
  "#b45309",
  "#7c3aed",
  "#be185d",
  "#0891b2",
  "#c2410c",
  "#4338ca",
];

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// =========================
// ROLE INFORMATION
// =========================

const ROLE_META = {
  admin: {
    label: "Admin",
    className: "role-admin",
  },

  student: {
    label: "Student",
    className: "role-student",
  },

  visitor: {
    label: "Visitor",
    className: "role-visitor",
  },
};

// =========================
// CATEGORY INFORMATION
// =========================

const CATEGORY_META = {
  accommodation: {
    label: "🏠 Accommodation",
    className: "category-accommodation",
  },

  transportation: {
    label: "🚌 Transportation",
    className: "category-transportation",
  },

  tuition: {
    label: "💰 Tuition & Fees",
    className: "category-tuition",
  },

  activities: {
    label: "🎉 Activities",
    className: "category-activities",
  },

  othertopics: {
    label: "💬 Other Topics",
    className: "category-othertopics",
  },
};

export default function CommentItem({
  universityId,
  comment,
  allComments,
  depth,
  showCategory,
}) {
  const [author, setAuthor] = useState(null);

  const [viewerRole, setViewerRole] = useState(null);

  const [showReplyForm, setShowReplyForm] = useState(false);

  const [showReplies, setShowReplies] = useState(true);

  const [replyText, setReplyText] = useState("");

  const currentUser = auth.currentUser;

  // =========================
  // GET COMMENT AUTHOR
  // =========================

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!comment.userId) return;

      try {
        const userSnap = await getDoc(doc(db, "users", comment.userId));

        if (userSnap.exists()) {
          setAuthor(userSnap.data());
        }
      } catch (error) {
        console.error("Error fetching comment author:", error);
      }
    };

    fetchAuthor();
  }, [comment.userId]);

  // =========================
  // GET CURRENT VIEWER ROLE
  // =========================

  useEffect(() => {
    const fetchViewerRole = async () => {
      if (!currentUser) return;

      try {
        const viewerSnap = await getDoc(doc(db, "users", currentUser.uid));

        if (viewerSnap.exists()) {
          setViewerRole(viewerSnap.data().role);
        }
      } catch (error) {
        console.error("Error fetching viewer role:", error);
      }
    };

    fetchViewerRole();
  }, [currentUser?.uid]);

  // =========================
  // AUTHOR INFORMATION
  // =========================

  const displayName = author?.name || "Anonymous";

  const role = author?.role || "visitor";

  const roleMeta = ROLE_META[role] || ROLE_META.visitor;

  // =========================
  // COMMENT CATEGORY
  // =========================

  const categoryMeta = CATEGORY_META[comment.category];

  // =========================
  // LIKES
  // =========================

  const likes = comment.likes || [];

  const hasLiked = currentUser ? likes.includes(currentUser.uid) : false;

  // =========================
  // LIKE / UNLIKE
  // =========================

  const handleToggleLike = async () => {
    if (!currentUser) {
      alert("Please log in to like a comment.");
      return;
    }

    const commentRef = doc(
      db,
      "universities",
      universityId,
      "comments",
      comment.id,
    );

    try {
      await updateDoc(commentRef, {
        likes: hasLiked
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid),
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // =========================
  // FIND REPLIES
  // =========================

  const childReplies = allComments.filter((c) => c.parentId === comment.id);

  // =========================
  // ADD REPLY
  // =========================

  const handleAddReply = async (e) => {
    e.preventDefault();

    const text = replyText.trim();

    if (!text) return;

    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to reply.");
      return;
    }

    try {
      await addDoc(collection(db, "universities", universityId, "comments"), {
        text,

        // Reply keeps the same category
        category: comment.category,

        parentId: comment.id,

        userId: user.uid,

        likes: [],

        createdAt: serverTimestamp(),
      });

      setReplyText("");
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "";

    return timestamp.toDate().toLocaleDateString();
  };

  // =========================
  // COLLECT IDS TO DELETE
  // =========================

  const collectIdsToDelete = (commentId, all) => {
    const children = all.filter((c) => c.parentId === commentId);

    return [
      commentId,
      ...children.flatMap((child) => collectIdsToDelete(child.id, all)),
    ];
  };

  // =========================
  // DELETE COMMENT
  // =========================

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment and all its replies?")) {
      return;
    }

    const idsToDelete = collectIdsToDelete(comment.id, allComments);

    try {
      await Promise.all(
        idsToDelete.map((cid) =>
          deleteDoc(doc(db, "universities", universityId, "comments", cid)),
        ),
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // =========================
  // PERMISSIONS
  // =========================

  const isOwner = currentUser && comment.userId === currentUser.uid;

  const isAdmin = viewerRole === "admin";

  const canDelete = isOwner || isAdmin;

  // =========================
  // RETURN COMMENT
  // =========================

  return (
    <div
      className="comment"
      style={{
        marginLeft: depth > 0 ? 24 : 0,
      }}
    >
      {/* =========================
          COMMENT HEADER
      ========================= */}

      <div className="comment-header">
        <div className="comment-header-left">
          {/* Avatar */}

          <div
            className="comment-avatar-placeholder"
            style={{
              backgroundColor: getAvatarColor(displayName),
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          {/* User information */}

          <div>
            <div className="comment-name-row">
              {/* Name */}

              <span className="comment-author">{displayName}</span>

              {/* Role */}

              <span className={`role-badge ${roleMeta.className}`}>
                {roleMeta.label}
              </span>

              {/* CATEGORY */}

              {showCategory && (
                <span className={`category-badge category-${comment.category}`}>
                  {comment.category === "accommodation" && "🏠 Accommodation"}
                  {comment.category === "transportation" && "🚌 Transportation"}
                  {comment.category === "tuition" && "💰 Tuition & Fees"}
                  {comment.category === "activities" && "🎉 Activities"}
                  {comment.category === "othertopics" && "💬 Other Topics"}
                </span>
              )}
            </div>

            {/* Date */}

            <span className="comment-date">
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* =========================
          COMMENT TEXT
      ========================= */}

      <p className="comment-text">{comment.text}</p>

      {/* =========================
          COMMENT ACTIONS
      ========================= */}

      <div className="comment-actions">
        {/* Like */}

        <button
          type="button"
          className={`like-button ${hasLiked ? "liked" : ""}`}
          onClick={handleToggleLike}
        >
          {hasLiked ? "❤️" : "🤍"} {likes.length > 0 ? likes.length : ""} Like
        </button>

        {/* Reply */}

        <button type="button" onClick={() => setShowReplyForm((s) => !s)}>
          Reply
        </button>

        {/* Show / Hide replies */}

        {childReplies.length > 0 && (
          <button type="button" onClick={() => setShowReplies((s) => !s)}>
            {showReplies ? "Hide" : "Show"} {childReplies.length}{" "}
            {childReplies.length === 1 ? "reply" : "replies"}
          </button>
        )}

        {/* Delete */}

        {canDelete && (
          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* =========================
          REPLY FORM
      ========================= */}

      {showReplyForm && (
        <form onSubmit={handleAddReply} className="reply-form">
          <input
            type="text"
            placeholder={`Reply to ${displayName}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />

          <button type="submit">Reply</button>
        </form>
      )}

      {/* =========================
          REPLIES
      ========================= */}

      {showReplies && childReplies.length > 0 && (
        <div className="replies-list">
          {childReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              universityId={universityId}
              comment={reply}
              allComments={allComments}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
