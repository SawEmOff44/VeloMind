import { j as jsxRuntimeExports, i as ForwardRef, F as ForwardRef$1, h as ForwardRef$2, l as ForwardRef$3, n as ForwardRef$4, r as reactExports, g as ForwardRef$5, L as Link, o as ForwardRef$6, p as ForwardRef$7, q as ForwardRef$8, s as ForwardRef$9, t as ForwardRef$a, v as ForwardRef$b, w as ForwardRef$c, x as ForwardRef$d, k as ForwardRef$e, y as ForwardRef$f } from "./react-vendor-1C0h7GIa.js";
import { g as getSessions, a as getIntelligenceSummary, b as getActiveParameters, u as updateParameters } from "./api-DVYe6O7N.js";
import { f as format, s as startOfDay, a as formatDistanceToNow, i as isSameDay, b as subDays } from "./date-fns-CsZmCekP.js";
import "./vendor-DqMYeBgE.js";
import "./charts-DAd8QRTx.js";
function IntelligenceDashboard({ rideData, intelligenceData }) {
  var _a, _b, _c, _d;
  if (!intelligenceData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-800 rounded-lg p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400", children: "No intelligence data available" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    intelligenceData.alerts && intelligenceData.alerts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-white", children: "Active Alerts" }),
      intelligenceData.alerts.map((alert2, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(AlertBanner, { alert: alert2 }, idx))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "w-6 h-6" }),
          title: "Environmental Load",
          value: `+${((_a = intelligenceData.environmentalLoad) == null ? void 0 : _a.toFixed(1)) || 0}%`,
          subtitle: "effort cost",
          color: "orange"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "w-6 h-6" }),
          title: "Effort Budget",
          value: `${((_b = intelligenceData.effortBudget) == null ? void 0 : _b.toFixed(0)) || 100}%`,
          subtitle: "remaining",
          color: getBudgetColor(intelligenceData.effortBudget),
          progress: intelligenceData.effortBudget
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$2, { className: "w-6 h-6" }),
          title: "Training Stress",
          value: ((_c = intelligenceData.tss) == null ? void 0 : _c.toFixed(0)) || 0,
          subtitle: "TSS",
          color: "red"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MetricCard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$3, { className: "w-6 h-6" }),
          title: "Calories Burned",
          value: ((_d = intelligenceData.caloriesBurned) == null ? void 0 : _d.toFixed(0)) || 0,
          subtitle: "kcal",
          color: "purple"
        }
      ),
      intelligenceData.predictedSpeed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 md:col-span-2 bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "w-6 h-6 text-cyan-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Wind-Aware Prediction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-cyan-400", children: [
            "~",
            intelligenceData.predictedSpeed.speed.toFixed(1),
            " mph"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
            "(",
            intelligenceData.predictedSpeed.condition,
            ")"
          ] })
        ] })
      ] }) }),
      intelligenceData.upcomingClimb && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 md:col-span-2 bg-red-900/20 border border-red-500/30 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6 text-red-400 transform rotate-45", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10 3l7 7-7 7V3z" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "Upcoming Climb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-red-400", children: [
            intelligenceData.upcomingClimb.distance.toFixed(1),
            " mi @ ",
            intelligenceData.upcomingClimb.grade.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
            "Recommended: ",
            intelligenceData.upcomingClimb.recommendedPower,
            " watts"
          ] })
        ] })
      ] }) })
    ] }),
    intelligenceData.fatigueDrift && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$4, { className: "w-6 h-6 text-yellow-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-yellow-400", children: "Fatigue Detected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-300", children: intelligenceData.fatigueDrift.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          "Efficiency drop: ",
          (intelligenceData.fatigueDrift.efficiencyDrop * 100).toFixed(1),
          "%"
        ] })
      ] })
    ] }) }),
    (rideData == null ? void 0 : rideData.ftp) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-800 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold text-gray-400 mb-2", children: [
        "Power Zones (based on FTP: ",
        rideData.ftp,
        "W)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PowerZone, { zone: "Recovery", range: `< ${Math.round(rideData.ftp * 0.55)}W`, color: "gray" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PowerZone, { zone: "Endurance", range: `${Math.round(rideData.ftp * 0.55)}-${Math.round(rideData.ftp * 0.75)}W`, color: "blue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PowerZone, { zone: "Tempo", range: `${Math.round(rideData.ftp * 0.75)}-${Math.round(rideData.ftp * 0.9)}W`, color: "green" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PowerZone, { zone: "Threshold", range: `${Math.round(rideData.ftp * 0.9)}-${Math.round(rideData.ftp * 1.05)}W`, color: "yellow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PowerZone, { zone: "VO2 Max", range: `${Math.round(rideData.ftp * 1.05)}-${Math.round(rideData.ftp * 1.2)}W`, color: "orange" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PowerZone, { zone: "Anaerobic", range: `> ${Math.round(rideData.ftp * 1.2)}W`, color: "red" })
      ] })
    ] })
  ] });
}
function AlertBanner({ alert: alert2 }) {
  const severityColors = {
    critical: "bg-red-900/30 border-red-500",
    high: "bg-orange-900/30 border-orange-500",
    medium: "bg-yellow-900/30 border-yellow-500",
    low: "bg-blue-900/30 border-blue-500"
  };
  const severityIcons = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🔵"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${severityColors[alert2.severity] || severityColors.medium} border rounded-lg p-4`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: severityIcons[alert2.severity] || "⚠️" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white font-medium", children: alert2.message }),
      alert2.details && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: alert2.details })
    ] })
  ] }) });
}
function MetricCard({ icon, title, value, subtitle, color, progress }) {
  const colorClasses = {
    orange: "text-orange-400 bg-orange-900/20 border-orange-500/30",
    green: "text-green-400 bg-green-900/20 border-green-500/30",
    red: "text-red-400 bg-red-900/20 border-red-500/30",
    yellow: "text-yellow-400 bg-yellow-900/20 border-yellow-500/30",
    purple: "text-purple-400 bg-purple-900/20 border-purple-500/30",
    blue: "text-blue-400 bg-blue-900/20 border-blue-500/30",
    gray: "text-gray-400 bg-gray-900/20 border-gray-500/30"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${colorClasses[color] || colorClasses.gray} border rounded-lg p-4`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: colorClasses[color], children: icon }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mb-1", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${colorClasses[color].split(" ")[0]}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: subtitle }),
    progress !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 w-full bg-gray-700 rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `h-2 rounded-full ${color === "green" ? "bg-green-500" : color === "yellow" ? "bg-yellow-500" : "bg-red-500"}`,
        style: { width: `${progress}%` }
      }
    ) })
  ] });
}
function PowerZone({ zone, range, color }) {
  const colorClasses = {
    gray: "bg-gray-600",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-3 h-3 rounded-full ${colorClasses[color]}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-300 flex-1", children: zone }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-500", children: range })
  ] });
}
function getBudgetColor(budget) {
  if (budget > 60) return "green";
  if (budget > 30) return "yellow";
  return "red";
}
function ActivityFeed({ limit = 10 }) {
  const [activities, setActivities] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [groupedActivities, setGroupedActivities] = reactExports.useState({});
  reactExports.useEffect(() => {
    loadActivities();
  }, [limit]);
  const loadActivities = async () => {
    try {
      const response = await getSessions(limit, 0);
      const sessions = response.data.sessions || [];
      const grouped = sessions.reduce((acc, session) => {
        const date = format(startOfDay(new Date(session.start_time)), "yyyy-MM-dd");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(session);
        return acc;
      }, {});
      setActivities(sessions);
      setGroupedActivities(grouped);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };
  const getActivityIcon = (session) => {
    if (session.average_power > 250) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "w-5 h-5 text-orange-500" });
    }
    if (session.distance > 1e5) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$9, { className: "w-5 h-5 text-yellow-500" });
    }
    if (session.elevation_gain > 1e3) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$8, { className: "w-5 h-5 text-green-500" });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$5, { className: "w-5 h-5 text-cyan-500" });
  };
  const getActivityBadge = (session) => {
    const badges = [];
    if (session.average_power > 300) {
      badges.push({ label: "High Power", color: "bg-orange-100 text-orange-700" });
    }
    if (session.distance > 16e4) {
      badges.push({ label: "Century", color: "bg-purple-100 text-purple-700" });
    }
    if (session.elevation_gain > 2e3) {
      badges.push({ label: "Climber", color: "bg-green-100 text-green-700" });
    }
    if (session.duration > 14400) {
      badges.push({ label: "Endurance", color: "bg-blue-100 text-blue-700" });
    }
    return badges;
  };
  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const now = /* @__PURE__ */ new Date();
    if (isSameDay(date, now)) {
      return "Today";
    }
    if (isSameDay(date, subDays(now, 1))) {
      return "Yesterday";
    }
    if (date > subDays(now, 7)) {
      return format(date, "EEEE");
    }
    return format(date, "MMMM d, yyyy");
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" }) });
  }
  if (activities.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$5, { className: "h-12 w-12 text-gray-300 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 font-medium", children: "No recent activity" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Your rides will appear here" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: Object.keys(groupedActivities).sort((a, b) => new Date(b) - new Date(a)).map((dateStr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-600 px-3 py-1 bg-gray-100 rounded-full", children: getDateLabel(dateStr) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: groupedActivities[dateStr].map((session) => {
      const badges = getActivityBadge(session);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: `/sessions/${session.id}`,
          className: "block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-cyan-300",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-gray-50 rounded-lg", children: getActivityIcon(session) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900 truncate", children: session.name || "Unnamed Ride" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
                      format(new Date(session.start_time), "h:mm a"),
                      " • ",
                      formatDistanceToNow(new Date(session.start_time), { addSuffix: true })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$6, { className: "w-5 h-5 text-green-500 flex-shrink-0" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$5, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      (session.distance / 1609.34).toFixed(1),
                      " mi"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$7, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      Math.round(session.duration / 60),
                      " min"
                    ] })
                  ] }),
                  session.average_power && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      Math.round(session.average_power),
                      "W"
                    ] })
                  ] }),
                  session.elevation_gain > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$8, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      Math.round(session.elevation_gain * 3.28084),
                      "ft"
                    ] })
                  ] })
                ] }),
                badges.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: badges.map((badge, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`,
                    children: badge.label
                  },
                  idx
                )) })
              ] })
            ] }) }),
            session.average_power && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 bg-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-full bg-gradient-to-r from-cyan-500 to-blue-500",
                style: { width: `${Math.min(session.average_power / 300 * 100, 100)}%` }
              }
            ) })
          ]
        },
        session.id
      );
    }) })
  ] }, dateStr)) });
}
function Dashboard() {
  const [sessions, setSessions] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [intelligenceTimeframe, setIntelligenceTimeframe] = reactExports.useState(30);
  const [intelligenceSummary, setIntelligenceSummary] = reactExports.useState(null);
  const [intelligenceLoading, setIntelligenceLoading] = reactExports.useState(false);
  const [userProfile, setUserProfile] = reactExports.useState({
    name: "Cyclist",
    email: "",
    photo: null,
    ftp: 250,
    weight: 85,
    bike: {
      name: "My Bike",
      weight: 8.5,
      type: "Road"
    }
  });
  const [editingProfile, setEditingProfile] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadSessions();
    loadUserProfile();
  }, []);
  const syncFitnessProfileFromDashboard = async (profile) => {
    var _a;
    try {
      const activeResp = await getActiveParameters();
      const active = (_a = activeResp == null ? void 0 : activeResp.data) == null ? void 0 : _a.parameters;
      if (!(active == null ? void 0 : active.id)) return;
      const ftpValue = Number(profile == null ? void 0 : profile.ftp);
      const massValue = Number(profile == null ? void 0 : profile.weight);
      if (!Number.isFinite(ftpValue) || !Number.isFinite(massValue)) return;
      await updateParameters(active.id, {
        name: active.name,
        mass: massValue,
        cda: Number(active.cda),
        crr: Number(active.crr),
        drivetrain_loss: Number(active.drivetrain_loss),
        ftp: ftpValue,
        position: active.position,
        is_active: true
      });
    } catch (e) {
      console.warn("Failed to sync fitness profile from dashboard:", e);
    }
  };
  const persistUserProfile = (profile) => {
    try {
      localStorage.setItem("userProfile", JSON.stringify(profile));
      return true;
    } catch (e) {
      console.error("Failed to persist userProfile to localStorage:", e);
      return false;
    }
  };
  reactExports.useEffect(() => {
    loadIntelligenceSummary(intelligenceTimeframe);
  }, [intelligenceTimeframe]);
  const loadUserProfile = () => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved userProfile:", e);
      }
    }
  };
  const saveUserProfile = () => {
    const ok = persistUserProfile(userProfile);
    if (!ok) {
      alert("Could not save profile (storage full). Try a smaller photo.");
      return;
    }
    setEditingProfile(false);
    void syncFitnessProfileFromDashboard(userProfile);
  };
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const dataUrl = reader.result;
          const img = new Image();
          img.onload = () => {
            const MAX_SIZE = 256;
            const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL("image/jpeg", 0.85);
            const updated = { ...userProfile, photo: compressed };
            setUserProfile(updated);
            const ok = persistUserProfile(updated);
            if (!ok) {
              alert("Photo too large to save. Try a smaller image.");
            }
          };
          img.src = dataUrl;
        } catch (err) {
          console.error("Photo upload failed:", err);
          alert("Failed to process photo");
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const loadSessions = async () => {
    try {
      const response = await getSessions(10, 0);
      setSessions(response.data.sessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };
  const loadIntelligenceSummary = async (timeframe) => {
    setIntelligenceLoading(true);
    try {
      const response = await getIntelligenceSummary(timeframe);
      setIntelligenceSummary(response.data);
    } catch (error) {
      console.error("Failed to load intelligence summary:", error);
      setIntelligenceSummary(null);
    } finally {
      setIntelligenceLoading(false);
    }
  };
  const stats = sessions.length > 0 ? {
    totalSessions: sessions.length,
    totalDistance: sessions.reduce((sum, s) => sum + parseFloat(s.distance || 0), 0),
    avgPower: sessions.reduce((sum, s) => sum + parseFloat(s.average_power || 0), 0) / sessions.length,
    totalTime: sessions.reduce((sum, s) => sum + parseInt(s.duration || 0), 0)
  } : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 bg-gradient-to-r from-velo-cyan-dark via-velo-teal to-velo-green rounded-3xl shadow-2xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 py-12 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col md:flex-row items-center gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/50 shadow-2xl overflow-hidden flex items-center justify-center", children: userProfile.photo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: userProfile.photo, alt: "Profile", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$a, { className: "h-20 w-20 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "absolute bottom-0 right-0 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$b, { className: "h-5 w-5 text-gray-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: handlePhotoUpload })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center md:text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-black text-white mb-2", children: [
            "Welcome back, ",
            userProfile.name,
            "! 👋"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-100 text-lg mb-4", children: "Ready to crush your next ride?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 justify-center md:justify-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "h-5 w-5 text-yellow-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white font-bold", children: [
                userProfile.ftp,
                "W"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-100 text-sm", children: "FTP" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$a, { className: "h-5 w-5 text-green-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white font-bold", children: [
                userProfile.weight,
                "lbs"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-100 text-sm", children: "Weight" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$c, { className: "h-5 w-5 text-purple-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white font-bold", children: [
                userProfile.bike.weight,
                "lbs"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-100 text-sm", children: userProfile.bike.name })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setEditingProfile(!editingProfile),
            className: "absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors border border-white/30",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$d, { className: "h-5 w-5 text-white" })
          }
        )
      ] })
    ] }) }),
    editingProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Edit Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: userProfile.name,
              onChange: (e) => setUserProfile({ ...userProfile, name: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "FTP (Watts)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: userProfile.ftp,
              onChange: (e) => setUserProfile({ ...userProfile, ftp: parseInt(e.target.value) }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Weight (lbs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              step: "0.1",
              value: userProfile.weight,
              onChange: (e) => setUserProfile({ ...userProfile, weight: parseFloat(e.target.value) }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Bike Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: userProfile.bike.name,
              onChange: (e) => setUserProfile({ ...userProfile, bike: { ...userProfile.bike, name: e.target.value } }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Bike Weight (lbs)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              step: "0.1",
              value: userProfile.bike.weight,
              onChange: (e) => setUserProfile({ ...userProfile, bike: { ...userProfile.bike, weight: parseFloat(e.target.value) } }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Bike Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: userProfile.bike.type,
              onChange: (e) => setUserProfile({ ...userProfile, bike: { ...userProfile.bike, type: e.target.value } }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Road" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Gravel" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Mountain" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "TT/Tri" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: saveUserProfile,
            className: "px-6 py-2 bg-gradient-to-r from-velo-cyan to-velo-teal text-white font-semibold rounded-lg hover:shadow-lg transition-all",
            children: "Save Changes"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setEditingProfile(false),
            className: "px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors",
            children: "Cancel"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/routes",
          className: "group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-velo-cyan",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 bg-gradient-to-br from-velo-cyan to-velo-blue rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$5, { className: "h-6 w-6 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900", children: "Routes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Explore & Upload" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/sessions",
          className: "group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-velo-teal",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 bg-gradient-to-br from-velo-teal to-velo-green rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$e, { className: "h-6 w-6 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900", children: "Sessions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "View History" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/parameters",
          className: "group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-velo-green",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 bg-gradient-to-br from-velo-green to-velo-teal rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$c, { className: "h-6 w-6 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900", children: "Parameters" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Customize" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/settings",
          className: "group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-velo-blue",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 bg-gradient-to-br from-velo-blue to-velo-cyan rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$2, { className: "h-6 w-6 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-900", children: "Settings" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Configure" })
            ] })
          ] })
        }
      )
    ] }),
    stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-velo-blue to-velo-cyan rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$7, { className: "h-8 w-8 opacity-80" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$9, { className: "h-6 w-6 opacity-60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium opacity-90 mb-1", children: "Total Sessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-4xl font-black", children: stats.totalSessions }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-75 mt-2", children: "Keep riding! 🚴" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-velo-teal to-velo-green rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$5, { className: "h-8 w-8 opacity-80" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$8, { className: "h-6 w-6 opacity-60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium opacity-90 mb-1", children: "Total Distance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "text-4xl font-black", children: [
          (stats.totalDistance / 1609.34).toFixed(0),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-normal ml-1", children: "mi" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-75 mt-2", children: "Amazing miles! 🎯" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-velo-green to-velo-teal rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "h-8 w-8 opacity-80" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$2, { className: "h-6 w-6 opacity-60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium opacity-90 mb-1", children: "Avg Power" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "text-4xl font-black", children: [
          Math.round(stats.avgPower),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-normal ml-1", children: "W" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-75 mt-2", children: "Crushing it! ⚡" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-velo-cyan to-velo-blue rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$7, { className: "h-8 w-8 opacity-80" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$f, { className: "h-6 w-6 opacity-60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium opacity-90 mb-1", children: "Total Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "text-4xl font-black", children: [
          Math.round(stats.totalTime / 3600),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-normal ml-1", children: "hrs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-75 mt-2", children: "Time well spent! ⏱️" })
      ] })
    ] }),
    sessions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$e, { className: "h-7 w-7 text-velo-teal" }),
          "Performance Intelligence"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setIntelligenceTimeframe(7),
              className: `px-3 py-1 rounded-lg text-sm font-semibold border transition-colors ${intelligenceTimeframe === 7 ? "bg-velo-teal text-white border-velo-teal" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`,
              children: "7d"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setIntelligenceTimeframe(30),
              className: `px-3 py-1 rounded-lg text-sm font-semibold border transition-colors ${intelligenceTimeframe === 30 ? "bg-velo-teal text-white border-velo-teal" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`,
              children: "30d"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        IntelligenceDashboard,
        {
          rideData: {
            ftp: userProfile.ftp,
            recentSessions: sessions.slice(0, 5)
          },
          intelligenceData: intelligenceLoading ? null : intelligenceSummary
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-8 mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Recent Activity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/sessions",
            className: "text-sm font-semibold text-cyan-600 hover:text-cyan-700",
            children: "View All →"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityFeed, { limit: 5 })
    ] }) })
  ] }) });
}
export {
  Dashboard as default
};
