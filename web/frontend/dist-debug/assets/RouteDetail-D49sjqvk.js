import { z as useParams, r as reactExports, j as jsxRuntimeExports, L as Link, K as ForwardRef, M as ForwardRef$1 } from "./react-vendor-1C0h7GIa.js";
import { n as getRoute, o as getWaypoints, b as getActiveParameters, p as syncWaypoints } from "./api-DVYe6O7N.js";
import { M as MapContainer, T as TileLayer, P as Polyline, a as Marker, b as Popup, C as Circle, u as useMapEvents, L, m as markerShadow, c as markerIcon2x, d as markerIcon } from "./leaflet-R9o9hE9U.js";
import { R as ResponsiveContainer, A as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, d as Area, e as ReferenceDot, L as LineChart, a as Line } from "./charts-DAd8QRTx.js";
import "./vendor-DqMYeBgE.js";
function detectClimbs(points) {
  if (!points || points.length < 2) return [];
  const climbs = [];
  let inClimb = false;
  let climbStart = null;
  let climbPoints = [];
  const MIN_CLIMB_GRADE = 3;
  const MIN_CLIMB_DISTANCE = 100;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const distDiff = curr.distance - prev.distance;
    const elevDiff = (curr.elevation || 0) - (prev.elevation || 0);
    const grade = distDiff > 0 ? elevDiff / distDiff * 100 : 0;
    if (grade >= MIN_CLIMB_GRADE) {
      if (!inClimb) {
        inClimb = true;
        climbStart = {
          ...prev,
          index: i - 1
        };
        climbPoints = [{ ...prev, grade: 0, index: i - 1 }];
      }
      climbPoints.push({ ...curr, grade, index: i });
    } else if (inClimb) {
      const climbDistance = climbPoints[climbPoints.length - 1].distance - climbStart.distance;
      const climbElevation = (climbPoints[climbPoints.length - 1].elevation || 0) - (climbStart.elevation || 0);
      if (climbDistance >= MIN_CLIMB_DISTANCE && climbElevation > 0) {
        const grades = climbPoints.slice(1).map((p) => p.grade);
        climbs.push({
          startIndex: climbStart.index,
          endIndex: climbPoints[climbPoints.length - 1].index,
          start: climbStart,
          end: climbPoints[climbPoints.length - 1],
          distance: climbDistance,
          elevationGain: climbElevation,
          avgGrade: climbElevation / climbDistance * 100,
          maxGrade: Math.max(...grades),
          points: climbPoints
        });
      }
      inClimb = false;
      climbStart = null;
      climbPoints = [];
    }
  }
  if (inClimb && climbPoints.length > 0) {
    const lastPoint = climbPoints[climbPoints.length - 1];
    const climbDistance = lastPoint.distance - climbStart.distance;
    const climbElevation = (lastPoint.elevation || 0) - (climbStart.elevation || 0);
    if (climbDistance >= MIN_CLIMB_DISTANCE && climbElevation > 0) {
      const grades = climbPoints.slice(1).map((p) => p.grade);
      climbs.push({
        startIndex: climbStart.index,
        endIndex: lastPoint.index,
        start: climbStart,
        end: lastPoint,
        distance: climbDistance,
        elevationGain: climbElevation,
        avgGrade: climbElevation / climbDistance * 100,
        maxGrade: Math.max(...grades),
        points: climbPoints
      });
    }
  }
  return climbs.map((climb) => ({
    ...climb,
    category: categorizeClimb(climb)
  }));
}
function categorizeClimb(climb) {
  const { elevationGain, avgGrade } = climb;
  const difficultyScore = elevationGain * avgGrade / 100;
  if (elevationGain > 1500 && avgGrade > 7) return "HC";
  if (difficultyScore > 8e4) return "HC";
  if (elevationGain > 1200 && avgGrade > 6) return "1";
  if (difficultyScore > 5e4) return "1";
  if (elevationGain > 800 && avgGrade > 5) return "2";
  if (difficultyScore > 3e4) return "2";
  if (elevationGain > 500 && avgGrade > 4) return "3";
  if (difficultyScore > 15e3) return "3";
  if (elevationGain > 300 && avgGrade > 3) return "4";
  if (difficultyScore > 8e3) return "4";
  return "Uncategorized";
}
function getClimbCategoryColor(category) {
  switch (category) {
    case "HC":
      return "#FF0000";
    case "1":
      return "#FF6B00";
    case "2":
      return "#FFA500";
    case "3":
      return "#FFD700";
    case "4":
      return "#90EE90";
    default:
      return "#D3D3D3";
  }
}
function getClimbCategoryLabel(category) {
  switch (category) {
    case "HC":
      return "HC (Hors Catégorie)";
    case "1":
      return "Category 1";
    case "2":
      return "Category 2";
    case "3":
      return "Category 3";
    case "4":
      return "Category 4";
    default:
      return "Uncategorized Climb";
  }
}
function reverseRoute(route) {
  if (!route || !route.points) return route;
  const reversedPoints = [...route.points].reverse();
  const totalDistance = route.points[route.points.length - 1].distance;
  const newPoints = reversedPoints.map((point, index) => {
    const originalDistance = point.distance;
    const newDistance = totalDistance - originalDistance;
    return {
      ...point,
      distance: newDistance,
      sequence: index
    };
  });
  return {
    ...route,
    points: newPoints,
    name: `${route.name} (Reversed)`
  };
}
function getDifficultyColor(grade) {
  const absGrade = Math.abs(grade);
  if (absGrade >= 15) return "#8B0000";
  if (absGrade >= 12) return "#DC143C";
  if (absGrade >= 9) return "#FF4500";
  if (absGrade >= 6) return "#FFA500";
  if (absGrade >= 3) return "#FFD700";
  if (absGrade >= 1) return "#90EE90";
  return "#87CEEB";
}
function predictSpeed(grade, power, mass = 85, cda = 0.32) {
  const g = 9.81;
  const rho = 1.225;
  const crr = 4e-3;
  const eta = 0.97;
  if (Math.abs(grade) > 3) {
    const gradeRad = Math.atan(grade / 100);
    const vClimb = power * eta / (mass * g * Math.sin(gradeRad));
    return Math.max(vClimb, 1);
  }
  const baseSpeed = 8;
  const aeroForce = 0.5 * rho * cda * baseSpeed * baseSpeed;
  const rollForce = crr * mass * g;
  const gradeForce = mass * g * (grade / 100);
  const totalForce = aeroForce + rollForce + gradeForce;
  const speed = power * eta / totalForce;
  return Math.max(speed, 1);
}
function predictSegmentTime(distance, grade, power, params = {}) {
  const speed = predictSpeed(grade, power, params.mass, params.cda);
  return distance / speed;
}
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
});
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: onMapClick
  });
  return null;
}
function RouteDetail() {
  var _a;
  const { id } = useParams();
  const [route, setRoute] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [mapBounds, setMapBounds] = reactExports.useState(null);
  const [selectedPoint, setSelectedPoint] = reactExports.useState(null);
  const [waypoints, setWaypoints] = reactExports.useState([]);
  const [showReversed, setShowReversed] = reactExports.useState(false);
  const [riderParams, setRiderParams] = reactExports.useState({ ftp: 250, mass: 85, cda: 0.32 });
  const [shareModalOpen, setShareModalOpen] = reactExports.useState(false);
  const [shareLink, setShareLink] = reactExports.useState("");
  const [copied, setCopied] = reactExports.useState(false);
  const mapRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    loadRoute();
    loadRiderParams();
  }, [id]);
  const loadRoute = async () => {
    try {
      const response = await getRoute(id);
      const routeData = response.data;
      setRoute(routeData);
      if (routeData.points && routeData.points.length > 0) {
        const lats = routeData.points.map((p) => p.latitude);
        const lons = routeData.points.map((p) => p.longitude);
        setMapBounds([
          [Math.min(...lats), Math.min(...lons)],
          [Math.max(...lats), Math.max(...lons)]
        ]);
      }
      try {
        const waypointsResponse = await getWaypoints(id);
        if (waypointsResponse.data.waypoints && waypointsResponse.data.waypoints.length > 0) {
          setWaypoints(waypointsResponse.data.waypoints);
        } else {
          const savedWaypoints = localStorage.getItem(`waypoints_${id}`);
          if (savedWaypoints) {
            setWaypoints(JSON.parse(savedWaypoints));
          }
        }
      } catch (error) {
        console.error("Failed to load waypoints:", error);
      }
    } catch (error) {
      console.error("Failed to load route:", error);
    } finally {
      setLoading(false);
    }
  };
  const loadRiderParams = async () => {
    var _a2;
    try {
      const response = await getActiveParameters();
      const active = (_a2 = response == null ? void 0 : response.data) == null ? void 0 : _a2.parameters;
      if (active) {
        setRiderParams({
          ftp: active.ftp || 250,
          mass: parseFloat(active.mass) || 85,
          cda: parseFloat(active.cda) || 0.32
        });
      }
    } catch (error) {
      console.error("Failed to load rider parameters:", error);
    }
  };
  const handleChartClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const pointIndex = data.activePayload[0].payload.index;
      if (route.points && route.points[pointIndex]) {
        setSelectedPoint(route.points[pointIndex]);
        if (mapRef.current) {
          mapRef.current.setView([
            route.points[pointIndex].latitude,
            route.points[pointIndex].longitude
          ], mapRef.current.getZoom());
        }
      }
    }
  };
  const handleMapClick = (e) => {
    const newWaypoint = {
      id: Date.now(),
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
      type: "alert",
      label: "New Waypoint",
      notes: ""
    };
    const updatedWaypoints = [...waypoints, newWaypoint];
    setWaypoints(updatedWaypoints);
    localStorage.setItem(`waypoints_${id}`, JSON.stringify(updatedWaypoints));
  };
  const updateWaypoint = (waypointId, updates) => {
    const updatedWaypoints = waypoints.map(
      (w) => w.id === waypointId ? { ...w, ...updates } : w
    );
    setWaypoints(updatedWaypoints);
    localStorage.setItem(`waypoints_${id}`, JSON.stringify(updatedWaypoints));
    syncWaypoints(id, updatedWaypoints).catch(
      (err) => console.error("Failed to sync waypoints:", err)
    );
  };
  const removeWaypoint = (waypointId) => {
    const updatedWaypoints = waypoints.filter((w) => w.id !== waypointId);
    setWaypoints(updatedWaypoints);
    localStorage.setItem(`waypoints_${id}`, JSON.stringify(updatedWaypoints));
    syncWaypoints(id, updatedWaypoints).catch(
      (err) => console.error("Failed to sync waypoints:", err)
    );
  };
  const toggleRouteDirection = () => {
    setShowReversed(!showReversed);
    setSelectedPoint(null);
  };
  const handleShareRoute = () => {
    const link = `${window.location.origin}/routes/${id}`;
    setShareLink(link);
    setShareModalOpen(true);
  };
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Loading route..." }) });
  }
  if (!route) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600", children: "Route not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/routes", className: "text-blue-600 hover:underline mt-4 inline-block", children: "← Back to Routes" })
    ] });
  }
  const displayPoints = showReversed && route.points ? reverseRoute(route.points) : route.points;
  const climbs = displayPoints ? detectClimbs(displayPoints) : [];
  const elevationData = displayPoints ? displayPoints.map((point, index) => ({
    distance: (point.distance / 1609.34).toFixed(2),
    // Convert to miles
    elevation: point.elevation ? Math.round(point.elevation * 3.28084) : 0,
    // Convert to feet
    index,
    latitude: point.latitude,
    longitude: point.longitude
  })) : [];
  const gradeData = displayPoints && displayPoints.length > 1 ? displayPoints.slice(1).map((point, index) => {
    const prev = displayPoints[index];
    const distanceDiff = point.distance - prev.distance;
    const elevationDiff = point.elevation && prev.elevation ? point.elevation - prev.elevation : 0;
    const grade = distanceDiff > 0 ? elevationDiff / distanceDiff * 100 : 0;
    return {
      distance: (point.distance / 1609.34).toFixed(2),
      // Convert to miles
      grade: parseFloat(grade.toFixed(1)),
      // Keep as number for domain calculation
      index: index + 1,
      color: getDifficultyColor(grade),
      latitude: point.latitude,
      longitude: point.longitude
    };
  }) : [];
  const gradeMin = gradeData.length > 0 ? Math.min(...gradeData.map((d) => d.grade)) : 0;
  const gradeMax = gradeData.length > 0 ? Math.max(...gradeData.map((d) => d.grade)) : 0;
  const gradeDomain = [Math.floor(gradeMin - 1), Math.ceil(gradeMax + 1)];
  const stats = {
    distance: (route.total_distance / 1609.34).toFixed(2),
    // Convert to miles
    elevationGain: Math.round((route.total_elevation_gain || 0) * 3.28084),
    // Convert to feet
    maxElevation: displayPoints && displayPoints.length > 0 ? Math.round(Math.max(...displayPoints.map((p) => (p.elevation || 0) * 3.28084))) : 0,
    minElevation: displayPoints && displayPoints.length > 0 ? Math.round(Math.min(...displayPoints.map((p) => (p.elevation || 0) * 3.28084))) : 0,
    avgGrade: route.total_distance > 0 && route.total_elevation_gain ? (route.total_elevation_gain / route.total_distance * 100).toFixed(1) : 0
  };
  const totalTimeSeconds = displayPoints && displayPoints.length > 1 ? displayPoints.slice(1).reduce((total, point, index) => {
    const prev = displayPoints[index];
    const distanceDiff = point.distance - prev.distance;
    const elevationDiff = point.elevation && prev.elevation ? point.elevation - prev.elevation : 0;
    const grade = distanceDiff > 0 ? elevationDiff / distanceDiff * 100 : 0;
    const segmentTime = predictSegmentTime(
      distanceDiff,
      grade,
      riderParams.ftp,
      riderParams.mass,
      riderParams.cda
    );
    return total + segmentTime;
  }, 0) : 0;
  const totalTimeMinutes = totalTimeSeconds / 60;
  const avgSpeed = totalTimeSeconds > 0 ? (parseFloat(stats.distance) / (totalTimeSeconds / 3600)).toFixed(1) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/routes", className: "text-velo-blue-600 hover:underline mb-2 inline-block", children: "← Back to Routes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: route.name }),
        showReversed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block mt-2 px-3 py-1 bg-velo-cyan-100 text-velo-cyan-700 rounded-full text-sm font-medium", children: "Reversed Direction" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleShareRoute,
            className: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all font-semibold",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "w-5 h-5" }),
              "Share"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: toggleRouteDirection,
            className: "px-4 py-2 bg-gradient-to-r from-velo-cyan-500 to-velo-blue-500 text-white rounded-lg hover:from-velo-cyan-600 hover:to-velo-blue-600 transition-all font-semibold",
            children: showReversed ? "⟲ Normal Direction" : "⟲ Reverse Route"
          }
        )
      ] })
    ] }),
    shareModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-md w-full p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Share Route" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShareModalOpen(false),
            className: "text-gray-400 hover:text-gray-600",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "×" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Share this route with others using the link below:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: shareLink,
            readOnly: true,
            className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: copyShareLink,
            className: `px-4 py-2 rounded-lg font-semibold transition-all ${copied ? "bg-green-500 text-white" : "bg-velo-cyan text-white hover:bg-velo-cyan-dark"}`,
            children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "w-5 h-5 inline" }) }) : "Copy"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
        " Anyone with this link can view this route, but they'll need a VeloMind account to download it to their device."
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Distance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          stats.distance,
          " mi"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Elevation Gain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          stats.elevationGain,
          " ft"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Max Elevation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          stats.maxElevation,
          " ft"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Avg Grade" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          stats.avgGrade,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-velo-cyan-50 to-velo-blue-50 p-4 rounded-lg shadow border border-velo-cyan-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-velo-cyan-700", children: "Est. Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-velo-blue-900", children: [
          Math.floor(totalTimeMinutes / 60),
          "h ",
          Math.round(totalTimeMinutes % 60),
          "m"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-velo-teal-50 to-velo-green-50 p-4 rounded-lg shadow border border-velo-teal-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-velo-teal-700", children: "Avg Speed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-velo-green-900", children: [
          avgSpeed,
          " mph"
        ] })
      ] })
    ] }),
    climbs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow mb-8 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "Detected Climbs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: climbs.map((climb, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer",
          style: { borderColor: getClimbCategoryColor(climb.category) },
          onClick: () => {
            if (mapRef.current && displayPoints[climb.startIndex]) {
              mapRef.current.setView([
                displayPoints[climb.startIndex].latitude,
                displayPoints[climb.startIndex].longitude
              ], 14);
            }
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-gray-900", children: [
                "Climb ",
                idx + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "px-2 py-1 rounded text-white text-sm font-bold",
                  style: { backgroundColor: getClimbCategoryColor(climb.category) },
                  children: getClimbCategoryLabel(climb.category)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm text-gray-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Distance: ",
                (climb.distance / 1609.34).toFixed(2),
                " mi"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Elevation: ",
                Math.round(climb.elevationGain * 3.28084),
                " ft"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Avg Grade: ",
                climb.avgGrade.toFixed(1),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Max Grade: ",
                climb.maxGrade.toFixed(1),
                "%"
              ] })
            ] })
          ]
        },
        idx
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow mb-8 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Route Map" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Click on map to add waypoint markers" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-96", children: mapBounds && displayPoints && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        MapContainer,
        {
          ref: mapRef,
          bounds: mapBounds,
          className: "h-full w-full",
          scrollWheelZoom: true,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapClickHandler, { onMapClick: handleMapClick }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TileLayer,
              {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
            ),
            gradeData.map((segment, idx) => {
              if (idx === 0 || !displayPoints[idx]) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                Polyline,
                {
                  positions: [
                    [displayPoints[idx - 1].latitude, displayPoints[idx - 1].longitude],
                    [displayPoints[idx].latitude, displayPoints[idx].longitude]
                  ],
                  color: segment.color,
                  weight: 4,
                  opacity: 0.7
                },
                idx
              );
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { position: [displayPoints[0].latitude, displayPoints[0].longitude], children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popup, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: showReversed ? "Finish" : "Start" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "Elevation: ",
              Math.round(displayPoints[0].elevation * 3.28084),
              " ft"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { position: [
              displayPoints[displayPoints.length - 1].latitude,
              displayPoints[displayPoints.length - 1].longitude
            ], children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popup, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: showReversed ? "Start" : "Finish" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "Elevation: ",
              Math.round(displayPoints[displayPoints.length - 1].elevation * 3.28084),
              " ft"
            ] }) }),
            selectedPoint && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Circle,
              {
                center: [selectedPoint.latitude, selectedPoint.longitude],
                radius: 50,
                pathOptions: { color: "red", fillColor: "red", fillOpacity: 0.4 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Selected Point" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "Distance: ",
                  (selectedPoint.distance / 1609.34).toFixed(2),
                  " mi",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "Elevation: ",
                  Math.round(selectedPoint.elevation * 3.28084),
                  " ft"
                ] })
              }
            ),
            waypoints.map((waypoint) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Marker,
              {
                position: [waypoint.latitude, waypoint.longitude],
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Popup, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[200px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Label" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "text",
                        value: waypoint.label || "",
                        onChange: (e) => {
                          e.stopPropagation();
                          updateWaypoint(waypoint.id, { label: e.target.value });
                        },
                        onClick: (e) => e.stopPropagation(),
                        className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-velo-cyan-500 focus:border-transparent",
                        placeholder: "e.g., Aggressive dogs"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Type" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        value: waypoint.type || "alert",
                        onChange: (e) => {
                          e.stopPropagation();
                          updateWaypoint(waypoint.id, { type: e.target.value });
                        },
                        onClick: (e) => e.stopPropagation(),
                        className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-velo-cyan-500 focus:border-transparent",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "alert", children: "⚠️ Alert" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "danger", children: "🚨 Danger" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "water", children: "💧 Water Stop" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "food", children: "🍎 Nutrition" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rest", children: "🛑 Rest Stop" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "photo", children: "📷 Photo Spot" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "turn", children: "↪️ Turn" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "steep", children: "⛰️ Steep Section" })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-gray-700 mb-1", children: "Notes" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "textarea",
                      {
                        value: waypoint.notes || "",
                        onChange: (e) => {
                          e.stopPropagation();
                          updateWaypoint(waypoint.id, { notes: e.target.value });
                        },
                        onClick: (e) => e.stopPropagation(),
                        className: "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-velo-cyan-500 focus:border-transparent",
                        rows: "2",
                        placeholder: "Details for iOS alert..."
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        removeWaypoint(waypoint.id);
                      },
                      className: "w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600",
                      children: "Remove Waypoint"
                    }
                  )
                ] }) })
              },
              waypoint.id
            )),
            climbs.map((climb, idx) => {
              if (!displayPoints[climb.startIndex]) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                Circle,
                {
                  center: [
                    displayPoints[climb.startIndex].latitude,
                    displayPoints[climb.startIndex].longitude
                  ],
                  radius: 100,
                  pathOptions: {
                    color: getClimbCategoryColor(climb.category),
                    fillColor: getClimbCategoryColor(climb.category),
                    fillOpacity: 0.3
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popup, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                      "Climb ",
                      idx + 1,
                      " - ",
                      getClimbCategoryLabel(climb.category)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    "Distance: ",
                    (climb.distance / 1609.34).toFixed(2),
                    " mi",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    "Elevation: ",
                    Math.round(climb.elevationGain * 3.28084),
                    " ft",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    "Avg Grade: ",
                    climb.avgGrade.toFixed(1),
                    "%"
                  ] })
                },
                `climb-${idx}`
              );
            })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow mb-8 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Elevation Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Click on the chart to highlight location on map" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: elevationData, onClick: handleChartClick, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "elevationGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "5%", stopColor: "#06b6d4", stopOpacity: 0.8 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0.1 })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          XAxis,
          {
            dataKey: "distance",
            label: { value: "Distance (mi)", position: "insideBottom", offset: -5 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          YAxis,
          {
            label: { value: "Elevation (ft)", angle: -90, position: "insideLeft" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tooltip,
          {
            formatter: (value) => [`${value} ft`, "Elevation"],
            labelFormatter: (label) => `${label} mi`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Area,
          {
            type: "monotone",
            dataKey: "elevation",
            stroke: "#0284c7",
            fill: "url(#elevationGradient)",
            strokeWidth: 2
          }
        ),
        selectedPoint && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReferenceDot,
          {
            x: (selectedPoint.distance / 1609.34).toFixed(2),
            y: Math.round(selectedPoint.elevation * 3.28084),
            r: 8,
            fill: "red",
            stroke: "white",
            strokeWidth: 2
          }
        )
      ] }) })
    ] }),
    gradeData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: "Grade Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Colors indicate difficulty: Blue (flat) → Green → Yellow → Orange → Red (steep)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: gradeData, onClick: handleChartClick, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          XAxis,
          {
            dataKey: "distance",
            label: { value: "Distance (mi)", position: "insideBottom", offset: -5 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          YAxis,
          {
            domain: gradeDomain,
            tickFormatter: (value) => `${value}%`,
            label: { value: "Grade (%)", angle: -90, position: "insideLeft" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tooltip,
          {
            formatter: (value) => [`${parseFloat(value).toFixed(1)}%`, "Grade"],
            labelFormatter: (label) => `${label} mi`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: "grade",
            stroke: "#ef4444",
            dot: false,
            strokeWidth: 2
          }
        ),
        selectedPoint && gradeData.find((d) => d.index === displayPoints.indexOf(selectedPoint)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ReferenceDot,
          {
            x: (selectedPoint.distance / 1609.34).toFixed(2),
            y: ((_a = gradeData.find((d) => d.index === displayPoints.indexOf(selectedPoint))) == null ? void 0 : _a.grade) || 0,
            r: 8,
            fill: "red",
            stroke: "white",
            strokeWidth: 2
          }
        )
      ] }) })
    ] })
  ] });
}
export {
  RouteDetail as default
};
