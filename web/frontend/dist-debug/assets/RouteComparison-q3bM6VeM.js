import { O as useSearchParams, r as reactExports, j as jsxRuntimeExports, L as Link, P as ForwardRef, g as ForwardRef$1, J as ForwardRef$2, k as ForwardRef$3, p as ForwardRef$4 } from "./react-vendor-1C0h7GIa.js";
import { n as getRoute } from "./api-DVYe6O7N.js";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, f as Legend, a as Line } from "./charts-DAd8QRTx.js";
import "./vendor-DqMYeBgE.js";
function RouteComparison() {
  const [searchParams] = useSearchParams();
  const [routes, setRoutes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [selectedMetric, setSelectedMetric] = reactExports.useState("elevation");
  const colors = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
  reactExports.useEffect(() => {
    loadRoutes();
  }, [searchParams]);
  const loadRoutes = async () => {
    var _a;
    const ids = ((_a = searchParams.get("ids")) == null ? void 0 : _a.split(",")) || [];
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    try {
      const routePromises = ids.map((id) => getRoute(id));
      const responses = await Promise.all(routePromises);
      const loadedRoutes = responses.map((r) => r.data);
      setRoutes(loadedRoutes);
    } catch (error) {
      console.error("Failed to load routes:", error);
    } finally {
      setLoading(false);
    }
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
  const normalizeElevationData = () => {
    if (routes.length === 0) return [];
    const maxPoints = Math.max(...routes.map((r) => {
      var _a;
      return ((_a = r.points) == null ? void 0 : _a.length) || 0;
    }));
    const normalizedData = [];
    for (let i = 0; i < maxPoints; i++) {
      const dataPoint = { index: i };
      routes.forEach((route, routeIndex) => {
        if (route.points && route.points.length > 0) {
          const normalizedIndex = Math.floor(i / maxPoints * route.points.length);
          const point = route.points[normalizedIndex];
          if (point) {
            if (selectedMetric === "elevation") {
              dataPoint[`route${routeIndex}`] = Math.round(point.elevation * 3.28084);
            } else if (selectedMetric === "grade") {
              dataPoint[`route${routeIndex}`] = point.grade || 0;
            }
          }
        }
      });
      normalizedData.push(dataPoint);
    }
    return normalizedData;
  };
  const estimateTime = (route, avgSpeed = 15) => {
    const distanceMi = route.total_distance / 1609.34;
    return distanceMi / avgSpeed * 60;
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" }) }) });
  }
  if (routes.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/routes",
          className: "inline-flex items-center gap-2 text-velo-cyan hover:text-velo-cyan-dark font-semibold mb-8",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "w-5 h-5" }),
            "Back to Routes"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 bg-white rounded-2xl shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$1, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-gray-600", children: "No routes selected for comparison" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/routes",
            className: "mt-4 inline-block px-6 py-3 bg-gradient-to-r from-velo-cyan to-velo-teal text-white font-semibold rounded-lg hover:shadow-lg transition-all",
            children: "Go to Routes"
          }
        )
      ] })
    ] });
  }
  const chartData = normalizeElevationData();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/routes",
          className: "inline-flex items-center gap-2 text-velo-cyan hover:text-velo-cyan-dark font-semibold mb-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef, { className: "w-5 h-5" }),
            "Back to Routes"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Route Comparison" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600", children: [
        "Comparing ",
        routes.length,
        " routes side by side"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 bg-white rounded-2xl shadow-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gradient-to-r from-velo-cyan to-velo-teal text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-sm font-bold", children: "Metric" }),
        routes.map((route, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-center text-sm font-bold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-4 h-4 rounded-full",
              style: { backgroundColor: colors[index] }
            }
          ),
          route.name
        ] }) }, route.id))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$2, { className: "w-5 h-5 text-gray-500" }),
            "Distance"
          ] }) }),
          routes.map((route) => /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-center text-gray-900", children: [
            (route.total_distance / 1609.34).toFixed(2),
            " mi"
          ] }, route.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$3, { className: "w-5 h-5 text-gray-500" }),
            "Elevation Gain"
          ] }) }),
          routes.map((route) => /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-center text-gray-900", children: [
            Math.round(route.total_elevation_gain),
            " m",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-500 ml-1", children: [
              "(",
              Math.round(route.total_elevation_gain * 3.28084),
              " ft)"
            ] })
          ] }, route.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-gray-900", children: "Difficulty" }),
          routes.map((route) => {
            const score = getDifficultyScore(route);
            const difficulty = getDifficultyLabel(score);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-3 py-1 ${difficulty.color} text-white text-sm font-bold rounded-full`, children: difficulty.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [
                "Score: ",
                score.toFixed(1)
              ] })
            ] }, route.id);
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-gray-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ForwardRef$4, { className: "w-5 h-5 text-gray-500" }),
            "Est. Time (15 mph avg)"
          ] }) }),
          routes.map((route) => /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-center text-gray-900", children: [
            Math.round(estimateTime(route)),
            " min",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-500 ml-1", children: [
              "(",
              (estimateTime(route) / 60).toFixed(1),
              " hrs)"
            ] })
          ] }, route.id))
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-700", children: "Chart Metric:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedMetric("elevation"),
            className: `px-4 py-2 rounded-lg font-semibold transition-all ${selectedMetric === "elevation" ? "bg-velo-cyan text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
            children: "Elevation"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedMetric("grade"),
            className: `px-4 py-2 rounded-lg font-semibold transition-all ${selectedMetric === "grade" ? "bg-velo-cyan text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
            children: "Grade"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: [
        selectedMetric === "elevation" ? "Elevation Profile" : "Grade Profile",
        " Comparison"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 400, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          XAxis,
          {
            dataKey: "index",
            label: { value: "Route Progress", position: "insideBottom", offset: -5 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          YAxis,
          {
            label: {
              value: selectedMetric === "elevation" ? "Elevation (ft)" : "Grade (%)",
              angle: -90,
              position: "insideLeft"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tooltip,
          {
            formatter: (value) => [
              selectedMetric === "elevation" ? `${value} ft` : `${value.toFixed(1)}%`,
              ""
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        routes.map((route, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: `route${index}`,
            name: route.name,
            stroke: colors[index],
            strokeWidth: 2,
            dot: false
          },
          route.id
        ))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: "🏆 Shortest Route" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-black text-green-600", children: routes.reduce((min, r) => r.total_distance < min.total_distance ? r : min).name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
          (routes.reduce((min, r) => r.total_distance < min.total_distance ? r : min).total_distance / 1609.34).toFixed(2),
          " mi"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: "⛰️ Most Elevation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-black text-blue-600", children: routes.reduce((max, r) => r.total_elevation_gain > max.total_elevation_gain ? r : max).name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
          Math.round(routes.reduce((max, r) => r.total_elevation_gain > max.total_elevation_gain ? r : max).total_elevation_gain),
          " m"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border-2 border-yellow-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-2", children: "⚡ Easiest Route" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-black text-yellow-600", children: routes.reduce((min, r) => getDifficultyScore(r) < getDifficultyScore(min) ? r : min).name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
          "Difficulty: ",
          getDifficultyLabel(getDifficultyScore(routes.reduce((min, r) => getDifficultyScore(r) < getDifficultyScore(min) ? r : min))).label
        ] })
      ] })
    ] })
  ] });
}
export {
  RouteComparison as default
};
