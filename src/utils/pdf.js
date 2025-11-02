import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to strip unsupported Unicode and symbols
function safeText(text = "") {
  return text
    .replace(/[^\x00-\x7F]/g, "") // remove non-ASCII
    .replace(/₹/g, "Rs.")         // replace rupee symbol
    .trim();
}

export function exportTripToPDF(trip, user) {
  if (!trip) return;

  const doc = new jsPDF();
  let y = 20;

  // === Title ===
  doc.setFontSize(18);
  doc.text(safeText(trip.title || "My Trip"), 14, y);
  y += 10;

  // === Meta Info ===
  doc.setFontSize(12);
  doc.text(safeText(`Duration: ${trip.days.length} days`), 14, y); y += 8;
  if (trip.costEstimate)
    doc.text(safeText(`Estimated Cost: Rs.${trip.costEstimate.toLocaleString()}`), 14, y), (y += 8);
  if (user?.name)
    doc.text(safeText(`Planned by: ${user.name}`), 14, y), (y += 10);

  // === Trip Summary ===
  if (trip?.tripSummary) {
    doc.setFontSize(14);
    doc.text("Trip Summary", 14, y);
    y += 6;
    doc.setFontSize(11);
    const splitSummary = doc.splitTextToSize(safeText(trip.tripSummary), 180);
    doc.text(splitSummary, 14, y);
    y += splitSummary.length * 6 + 6;
  }

  // === Weather Summary ===
  if (trip?.tripInsights?.weatherImpact) {
    doc.setFontSize(14);
    doc.text("Weather Impact", 14, y);
    y += 6;
    doc.setFontSize(11);
    const splitWeather = doc.splitTextToSize(safeText(trip?.tripInsights?.weatherImpact), 180);
    doc.text(splitWeather, 14, y);
    y += splitWeather.length * 6 + 6;
  }

  // === Trip Insights (JSON) ===
  if (trip?.tripInsights && Object.keys(trip?.tripInsights).length > 0) {
    doc.setFontSize(14);
    doc.text("Trip Insights", 14, y);
    y += 8;
    doc.setFontSize(11);

    const insights = trip.tripInsights;

    const insightsData = [
      ["Budget", `Rs.${insights.budget?.toLocaleString() || "-"}`],
      ["Estimated Total Cost", `Rs.${insights.totalCostEstimate?.toLocaleString() || "-"}`],
      ["Efficiency Score", `${insights.efficiencyScore || 0}%`],
      ["Weather Impact", safeText(insights.weatherImpact || "N/A")],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: insightsData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [67, 56, 202] },
    });

    y = doc.lastAutoTable.finalY + 10;

    // === Category Breakdown Table ===
    if (Array.isArray(insights.categoryBreakdown)) {
      autoTable(doc, {
        startY: y,
        head: [["Category", "Value"]],
        body: insights.categoryBreakdown.map((c) => [safeText(c.name), c.value]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [99, 102, 241] },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // === Day-wise Spending Table ===
    if (Array.isArray(insights.daywiseSpending)) {
      autoTable(doc, {
        startY: y,
        head: [["Day", "Cost"]],
        body: insights.daywiseSpending.map((d) => [safeText(d.day), `Rs.${d.cost}`]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] },
      });
      y = doc.lastAutoTable.finalY + 10;
    }
  }

  // === Day-wise Itinerary ===
  trip.days.forEach((dayObj) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const rows = dayObj.items.map((it) => [
      safeText(it.time),
      safeText(it.title),
      safeText(it.category),
      safeText(it.bestTime),
      `${it.score || 0}%`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Day", "Activity", "Category", "Best Time", "Score"]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      showHead: "firstPage",
      didDrawPage: (data) => {
        // Add "Day X" title above each table
        doc.setFontSize(13);
        doc.text(`Day ${dayObj.day}`, 14, data.settings.startY - 4);
      },
    });

    y = doc.lastAutoTable.finalY + 10;
  });

  // === Save the PDF ===
  doc.save(`${safeText(trip.title) || "trip"}-itinerary.pdf`);
}
