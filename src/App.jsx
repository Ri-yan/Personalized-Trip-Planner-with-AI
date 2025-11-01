// // src/App.jsx
// import React, { useState, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import Onboarding from "./pages/Onboarding";
// import Results from "./pages/Results";
// import Footer from "./components/Footer";
// import ConfirmModal from "./components/ConfirmModal";

// import {
//   auth,
//   onAuthStateChanged,
//   db,
//   collection,
//   onSnapshot,
//   doc,
//   deleteDoc,
//   updateDoc,
// } from "./utils/firebase";

// export default function App() {
//   const [trip, setTrip] = useState(null);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [pastTrips, setPastTrips] = useState([]);
//   const [tripToDelete, setTripToDelete] = useState(null);

//   useEffect(() => {
//     let unsubscribeTrips = null;
//     const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
//       if (firebaseUser) {
//         const userObj = {
//           name: firebaseUser.displayName,
//           email: firebaseUser.email,
//           uid: firebaseUser.uid,
//         };
//         setUser(userObj);

//         // subscribe to user's itineraries (realtime)
//         const tripsRef = collection(db, "users", userObj.uid, "itineraries");
//         unsubscribeTrips = onSnapshot(tripsRef, (snapshot) => {
//           const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
//           // sort: favorites first, then newest
//           trips.sort((a, b) => {
//             if ((b.favorite ? 1 : 0) === (a.favorite ? 1 : 0)) {
//               return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
//             }
//             return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
//           });
//           setPastTrips(trips);
//         });
//       } else {
//         setUser(null);
//         setPastTrips([]);
//         if (unsubscribeTrips) unsubscribeTrips();
//       }
//       setLoading(false);
//     });

//     return () => {
//       if (unsubscribeAuth) unsubscribeAuth();
//       if (unsubscribeTrips) unsubscribeTrips();
//     };
//   }, []);

//   async function deleteTrip(uid, tripId) {
//     if (!uid || !tripId) return;
//     try {
//       await deleteDoc(doc(db, "users", uid, "itineraries", tripId));
//       console.log("🗑️ Trip deleted:", tripId);
//       // onSnapshot will update UI automatically
//     } catch (err) {
//       console.error("❌ Error deleting trip:", err);
//     } finally {
//       setTripToDelete(null);
//     }
//   }

//   async function toggleFavorite(uid, tripId, currentValue) {
//     if (!uid || !tripId) {
//       console.warn("Missing uid or tripId", { uid, tripId });
//       return;
//     }
//     try {
//       const ref = doc(db, "users", uid, "itineraries", tripId);
//       await updateDoc(ref, { favorite: !currentValue });
//       console.log("⭐ Favorite toggled:", tripId);
//     } catch (err) {
//       console.error("❌ Error toggling favorite:", err);
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
//       <Navbar user={user} setUser={setUser} />

//       <main className="flex-1 max-w-6xl mx-auto w-full p-6">
//         {/* Saved trips list */}
//         {user && !trip && pastTrips.length > 0 && (
//           <div className="mb-6">
//             <h2 className="text-xl font-semibold mb-3">Your Saved Trips</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {pastTrips.map((t) => (
//                 <div
//                   key={t.id}
//                   className="p-4 bg-white shadow rounded-lg relative"
//                 >
//                   <button
//                     onClick={() => toggleFavorite(user.uid, t.id, t.favorite)}
//                     className="absolute top-2 right-2 text-yellow-500"
//                     title={t.favorite ? "Unfavorite" : "Mark as Favorite"}
//                   >
//                     {t.favorite ? "⭐" : "☆"}
//                   </button>

//                   <div className="font-medium">{t.title}</div>
//                   <div className="text-sm text-gray-500">
//                     {t.days?.length || 0} days • Est. ₹{t.costEstimate}
//                   </div>
//                   <div className="mt-2 flex gap-2">
//                     <button
//                       onClick={() => {
//                         console.log("Opening trip:", t);
//                         setTrip(t); // t includes real id from Firestore
//                       }}
//                       className="px-3 py-1 bg-blue-600 text-white rounded"
//                     >
//                       View
//                     </button>

//                     <button
//                       onClick={() => setTripToDelete(t)}
//                       className="px-3 py-1 bg-red-500 text-white rounded"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Onboarding or Results */}
//         {!trip ? (
//           <Onboarding onGenerate={setTrip} user={user} />
//         ) : (
//           <Results
//             trip={trip}
//             onBack={() => setTrip(null)}
//             user={user}
//             onUpdateTrip={setTrip} // <--- important
//           />
//         )}
//       </main>

//       <Footer />

//       {/* Confirm Delete modal */}
//       <ConfirmModal
//         show={!!tripToDelete}
//         title="Delete Trip"
//         message={`Are you sure you want to delete "${tripToDelete?.title}"?`}
//         onCancel={() => setTripToDelete(null)}
//         onConfirm={() => deleteTrip(user.uid, tripToDelete.id)}
//       />
//     </div>
//   );
// }

// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Onboarding from "./pages/Onboarding";
import Results from "./pages/Results";
import Footer from "./components/Footer";
import ConfirmModal from "./components/ConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import {
  auth,
  onAuthStateChanged,
  db,
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "./utils/firebase";
import { generateTripPlan } from "./utils/tripPlanner";
import {
  clearUser,
  setLoading,
  setPastTrips,
  setUser,
} from "./store/slices/userSlice";
import { generateActiveTrip, setActiveTrip } from "./store/slices/tripSlice";

