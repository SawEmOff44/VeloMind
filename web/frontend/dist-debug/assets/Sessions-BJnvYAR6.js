import { r as reactExports, j as jsxRuntimeExports, L as Link } from "./react-vendor-1C0h7GIa.js";
import { g as getSessions, s as syncStravaActivities, c as refreshAllStravaStreams, d as deleteSession } from "./api-DVYe6O7N.js";
import { f as format } from "./date-fns-CsZmCekP.js";
import "./vendor-DqMYeBgE.js";
import "./charts-DAd8QRTx.js";
function Sessions() {
  const [sessions, setSessions] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [syncing, setSyncing] = reactExports.useState(false);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadSessions();
  }, []);
  const loadSessions = async () => {
    try {
      const response = await getSessions(50, 0);
      setSessions(response.data.sessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSync = async () => {
    var _a, _b, _c;
    setSyncing(true);
    try {
      const response = await syncStravaActivities();
      console.log("Sync response:", response.data);
      if (response.data.error) {
        alert(`Error: ${response.data.error}`);
      } else {
        const imported = response.data.imported || 0;
        const skipped = response.data.skipped || 0;
        const total = response.data.total || 0;
        alert(`Sync complete! Imported ${imported} new activities. ${skipped} were already imported. Found ${total} total cycling activities in last 30 days.`);
        await loadSessions();
      }
    } catch (error) {
      console.error("Failed to sync Strava activities:", error);
      console.error("Error response:", (_a = error.response) == null ? void 0 : _a.data);
      alert(((_c = (_b = error.response) == null ? void 0 : _b.data) == null ? void 0 : _c.error) || "Failed to sync Strava activities. Make sure you have connected your Strava account in Settings.");
    } finally {
      setSyncing(false);
    }
  };
  const handleRefreshStreams = async () => {
    var _a, _b;
    setRefreshing(true);
    try {
      const response = await refreshAllStravaStreams();
      console.log("Refresh streams response:", response.data);
      if (response.data.error) {
        alert(`Error: ${response.data.error}`);
      } else {
        const refreshed = response.data.refreshed || 0;
        const failed = response.data.failed || 0;
        alert(`Refreshed detailed data for ${refreshed} sessions!${failed > 0 ? ` (${failed} failed)` : ""}`);
        await loadSessions();
      }
    } catch (error) {
      console.error("Failed to refresh streams:", error);
      alert(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.error) || "Failed to refresh Strava data.");
    } finally {
      setRefreshing(false);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Sessions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleRefreshStreams,
            disabled: refreshing,
            className: "inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed",
            children: refreshing ? "Refreshing..." : "Refresh Stream Data"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleSync,
            disabled: syncing,
            className: "inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed",
            children: syncing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              "Syncing..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 mr-2", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" }) }),
              "Sync from Strava"
            ] })
          }
        )
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Loading..." }) : sessions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 bg-white rounded-lg shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 mb-4", children: "No sessions yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Sessions are created from the iOS app" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block bg-white shadow overflow-hidden sm:rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Distance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Avg Power" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: sessions.map((session) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: format(new Date(session.start_time), "PP") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: `/sessions/${session.id}`,
              className: "text-velo-cyan-600 hover:text-velo-cyan-800 font-semibold",
              children: session.name || "Unnamed Session"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [
            (session.distance / 1609.34).toFixed(1),
            " mi"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [
            Math.round(session.duration / 60),
            " min"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [
            Math.round(session.average_power),
            " W"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleDelete(session.id),
              className: "text-red-600 hover:text-red-900 font-medium",
              children: "Delete"
            }
          ) })
        ] }, session.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-4", children: sessions.map((session) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow p-4 border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/sessions/${session.id}`,
            className: "block mb-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-1", children: session.name || "Unnamed Session" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: format(new Date(session.start_time), "PP") })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-cyan-50 to-teal-50 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mb-1", children: "Distance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-gray-900", children: [
              (session.distance / 1609.34).toFixed(1),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "mi" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mb-1", children: "Duration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-gray-900", children: [
              Math.round(session.duration / 60),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "min" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-green-50 to-cyan-50 rounded-lg p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mb-1", children: "Power" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-gray-900", children: [
              Math.round(session.average_power),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal ml-1", children: "W" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleDelete(session.id),
            className: "w-full py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors",
            children: "Delete Session"
          }
        )
      ] }, session.id)) })
    ] })
  ] });
}
export {
  Sessions as default
};
