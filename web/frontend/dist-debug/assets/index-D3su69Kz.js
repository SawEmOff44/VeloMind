const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Landing-CjWogAB6.js","assets/react-vendor-1C0h7GIa.js","assets/vendor-DqMYeBgE.js","assets/charts-DAd8QRTx.js","assets/Login-aZsPSKlz.js","assets/api-DVYe6O7N.js","assets/Register-BOdrQjz8.js","assets/Dashboard-D9gpmLLx.js","assets/date-fns-CsZmCekP.js","assets/Sessions-BJnvYAR6.js","assets/SessionDetail-BfN-uLBc.js","assets/Routes-DSNEUbue.js","assets/RouteDetail-D49sjqvk.js","assets/leaflet-R9o9hE9U.js","assets/leaflet-Bvr-Ab8i.css","assets/RouteComparison-q3bM6VeM.js","assets/Analytics-DMN4y5pc.js","assets/Parameters-BYTM24hA.js","assets/Settings-BAi-vyAX.js","assets/StravaCallback-DVO8D_OW.js"])))=>i.map(i=>d[i]);
import { u as useNavigate, b as useLocation, r as reactExports, j as jsxRuntimeExports, L as Link, B as BrowserRouter, c as Routes, d as Route, N as Navigate, e as client, R as React } from "./react-vendor-1C0h7GIa.js";
import "./vendor-DqMYeBgE.js";
import "./charts-DAd8QRTx.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const removeToken = () => localStorage.removeItem("token");
function Navbar({ isAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = reactExports.useState(false);
  const handleLogout = () => {
    removeToken();
    navigate("/");
    window.location.reload();
  };
  const isActive = (path) => location.pathname === path;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "bg-white shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between h-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: isAuthenticated ? "/dashboard" : "/", className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/images/VeloMind_Logo.v2.png", alt: "VeloMind", className: "h-10 w-auto" }) }) }),
        isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:ml-6 sm:flex sm:space-x-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/dashboard",
              className: `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/dashboard") ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
              children: "Dashboard"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/sessions",
              className: `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/sessions") ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
              children: "Sessions"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/routes",
              className: `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/routes") ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
              children: "Routes"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/analytics",
              className: `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/analytics") ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
              children: "Analytics"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/parameters",
              className: `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/parameters") ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
              children: "Parameters"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/settings",
              className: `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/settings") ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`,
              children: "Settings"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center sm:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setMobileMenuOpen(!mobileMenuOpen),
          className: "inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: mobileMenuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:flex items-center", children: isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleLogout,
          className: "ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
          children: "Logout"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/login",
            className: "inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900",
            children: "Sign In"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/register",
            className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
            children: "Get Started"
          }
        )
      ] }) })
    ] }),
    mobileMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:hidden pb-3", children: [
      isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/dashboard",
            className: `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive("/dashboard") ? "border-cyan-500 text-cyan-700 bg-cyan-50" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`,
            onClick: () => setMobileMenuOpen(false),
            children: "Dashboard"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/sessions",
            className: `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive("/sessions") ? "border-cyan-500 text-cyan-700 bg-cyan-50" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`,
            onClick: () => setMobileMenuOpen(false),
            children: "Sessions"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/routes",
            className: `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive("/routes") ? "border-cyan-500 text-cyan-700 bg-cyan-50" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`,
            onClick: () => setMobileMenuOpen(false),
            children: "Routes"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/analytics",
            className: `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive("/analytics") ? "border-cyan-500 text-cyan-700 bg-cyan-50" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`,
            onClick: () => setMobileMenuOpen(false),
            children: "Analytics"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/parameters",
            className: `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive("/parameters") ? "border-cyan-500 text-cyan-700 bg-cyan-50" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`,
            onClick: () => setMobileMenuOpen(false),
            children: "Parameters"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/settings",
            className: `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive("/settings") ? "border-cyan-500 text-cyan-700 bg-cyan-50" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`,
            onClick: () => setMobileMenuOpen(false),
            children: "Settings"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              handleLogout();
              setMobileMenuOpen(false);
            },
            className: "block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50",
            children: "Logout"
          }
        )
      ] }),
      !isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/login",
            className: "block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-50",
            onClick: () => setMobileMenuOpen(false),
            children: "Sign In"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/register",
            className: "block pl-3 pr-4 py-2 text-base font-medium text-cyan-600 hover:bg-cyan-50",
            onClick: () => setMobileMenuOpen(false),
            children: "Get Started"
          }
        )
      ] })
    ] })
  ] }) });
}
const Landing = reactExports.lazy(() => __vitePreload(() => import("./Landing-CjWogAB6.js"), true ? __vite__mapDeps([0,1,2,3]) : void 0));
const Login = reactExports.lazy(() => __vitePreload(() => import("./Login-aZsPSKlz.js"), true ? __vite__mapDeps([4,1,2,3,5]) : void 0));
const Register = reactExports.lazy(() => __vitePreload(() => import("./Register-BOdrQjz8.js"), true ? __vite__mapDeps([6,1,2,3,5]) : void 0));
const Dashboard = reactExports.lazy(() => __vitePreload(() => import("./Dashboard-D9gpmLLx.js"), true ? __vite__mapDeps([7,1,2,3,5,8]) : void 0));
const Sessions = reactExports.lazy(() => __vitePreload(() => import("./Sessions-BJnvYAR6.js"), true ? __vite__mapDeps([9,1,2,3,5,8]) : void 0));
const SessionDetail = reactExports.lazy(() => __vitePreload(() => import("./SessionDetail-BfN-uLBc.js"), true ? __vite__mapDeps([10,1,2,3,5,8]) : void 0));
const RoutesPage = reactExports.lazy(() => __vitePreload(() => import("./Routes-DSNEUbue.js"), true ? __vite__mapDeps([11,1,2,3,5,8]) : void 0));
const RouteDetail = reactExports.lazy(() => __vitePreload(() => import("./RouteDetail-D49sjqvk.js"), true ? __vite__mapDeps([12,1,2,3,5,13,14]) : void 0));
const RouteComparison = reactExports.lazy(() => __vitePreload(() => import("./RouteComparison-q3bM6VeM.js"), true ? __vite__mapDeps([15,1,2,3,5]) : void 0));
const Analytics = reactExports.lazy(() => __vitePreload(() => import("./Analytics-DMN4y5pc.js"), true ? __vite__mapDeps([16,1,2,3,5,8]) : void 0));
const Parameters = reactExports.lazy(() => __vitePreload(() => import("./Parameters-BYTM24hA.js"), true ? __vite__mapDeps([17,1,2,3,5]) : void 0));
const Settings = reactExports.lazy(() => __vitePreload(() => import("./Settings-BAi-vyAX.js"), true ? __vite__mapDeps([18,1,2,3,5]) : void 0));
const StravaCallback = reactExports.lazy(() => __vitePreload(() => import("./StravaCallback-DVO8D_OW.js"), true ? __vite__mapDeps([19,1,2,3,5]) : void 0));
function RouteLoadingFallback() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" }) }) });
}
function App() {
  const [isAuthenticated, setIsAuthenticated] = reactExports.useState(() => !!getToken());
  reactExports.useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(!!getToken());
    };
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
    }
    return children;
  };
  const PublicRoute = ({ children }) => {
    if (isAuthenticated) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return children;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BrowserRouter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, { isAuthenticated }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoadingFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Routes, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Landing, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/login", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Login, { onLogin: () => setIsAuthenticated(true) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/register", element: /* @__PURE__ */ jsxRuntimeExports.jsx(PublicRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Register, { onRegister: () => setIsAuthenticated(true) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/dashboard", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/sessions", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sessions, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/sessions/:id", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SessionDetail, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/routes", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoutesPage, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/routes/compare", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteComparison, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/routes/:id", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteDetail, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/analytics", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Analytics, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/parameters", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Parameters, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/settings", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "/strava/callback", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StravaCallback, {}) }) })
    ] }) })
  ] }) });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
export {
  setToken as s
};
