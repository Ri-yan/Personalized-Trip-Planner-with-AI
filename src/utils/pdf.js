import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // just import — no need to register

export function exportTripToPDF(trip, user) {
  if (!trip) return;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(trip.title || "My Trip", 14, 20);

  // Meta
  doc.setFontSize(12);
  doc.text(`Duration: ${trip.days.length} days`, 14, 30);
  doc.text(`Estimated Cost: ₹${trip.costEstimate}`, 14, 38);
  if (user?.name) doc.text(`Planned by: ${user.name}`, 14, 46);

  // Loop days
  let startY = 55;
  trip.days.forEach((dayObj, i) => {
    const rows = dayObj.items.map((it) => [
      it.time,
      it.title,
      it.category,
      it.bestTime,
      `${it.score}%`,
    ]);

    autoTable(doc, {
      startY,
      head: [
        [`Day ${dayObj.day}`, "Activity", "Category", "Best Time", "Score"],
      ],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      didDrawPage: (data) => {
        startY = data.cursor.y + 15;
      },
    });
  });

  doc.save(`${trip.title || "trip"}-itinerary.pdf`);
}
