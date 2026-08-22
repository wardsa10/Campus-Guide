import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firbase"; // your firebase config file
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firbase';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until Firebase checks auth state

 // your Firestore instance

 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    

     if (!firebaseUser) {
    
       setUser(null);
       setLoading(false);
       return;
     }

     try {
     

       const userDocRef = doc(db, "users", firebaseUser.uid);

      

       const userDocSnap = await getDoc(userDocRef);

   

       if (userDocSnap.exists()) {
         

         setUser({
           ...firebaseUser,
           ...userDocSnap.data(),
         });
       } else {
        
         setUser(firebaseUser);
       }
     } catch (error) {
       console.error("❌ FIRESTORE ERROR:", error);
       setUser(firebaseUser);
     } finally {
       setLoading(false);
     }
   });

   return unsubscribe;
 }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for easy access anywhere
export function useUser() {
  return useContext(UserContext);
}