export default function App() {
  const dispatch = useDispatch();
  const { current: user, pastTrips, loading } = useSelector((s) => s.user);
  const { activeTrip } = useSelector((s) => s.trip);

  const [trip, setTrip] = useState(null);
  // const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [pastTrips, setPastTrips] = useState([]);
  const [tripToDelete, setTripToDelete] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Firebase auth & trip sync
  useEffect(() => {
    let unsubscribeTrips = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userObj = {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        };
        dispatch(setUser(userObj));
        //setUser(userObj);

        // realtime trip sync
        const tripsRef = collection(db, "users", userObj.uid, "itineraries");
        unsubscribeTrips = onSnapshot(tripsRef, (snapshot) => {
          const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          trips.sort((a, b) => {
            if ((b.favorite ? 1 : 0) === (a.favorite ? 1 : 0)) {
              return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
            return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
          });
          dispatch(setPastTrips(trips));
          //setPastTrips(trips);
        });
      } else {
        // setUser(null);
        // setPastTrips([]);
        dispatch(clearUser());
        if (unsubscribeTrips) unsubscribeTrips();
      }
      dispatch(setLoading(false));
      //setLoading(false);
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeTrips) unsubscribeTrips();
    };
  }, []);

  // 🔹 Delete Trip
  async function deleteTrip(uid, tripId) {
    if (!uid || !tripId) return;
    try {
      await deleteDoc(doc(db, "users", uid, "itineraries", tripId));
      console.log("🗑️ Trip deleted:", tripId);
    } catch (err) {
      console.error("❌ Error deleting trip:", err);
    } finally {
      setTripToDelete(null);
    }
  }

  // 🔹 Toggle favorite
  async function toggleFavorite(uid, tripId, currentValue) {
    if (!uid || !tripId) return;
    try {
      const ref = doc(db, "users", uid, "itineraries", tripId);
      await updateDoc(ref, { favorite: !currentValue });
      console.log("⭐ Favorite toggled:", tripId);
    } catch (err) {
      console.error("❌ Error toggling favorite:", err);
    }
  }
  useEffect(() => {
    async function updateItinerary() {
      if (!user || !trip) return;

      try {
        const ref = doc(db, "users", user.uid, "itineraries", trip.id);

        // 🔹 Use updateDoc (only updates changed fields)
        await updateDoc(ref, {
          ...trip,
        });

        console.log("🆙 Trip updated:", trip.id);
      } catch (err) {
        // 🔸 Handle case if document doesn't exist
        if (err.code === "not-found") {
          console.warn("Trip not found in Firestore, creating new...");
          await setDoc(ref, { ...trip, unsaved: false });
        } else {
          console.error("❌ Error updating itinerary:", err);
        }
      }
    }

    updateItinerary();
  }, [trip, user]);
  // 🔹 Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Navbar user={user} setUser={setUser} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
        <Routes>
          {/* 🏠 Onboarding Page */}
          <Route
            path="/"
            element={
              <>
                <Onboarding
                  // onGenerate={(tripData) => {
                  //   generateTripPlan(tripData,user, navigate);
                  //   //navigate("/results", { state: { trip: tripData } });
                  // }}
                  onGenerate={(trip) =>
                    dispatch(generateActiveTrip({ trip, user, navigate }))
                  }
                  user={user}
                  pastTrips={pastTrips}
                  toggleFavorite={toggleFavorite}
                  setTripToDelete={setTripToDelete}
                />
                {/* Saved Trips List */}
                {/* {user && pastTrips.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">
                      Your Saved Trips
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastTrips.map((t) => (
                        <div
                          key={t.id}
                          className="p-4 bg-white shadow rounded-lg relative"
                        >
                          <button
                            onClick={() =>
                              toggleFavorite(user.uid, t.id, t.favorite)
                            }
                            className="absolute top-2 right-2 text-yellow-500"
                            title={
                              t.favorite ? "Unfavorite" : "Mark as Favorite"
                            }
                          >
                            {t.favorite ? "⭐" : "☆"}
                          </button>

                          <div className="font-medium">{t.title}</div>
                          <div className="text-sm text-gray-500">
                            {t.days?.length || 0} days • Est. ₹{t.costEstimate}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() =>
                               {
                                debugger;
                                let data = {userId: user?.uid || "guest", tripId: t.uid};
                                const eqs = crypto.encryptForUrl(JSON.stringify(data))
                                navigate(`/results/${eqs}`, { state: { trip: t } })}
                              }
                              className="px-3 py-1 bg-blue-600 text-white rounded"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setTripToDelete(t)}
                              className="px-3 py-1 bg-red-500 text-white rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </>
            }
          />

          {/* 📍 Results Page */}
          <Route
            path="/results/:id"
            element={
              <Results
                trip={location.state?.trip}
                onBack={() => navigate("/")}
                user={user}
                onUpdateTrip={(updatedTrip) => {
                  setTrip(updatedTrip);
                }}
              />
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* Delete Modal */}
      <ConfirmModal
        show={!!tripToDelete}
        title="Delete Trip"
        message={`Are you sure you want to delete "${tripToDelete?.title}"?`}
        onCancel={() => setTripToDelete(null)}
        onConfirm={() => deleteTrip(user.uid, tripToDelete.id)}
      />
    </div>
  );
}
