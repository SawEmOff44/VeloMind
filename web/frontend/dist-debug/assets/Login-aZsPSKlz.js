import { r as reactExports, u as useNavigate, j as jsxRuntimeExports, L as Link } from "./react-vendor-1C0h7GIa.js";
import { l as login } from "./api-DVYe6O7N.js";
import { s as setToken } from "./index-D3su69Kz.js";
import "./vendor-DqMYeBgE.js";
import "./charts-DAd8QRTx.js";
function Login({ onLogin }) {
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(email, password);
      setToken(response.data.token);
      onLogin();
      navigate("/dashboard");
    } catch (err) {
      setError(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.error) || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-center text-4xl font-bold text-primary-600", children: "🚴 VeloMind" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Sign in to your account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-red-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-800", children: error }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md shadow-sm -space-y-px", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", className: "sr-only", children: "Email address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "email",
              name: "email",
              type: "email",
              required: true,
              value: email,
              onChange: (e) => setEmail(e.target.value),
              className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm",
              placeholder: "Email address"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", className: "sr-only", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "password",
              name: "password",
              type: "password",
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm",
              placeholder: "Password"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50",
          children: loading ? "Signing in..." : "Sign in"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", className: "font-medium text-primary-600 hover:text-primary-500", children: "Don't have an account? Sign up" }) })
    ] })
  ] }) });
}
export {
  Login as default
};
