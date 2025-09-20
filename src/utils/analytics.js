import { collection, addDoc, db } from "firebase/firestore";

async function logAnalytics(trip, user) {
  try {
    const ref = collection(db, "analytics");
    await addDoc(ref, {
      uid: user?.uid || "guest",
      destination: trip.title,
      budget: trip.budget,
      days: trip.days.length,
      persona: trip.persona,
      createdAt: new Date().toISOString(),
    });
    console.log("📊 Logged analytics event");
  } catch (err) {
    console.error("❌ Analytics log failed:", err);
  }
}
