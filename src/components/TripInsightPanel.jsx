import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  ParkingMeter,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { askGemini } from "../utils/gemini";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

export default function TripInsightsPanel({ trip,setTripInsights }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showActual, setShowActual] = useState(false);

  async function generateInsights() {
    setLoading(true);
    try {
      const prompt = `
        You are a travel analyst AI.
        Analyze the following trip and output only JSON:
        {
          "totalCostEstimate": number,
          "budget": number,
          "categoryBreakdown": [{ "name": string, "value": number }],
          "efficiencyScore": number,
          "weatherImpact": string,
          "daywiseSpending": [{ "day": string, "cost": number }]
        }
        Trip: ${JSON.stringify(trip, null, 2)}
      `;
      const aiRes = await askGemini(prompt);
      const match = aiRes.match(/\{[\s\S]*\}/);
      const json = match ? JSON.parse(match[0]) : {};
      setInsights(json);
      setTripInsights(json);
    } catch (err) {
      console.error("❌ Insight generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (trip.id) generateInsights();
  }, [trip.id]);

  if (!trip) return null;

  // Compute actual spend data
  const actualBreakdown =
    trip.expenses?.length > 0
      ? Object.entries(
          trip.expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
          }, {})
        ).map(([name, value]) => ({ name, value }))
      : [];

  const breakdownData = showActual
    ? actualBreakdown
    : insights?.categoryBreakdown || [];
  const totalActivities = useMemo(() => {
    return trip?.days?.reduce((sum, d) => sum + d.items.length, 0) || 0;
  }, [trip]);
  const avgScore = useMemo(() => {
    let total = 0;
    let count = 0;
    trip?.days?.forEach((d) =>
      d.items.forEach((it) => {
        if (it.score) {
          total += it.score;
          count++;
        }
      })
    );
    return count > 0 ? (total / count).toFixed(1) : 0;
  }, [trip]);
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    trip?.days?.forEach((d) =>
      d.items.forEach((it) => {
        counts[it.category] = (counts[it.category] || 0) + 1;
      })
    );
    return counts;
  }, [trip]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 space-y-5"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">
          📊 Trip Insights & Analytics
        </h3>
        <div className="flex gap-3 items-center">
          {trip.expenses?.length > 0 && (
            <label className="text-sm text-gray-600 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showActual}
                onChange={() => setShowActual((s) => !s)}
              />
              Show Actual Spend
            </label>
          )}
          <button
            onClick={generateInsights}
            className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-gray-500 animate-pulse"
          >
            Analyzing your trip insights...
          </motion.div>
        ) : insights ? (
          <motion.div
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 💰 Budget Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-3">
              <motion.div
                className="bg-green-50 rounded-xl p-4 shadow-sm"
                whileHover={{ scale: 1.03 }}
              >
                <CalendarDays
                  className="mx-auto text-green-600 mb-1"
                  size={22}
                />
                <div className="text-lg font-semibold text-green-800">
                  {trip?.days?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Total Days</div>
              </motion.div>

              <motion.div
                className="bg-indigo-50 rounded-xl p-4 shadow-sm"
                whileHover={{ scale: 1.03 }}
              >
                <Wallet className="mx-auto text-indigo-600 mb-1" size={22} />
                <div className="text-lg font-semibold text-indigo-800">
                  ₹{trip.budget?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Budget</div>
              </motion.div>
              <motion.div
                className="bg-indigo-50 rounded-xl p-4 shadow-sm"
                whileHover={{ scale: 1.03 }}
              >
                <Wallet className="mx-auto text-indigo-600 mb-1" size={22} />
                <div className="text-lg font-semibold text-indigo-800">
                  ₹{insights.totalCostEstimate?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Estimated Cost</div>
              </motion.div>

              <motion.div
                className="bg-yellow-50 rounded-xl p-4 shadow-sm"
                whileHover={{ scale: 1.03 }}
              >
                <TrendingUp
                  className="mx-auto text-yellow-600 mb-1"
                  size={22}
                />
                <div className="text-lg font-semibold text-yellow-800">
                  {avgScore}%
                </div>
                <div className="text-sm text-gray-500">Avg Activity Score</div>
              </motion.div>

              <motion.div
                className="bg-pink-50 rounded-xl p-4 shadow-sm"
                whileHover={{ scale: 1.03 }}
              >
                <div className="mx-auto text-pink-600 mb-1 font-bold text-xl">
                  📍
                </div>
                <div className="text-lg font-semibold text-pink-800">
                  {totalActivities}
                </div>
                <div className="text-sm text-gray-500">Activities Planned</div>
              </motion.div>

              <motion.div
                className="bg-pink-50 rounded-xl p-4 shadow-sm"
                whileHover={{ scale: 1.03 }}
              >
                <ParkingMeter
                  className="mx-auto text-yellow-600 mb-1"
                  size={22}
                />
                <div className="text-lg font-semibold text-pink-800">
                  {insights.efficiencyScore}%
                </div>
                <div className="text-sm text-gray-500">Efficiency</div>
              </motion.div>
            </div>
            {Object.keys(categoryBreakdown).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-indigo-700 mb-2">
                  Category Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  {Object.entries(categoryBreakdown).map(([cat, count]) => (
                    <div
                      key={cat}
                      className="flex justify-between bg-gray-50 p-2 rounded-md border border-gray-100"
                    >
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* 🧾 Category Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                layout
                className="bg-white border rounded-xl p-4 shadow-sm"
              >
                <h4 className="text-sm font-semibold mb-2">
                  💸 {showActual ? "Actual" : "Predicted"} Category Breakdown
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label
                    >
                      {breakdownData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* 📆 Daywise Trend */}
              <motion.div
                layout
                className="bg-white border rounded-xl p-4 shadow-sm"
              >
                <h4 className="text-sm font-semibold mb-2">
                  📅 Day-wise Cost Trend
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={insights.daywiseSpending}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* 🌤️ Weather Insights */}
            <motion.div
              layout
              className="bg-blue-50 rounded-xl p-4 text-blue-800 mt-4"
            >
              <h4 className="font-semibold mb-1">🌦️ Weather Insights</h4>
              <p className="text-sm">
                {insights.weatherImpact || "No significant weather concerns."}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <p className="text-gray-500 text-sm italic text-center">
            No insights yet. Try refreshing.
          </p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
