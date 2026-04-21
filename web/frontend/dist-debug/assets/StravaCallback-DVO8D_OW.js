import { O as useSearchParams, u as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-1C0h7GIa.js";
import { z as getCurrentUser, i as buildApiUrl } from "./api-DVYe6O7N.js";
import "./vendor-DqMYeBgE.js";
import "./charts-DAd8QRTx.js";
function StravaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const handleCallback = async () => {
      var _a, _b;
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      if (errorParam) {
        setError("Authorization denied");
        setTimeout(() => navigate("/settings"), 3e3);
        return;
      }
      if (!code) {
        setError("No authorization code received");
        setTimeout(() => navigate("/settings"), 3e3);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Not authenticated");
        }
        const response = await getCurrentUser();
        const userId = (_b = (_a = response == null ? void 0 : response.data) == null ? void 0 : _a.user) == null ? void 0 : _b.id;
        if (!userId) {
          throw new Error("Unable to determine current user");
        }
        const callbackUrl = buildApiUrl(
          `/strava/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(userId)}`
        );
        window.location.replace(callbackUrl);
      } catch (error2) {
        console.error("Failed to connect Strava:", error2);
        setError("Failed to connect Strava account");
        setTimeout(() => navigate("/settings"), 3e3);
      }
    };
    handleCallback();
  }, [searchParams, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "mx-auto h-12 w-12 text-red-500", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-gray-900", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-gray-600", children: "Redirecting to settings..." })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-gray-900", children: "Connecting Strava..." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-gray-600", children: "Please wait while we authorize your account" })
  ] }) }) });
}
export {
  StravaCallback as default
};
