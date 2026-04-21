import { r as reactExports, j as jsxRuntimeExports, g as ForwardRef, q as ForwardRef$1, F as ForwardRef$2, p as ForwardRef$3, s as ForwardRef$4, L as Link, k as ForwardRef$5, h as ForwardRef$6 } from "./react-vendor-1C0h7GIa.js";
import { q as getAnalyticsOverview, t as getAnalyticsRecords, v as getAnalyticsTrends } from "./api-DVYe6O7N.js";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, b as Bar, P as PieChart, h as Pie, i as Cell, f as Legend, L as LineChart, a as Line } from "./charts-DAd8QRTx.js";
import { f as format } from "./date-fns-CsZmCekP.js";
import "./vendor-DqMYeBgE.js";
function Analytics() {
  var _a, _b;
  const [overview, setOverview] = reactExports.useState(null);
  const [trends, setTrends] = reactExports.useState(null);
  const [records, setRecords] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [timeframe, setTimeframe] = reactExports.useState(30);
  const [trendMetric, setTrendMetric] = reactExports.useState("power");
  const [trendTimeframe, setTrendTimeframe] = reactExports.useState(90);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const powerZoneColors = {
    "Recovery": "#10b981",
    "Endurance": "#06b6d4",
    "Tempo": "#f59e0b",
    "Threshold": "#ef4444",
    "VO2Max": "#8b5cf6",
    "Anaerobic": "#ec4899"
  };
  reactExports.useEffect(() => {
    loadAnalytics();
  }, [timeframe]);
  reactExports.useEffect(() => {
    loadTrends();
  }, [trendMetric, trendTimeframe]);
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, recordsRes] = await Promise.all([
        getAnalyticsOverview(timeframe),
        getAnalyticsRecords()
      ]);
      setOverview(overviewRes.data);
      setRecords(recordsRes.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };
  const loadTrends = async () => {
    try {
      const trendsRes = await getAnalyticsTrends(trendMetric, trendTimeframe);
      setTrends(trendsRes.data);
    } catch (error) {
      console.error("Failed to load trends:", error);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" }) }) });
  }
  const frequencyData = ((_a = overview == null ? void 0 : overview.frequency) == null ? void 0 : _a.map((f) => ({
    day: dayNames[f.day_of_week],
    rides: parseInt(f.ride_count)
  }))) || [];
  const powerZoneData = ((_b = overview == null ? void 0 : overview.powerZones) == null ? void 0 : _b.map((pz) => ({
    name: pz.zone,
    rides: parseInt(pz.ride_count),
    duration: parseInt(pz.total_duration)
  }))) || [];
  const trendData = ((trends == null ? void 0 : trends.data) || []).map((t) => {
    const value = Number(t.avg_value);
    const max = Number(t.max_value);
    return {
      date: format(new Date(t.date), "MMM d"),
      value: Number.isFinite(value) ? value : null,
      max: Number.isFinite(max) ? max : null
    };
  }).filter((d) => d.value !== null || d.max !== null);
  const trendUnit = trendMetric === "power" ? "W" : trendMetric === "speed" ? "mph" : trendMetric === "hr" ? "bpm" : trendMetric === "cadence" ? "rpm" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Analytics" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Track your progress and performance trends" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: [7, 30, 90, 365].map((days) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTimeframe(days),
          className: `px-4 py-2 rounded-lg font-semibold transition-all ${timeframe === days ? "bg-gradient-to-r from-velo-cyan to-velo-teal text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
          children: [
            days,
            "d"
          ]
        },
        days
      )) })
    ] }),
    overview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "h-8 w-8 opacity-80" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium opacity-90 mb-1", children: "Total Rides" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-4xl font-black", children: overview.stats.total_rides || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-75 mt-2", children: [
          "Last ",
          timeframe,
          " days"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl shadow-xl p-6 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "h-8 w-8 opacity-80" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium opacity-90 mb-1", children: "Total Distance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "text-4xl font-black", children: [
          overview.stats.total_distance ? (overview.stats.total_distance / 1609.34).toFixed(0) : 0,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-normal ml-1", children: "mi" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-75 mt-2", children: overview.stats.total_elevation ? `${Math.round(overview.stats.total_elevation * 3.28084)} ft climbed` : "No elevation data" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$2, { className: "h-8 w-8 opacity-80" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium opacity-90 mb-1", children: "Avg Power" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "text-4xl font-black", children: [
          overview.stats.avg_power ? Math.round(overview.stats.avg_power) : 0,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-normal ml-1", children: "W" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-75 mt-2", children: [
          "Peak: ",
          overview.stats.peak_power ? Math.round(overview.stats.peak_power) : 0,
          "W"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$3, { className: "h-8 w-8 opacity-80" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium opacity-90 mb-1", children: "Total Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "text-4xl font-black", children: [
          overview.stats.total_time ? (overview.stats.total_time / 3600).toFixed(0) : 0,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-normal ml-1", children: "hrs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-75 mt-2", children: overview.stats.avg_hr ? `Avg HR: ${Math.round(overview.stats.avg_hr)} bpm` : "No HR data" })
      ] })
    ] }),
    records && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$4, { className: "w-8 h-8 text-yellow-500" }),
        "Personal Records"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
        records.longestRide && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/sessions/${records.longestRide.id}`,
            className: "p-4 border-2 border-gray-200 rounded-xl hover:border-cyan-500 transition-all group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-500", children: "Longest Ride" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "w-5 h-5 text-gray-400 group-hover:text-cyan-500" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
                (records.longestRide.distance / 1609.34).toFixed(2),
                " mi"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: format(new Date(records.longestRide.start_time), "MMM d, yyyy") })
            ]
          }
        ),
        records.highestElevation && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/sessions/${records.highestElevation.id}`,
            className: "p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 transition-all group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-500", children: "Highest Elevation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$5, { className: "w-5 h-5 text-gray-400 group-hover:text-teal-500" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
                Math.round(records.highestElevation.elevation_gain * 3.28084),
                " ft"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: format(new Date(records.highestElevation.start_time), "MMM d, yyyy") })
            ]
          }
        ),
        records.highestPower && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/sessions/${records.highestPower.id}`,
            className: "p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-all group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-500", children: "Highest Avg Power" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$2, { className: "w-5 h-5 text-gray-400 group-hover:text-orange-500" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
                Math.round(records.highestPower.average_power),
                " W"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: format(new Date(records.highestPower.start_time), "MMM d, yyyy") })
            ]
          }
        ),
        records.fastestSpeed && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/sessions/${records.fastestSpeed.id}`,
            className: "p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-500", children: "Fastest Avg Speed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$6, { className: "w-5 h-5 text-gray-400 group-hover:text-blue-500" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
                records.fastestSpeed.avg_speed.toFixed(1),
                " mph"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: format(new Date(records.fastestSpeed.start_time), "MMM d, yyyy") })
            ]
          }
        ),
        records.longestDuration && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/sessions/${records.longestDuration.id}`,
            className: "p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-500", children: "Longest Duration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$3, { className: "w-5 h-5 text-gray-400 group-hover:text-purple-500" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
                (records.longestDuration.duration / 3600).toFixed(1),
                " hrs"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: format(new Date(records.longestDuration.start_time), "MMM d, yyyy") })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8", children: [
      frequencyData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: "Ride Frequency by Day" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: frequencyData, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "rides", fill: "#06b6d4" })
        ] }) })
      ] }),
      powerZoneData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: "Power Zone Distribution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 250, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Pie,
            {
              data: powerZoneData,
              dataKey: "rides",
              nameKey: "name",
              cx: "50%",
              cy: "50%",
              outerRadius: 80,
              label: true,
              children: powerZoneData.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: powerZoneColors[entry.name] }, `cell-${index}`))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {})
        ] }) })
      ] })
    ] }),
    trends && trendData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Performance Trends" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: trendMetric,
              onChange: (e) => setTrendMetric(e.target.value),
              className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "power", children: "Power" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "speed", children: "Speed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hr", children: "Heart Rate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cadence", children: "Cadence" })
              ]
            }
          ),
          [30, 90, 180, 365].map((days) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setTrendTimeframe(days),
              className: `px-3 py-2 rounded-lg font-semibold transition-all ${trendTimeframe === days ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
              children: [
                days,
                "d"
              ]
            },
            days
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: trendData, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: ["auto", "auto"], tickFormatter: (v) => `${Number(v).toFixed(0)}${trendUnit ? ` ${trendUnit}` : ""}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => v === null || v === void 0 ? "N/A" : `${Number(v).toFixed(1)}${trendUnit ? ` ${trendUnit}` : ""}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: "value",
            stroke: "#06b6d4",
            strokeWidth: 2,
            name: "Average",
            dot: false,
            connectNulls: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: "max",
            stroke: "#10b981",
            strokeWidth: 2,
            name: "Maximum",
            dot: false,
            connectNulls: true
          }
        )
      ] }) })
    ] }),
    (!overview || overview.stats.total_rides === "0") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 bg-white rounded-2xl shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$5, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-gray-600 mb-2", children: "No ride data available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Complete some rides to see your analytics!" })
    ] })
  ] });
}
export {
  Analytics as default
};
