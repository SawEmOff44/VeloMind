import { u as useNavigate, r as reactExports, j as jsxRuntimeExports, g as ForwardRef, D as ForwardRef$1, E as ForwardRef$2, G as ForwardRef$3, H as ForwardRef$4, I as ForwardRef$5, J as ForwardRef$6, k as ForwardRef$7, L as Link } from "./react-vendor-1C0h7GIa.js";
import { j as getRoutes, k as uploadGPX, m as deleteRoute } from "./api-DVYe6O7N.js";
import { f as format } from "./date-fns-CsZmCekP.js";
import "./vendor-DqMYeBgE.js";
import "./charts-DAd8QRTx.js";
function Routes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [uploading, setUploading] = reactExports.useState(false);
  const [dragActive, setDragActive] = reactExports.useState(false);
  const [selectedForCompare, setSelectedForCompare] = reactExports.useState([]);
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const [filters, setFilters] = reactExports.useState({
    minDistance: 0,
    maxDistance: 100,
    minElevation: 0,
    maxElevation: 5e3,
    difficulty: "all"
  });
  reactExports.useEffect(() => {
    loadRoutes();
  }, []);
  const loadRoutes = async () => {
    try {
      const response = await getRoutes();
      setRoutes(response.data.routes || []);
    } catch (error) {
      console.error("Failed to load routes:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowedExtensions = [".gpx", ".fit", ".tcx", ".kml"];
    const hasValidExtension = allowedExtensions.some(
      (ext) => file.name.toLowerCase().endsWith(ext)
    );
    if (!hasValidExtension) {
      alert("Please upload a GPX, FIT, TCX, or KML file");
      return;
    }
    const fileName = file.name.replace(/\.(gpx|fit|tcx|kml)$/i, "");
    setUploading(true);
    try {
      await uploadGPX(file, fileName);
      await loadRoutes();
    } catch (error) {
      console.error("Failed to upload route:", error);
      alert("Failed to upload route file");
    } finally {
      setUploading(false);
    }
  };
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await deleteRoute(id);
      setRoutes(routes.filter((r) => r.id !== id));
      setSelectedForCompare(selectedForCompare.filter((routeId) => routeId !== id));
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route");
    }
  };
  const toggleCompareSelection = (routeId) => {
    if (selectedForCompare.includes(routeId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== routeId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert("You can compare up to 3 routes at a time");
        return;
      }
      setSelectedForCompare([...selectedForCompare, routeId]);
    }
  };
  const startComparison = () => {
    if (selectedForCompare.length < 2) {
      alert("Please select at least 2 routes to compare");
      return;
    }
    navigate(`/routes/compare?ids=${selectedForCompare.join(",")}`);
  };
  const getDifficultyScore = (route) => {
    const distanceKm = route.total_distance / 1e3;
    const elevationPerKm = route.total_elevation_gain / distanceKm;
    return elevationPerKm * distanceKm / 10;
  };
  const getDifficultyLabel = (score) => {
    if (score < 10) return { label: "Easy", color: "bg-green-500" };
    if (score < 30) return { label: "Moderate", color: "bg-yellow-500" };
    if (score < 60) return { label: "Hard", color: "bg-orange-500" };
    return { label: "Extreme", color: "bg-red-500" };
  };
  const filteredRoutes = routes.filter((route) => {
    const distanceMi = route.total_distance / 1609.34;
    const elevationM = route.total_elevation_gain;
    const difficulty = getDifficultyScore(route);
    if (distanceMi < filters.minDistance || distanceMi > filters.maxDistance) return false;
    if (elevationM < filters.minElevation || elevationM > filters.maxElevation) return false;
    if (filters.difficulty !== "all") {
      const diffLabel = getDifficultyLabel(difficulty).label.toLowerCase();
      if (diffLabel !== filters.difficulty.toLowerCase()) return false;
    }
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Routes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Upload GPX files and sync them to your iPhone" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-2 bg-velo-cyan/10 border border-velo-cyan/30 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "w-5 h-5 text-velo-cyan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-velo-cyan-dark", children: [
            filteredRoutes.length,
            " routes"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowFilters(!showFilters),
            className: `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${showFilters ? "bg-velo-cyan text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "w-5 h-5" }),
              "Filters"
            ]
          }
        )
      ] })
    ] }),
    showFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Filter Routes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowFilters(false),
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$2, { className: "w-5 h-5 text-gray-500" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Distance Range (miles)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: filters.minDistance,
                onChange: (e) => setFilters({ ...filters, minDistance: Number(e.target.value) }),
                className: "w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500",
                placeholder: "Min",
                min: "0"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: filters.maxDistance,
                onChange: (e) => setFilters({ ...filters, maxDistance: Number(e.target.value) }),
                className: "w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500",
                placeholder: "Max",
                min: "0"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Elevation Gain (meters)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: filters.minElevation,
                onChange: (e) => setFilters({ ...filters, minElevation: Number(e.target.value) }),
                className: "w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500",
                placeholder: "Min",
                min: "0"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: filters.maxElevation,
                onChange: (e) => setFilters({ ...filters, maxElevation: Number(e.target.value) }),
                className: "w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500",
                placeholder: "Max",
                min: "0"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Difficulty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filters.difficulty,
              onChange: (e) => setFilters({ ...filters, difficulty: e.target.value }),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Levels" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "easy", children: "Easy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderate", children: "Moderate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hard", children: "Hard" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "extreme", children: "Extreme" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setFilters({
              minDistance: 0,
              maxDistance: 100,
              minElevation: 0,
              maxElevation: 5e3,
              difficulty: "all"
            }),
            className: "w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors",
            children: "Reset Filters"
          }
        ) })
      ] })
    ] }),
    selectedForCompare.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 bg-gradient-to-r from-velo-cyan to-velo-teal rounded-2xl shadow-lg p-6 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$3, { className: "w-6 h-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
          selectedForCompare.length,
          " route",
          selectedForCompare.length !== 1 ? "s" : "",
          " selected for comparison"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: startComparison,
            disabled: selectedForCompare.length < 2,
            className: `px-6 py-2 font-semibold rounded-lg transition-all ${selectedForCompare.length >= 2 ? "bg-white text-velo-cyan hover:shadow-lg hover:scale-105" : "bg-white/20 text-white/50 cursor-not-allowed"}`,
            children: "Compare Routes"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedForCompare([]),
            className: "px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors",
            children: "Clear Selection"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `mb-8 border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${dragActive ? "border-velo-cyan bg-velo-cyan/10 scale-[1.02]" : "border-gray-300 hover:border-velo-teal hover:bg-gray-50"}`,
        onDragEnter: handleDrag,
        onDragLeave: handleDrag,
        onDragOver: handleDrag,
        onDrop: handleDrop,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-gradient-to-br from-velo-cyan to-velo-teal rounded-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$4, { className: "h-12 w-12 text-white" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "file-upload", className: "cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-lg font-semibold ${uploading ? "text-gray-400" : "text-velo-teal hover:text-velo-green"}`, children: uploading ? "Uploading..." : "Click to upload or drag and drop" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "file-upload",
                  type: "file",
                  className: "sr-only",
                  accept: ".gpx,.fit,.tcx,.kml",
                  onChange: (e) => handleFileChange(e.target.files),
                  disabled: uploading
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-2", children: "GPX, FIT, TCX, or KML files supported" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Routes automatically sync to your iPhone app" })
          ] })
        ]
      }
    ),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" }) }) : routes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-gray-600 font-medium", children: "No routes uploaded yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-2", children: "Upload a GPX file to get started with navigation" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredRoutes.map((route) => {
      const isSelected = selectedForCompare.includes(route.id);
      const difficultyScore = getDifficultyScore(route);
      const difficulty = getDifficultyLabel(difficultyScore);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${isSelected ? "border-velo-cyan ring-4 ring-velo-cyan/20" : "border-gray-100 hover:border-velo-cyan"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-velo-cyan to-velo-teal p-6 text-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "h-8 w-8" }),
                  isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-white/30 rounded-full text-xs font-bold", children: "Selected" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => toggleCompareSelection(route.id),
                      className: `p-2 rounded-lg transition-colors ${isSelected ? "bg-white text-velo-cyan" : "bg-white/20 hover:bg-white/30"}`,
                      title: isSelected ? "Remove from comparison" : "Add to comparison",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$3, { className: "h-5 w-5" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => handleDelete(route.id),
                      className: "p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors",
                      title: "Delete route",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$5, { className: "h-5 w-5" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold group-hover:scale-105 transition-transform", children: route.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-3 py-1 ${difficulty.color} text-white text-xs font-bold rounded-full`, children: difficulty.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                  "Score: ",
                  difficultyScore.toFixed(1)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-500 text-xs mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$6, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Distance" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
                    (route.total_distance / 1609.34).toFixed(1),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-gray-500 ml-1", children: "mi" })
                  ] })
                ] }),
                route.total_elevation_gain > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-500 text-xs mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$7, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Elevation" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
                    Math.round(route.total_elevation_gain),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-gray-500 ml-1", children: "m" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
                "Uploaded ",
                format(new Date(route.created_at), "PPp")
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: `/routes/${route.id}`,
                  className: "mt-4 block w-full text-center py-2.5 px-4 bg-gradient-to-r from-velo-cyan to-velo-green text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105",
                  children: "View Details"
                }
              )
            ] })
          ]
        },
        route.id
      );
    }) })
  ] });
}
export {
  Routes as default
};
