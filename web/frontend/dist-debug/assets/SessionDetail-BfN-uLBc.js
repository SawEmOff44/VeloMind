import { z as useParams, r as reactExports, j as jsxRuntimeExports, A as ForwardRef, C as ForwardRef$1 } from "./react-vendor-1C0h7GIa.js";
import { e as getSession, f as getSessionAnalytics, h as syncStravaStreams, i as buildApiUrl } from "./api-DVYe6O7N.js";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Line, B as BarChart, b as Bar } from "./charts-DAd8QRTx.js";
import { f as format } from "./date-fns-CsZmCekP.js";
import "./vendor-DqMYeBgE.js";
function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = reactExports.useState(null);
  const [analytics, setAnalytics] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [syncing, setSyncing] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadSession();
  }, [id]);
  const loadSession = async () => {
    try {
      const [sessionRes, analyticsRes] = await Promise.all([
        getSession(id),
        getSessionAnalytics(id)
      ]);
      setSession(sessionRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSyncStreams = async () => {
    var _a, _b;
    if (!(session == null ? void 0 : session.strava_activity_id)) {
      alert("This session is not from Strava");
      return;
    }
    setSyncing(true);
    try {
      const response = await syncStravaStreams(id);
      alert(`Successfully synced ${response.data.dataPoints} data points!`);
      await loadSession();
    } catch (error) {
      console.error("Failed to sync streams:", error);
      alert("Failed to sync Strava data. " + (((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.error) || error.message));
    } finally {
      setSyncing(false);
    }
  };
  const handleExport = (format2) => {
    const token = localStorage.getItem("token");
    const url = buildApiUrl(`/export/session/${id}/${format2}`);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    link.style.display = "none";
    fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then((response) => response.blob()).then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }).catch((error) => {
      console.error("Export failed:", error);
      alert("Failed to export session");
    });
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Loading..." }) });
  }
  if (!session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Session not found" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: session.name || "Unnamed Session" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: format(new Date(session.start_time), "PPp") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        session.source === "strava" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleSyncStreams,
            disabled: syncing,
            className: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: `w-5 h-5 ${syncing ? "animate-spin" : ""}` }),
              syncing ? "Syncing..." : "Sync Strava Data"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleExport("csv"),
            className: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all font-semibold",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "w-5 h-5" }),
              "CSV"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleExport("tcx"),
            className: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-semibold",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "w-5 h-5" }),
              "TCX"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Distance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          (session.distance / 1609.34).toFixed(1),
          " mi"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Duration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          Math.round(session.duration / 60),
          " min"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Avg Power" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          Math.round(session.average_power),
          " W"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Normalized Power" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          Math.round(session.normalized_power),
          " W"
        ] })
      ] })
    ] }),
    analytics && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4", children: "Power Curve" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: analytics.powerCurve, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "duration", label: { value: "Duration (s)", position: "insideBottom", offset: -5 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { label: { value: "Power (W)", angle: -90, position: "insideLeft" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "power", stroke: "#3b82f6", strokeWidth: 2 })
        ] }) })
      ] }),
      analytics.elevationProfile && analytics.elevationProfile.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4", children: "Elevation Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: analytics.elevationProfile, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "distance", label: { value: "Distance (m)", position: "insideBottom", offset: -5 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { label: { value: "Altitude (m)", angle: -90, position: "insideLeft" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "altitude", stroke: "#10b981", strokeWidth: 2 })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4", children: "Power Distribution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: [
          { zone: "Z1", time: analytics.powerZones.z1 },
          { zone: "Z2", time: analytics.powerZones.z2 },
          { zone: "Z3", time: analytics.powerZones.z3 },
          { zone: "Z4", time: analytics.powerZones.z4 },
          { zone: "Z5", time: analytics.powerZones.z5 }
        ], children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "zone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { label: { value: "Time (s)", angle: -90, position: "insideLeft" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "time", fill: "#3b82f6" })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  SessionDetail as default
};
