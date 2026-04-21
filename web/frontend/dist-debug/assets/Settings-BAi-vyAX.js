import { O as useSearchParams, r as reactExports, j as jsxRuntimeExports } from "./react-vendor-1C0h7GIa.js";
import { z as getCurrentUser, b as getActiveParameters, w as getParameters, u as updateParameters, x as createParameters, i as buildApiUrl } from "./api-DVYe6O7N.js";
import "./vendor-DqMYeBgE.js";
import "./charts-DAd8QRTx.js";
function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [stravaConnected, setStravaConnected] = reactExports.useState(false);
  const [showStravaSuccess, setShowStravaSuccess] = reactExports.useState(false);
  const [fitnessProfile, setFitnessProfile] = reactExports.useState(null);
  const [editingFitness, setEditingFitness] = reactExports.useState(false);
  const [fitnessLoading, setFitnessLoading] = reactExports.useState(true);
  const [fitnessError, setFitnessError] = reactExports.useState("");
  const [fitnessForm, setFitnessForm] = reactExports.useState({
    name: "Default Profile",
    mass: 85,
    ftp: 250,
    cda: 0.32,
    crr: 45e-4,
    drivetrain_loss: 0.03,
    position: "hoods"
  });
  reactExports.useEffect(() => {
    if (searchParams.get("strava") === "connected") {
      setShowStravaSuccess(true);
      setSearchParams({});
      setTimeout(() => setShowStravaSuccess(false), 5e3);
    }
    loadUser();
    loadFitnessProfile();
  }, []);
  const applyActiveProfile = (activeProfile) => {
    setFitnessProfile(activeProfile);
    setFitnessForm({
      name: activeProfile.name,
      mass: parseFloat(activeProfile.mass),
      ftp: activeProfile.ftp,
      cda: parseFloat(activeProfile.cda),
      crr: parseFloat(activeProfile.crr),
      drivetrain_loss: parseFloat(activeProfile.drivetrain_loss),
      position: activeProfile.position
    });
  };
  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data.user);
      setStravaConnected(!!response.data.user.strava_id);
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  };
  const loadFitnessProfile = async () => {
    var _a, _b, _c, _d, _e, _f;
    setFitnessLoading(true);
    setFitnessError("");
    try {
      const activeResp = await getActiveParameters();
      const activeFromActive = (_a = activeResp == null ? void 0 : activeResp.data) == null ? void 0 : _a.parameters;
      if (activeFromActive) {
        applyActiveProfile(activeFromActive);
        return;
      }
      const response = await getParameters();
      const activeProfile = (_b = response.data.parameters) == null ? void 0 : _b.find((p) => p.is_active);
      if (activeProfile) applyActiveProfile(activeProfile);
    } catch (error) {
      console.error("Failed to load fitness profile:", error);
      const msg = ((_d = (_c = error == null ? void 0 : error.response) == null ? void 0 : _c.data) == null ? void 0 : _d.error) || ((_f = (_e = error == null ? void 0 : error.response) == null ? void 0 : _e.data) == null ? void 0 : _f.message) || (error == null ? void 0 : error.message) || "Unknown error";
      setFitnessError(msg);
    } finally {
      setFitnessLoading(false);
    }
  };
  const handleFitnessSubmit = async (e) => {
    e.preventDefault();
    try {
      if (fitnessProfile) {
        await updateParameters(fitnessProfile.id, fitnessForm);
      } else {
        await createParameters({ ...fitnessForm, is_active: true });
      }
      await loadFitnessProfile();
      setEditingFitness(false);
    } catch (error) {
      console.error("Failed to save fitness profile:", error);
      alert("Failed to save fitness profile");
    }
  };
  const handleStravaConnect = () => {
    try {
      const clientId = "191884";
      const redirectUri = buildApiUrl("/strava/callback");
      const scope = "read,activity:read_all";
      if (!user || !user.id) {
        console.error("User not loaded yet:", user);
        alert("Please wait for the page to fully load before connecting to Strava.");
        return;
      }
      const state = user.id.toString();
      const stravaUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
      console.log("Strava OAuth:", { clientId, redirectUri, userId: user.id, stravaUrl });
      console.log("About to redirect to:", stravaUrl);
      if (!clientId) ;
      console.log("Executing redirect...");
      window.location.assign(stravaUrl);
      console.log("Redirect executed - this should not log");
    } catch (error) {
      console.error("Error in handleStravaConnect:", error);
      alert(`Failed to connect to Strava: ${error.message}`);
    }
  };
  const handleStravaDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Strava?")) return;
    try {
      alert("Strava disconnected");
      setStravaConnected(false);
    } catch (error) {
      console.error("Failed to disconnect Strava:", error);
      alert("Failed to disconnect Strava");
    }
  };
  if (loading || fitnessLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Loading..." }) });
  }
  if (fitnessError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-red-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-800", children: [
      "Failed to load fitness profile: ",
      fitnessError
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "Settings" }),
    showStravaSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-green-50 border border-green-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-green-400", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-green-800", children: "Successfully connected to Strava! Your activities will now sync automatically." }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow rounded-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Account Information" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm text-gray-900", children: user == null ? void 0 : user.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm text-gray-900", children: user == null ? void 0 : user.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-500", children: "Member Since" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm text-gray-900", children: (user == null ? void 0 : user.created_at) ? new Date(user.created_at).toLocaleDateString() : "N/A" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow rounded-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Fitness Profile" }),
        !editingFitness && fitnessProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setEditingFitness(true),
            className: "px-3 py-1 text-sm bg-gradient-to-r from-velo-cyan-500 to-velo-blue-500 text-white rounded hover:from-velo-cyan-600 hover:to-velo-blue-600",
            children: "Edit"
          }
        )
      ] }),
      editingFitness || !fitnessProfile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleFitnessSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Profile Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: fitnessForm.name,
                onChange: (e) => setFitnessForm({ ...fitnessForm, name: e.target.value }),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Weight (lbs)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.1",
                value: fitnessForm.mass,
                onChange: (e) => setFitnessForm({ ...fitnessForm, mass: parseFloat(e.target.value) }),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
              "FTP (watts)",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-gray-500", children: "Functional Threshold Power" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: fitnessForm.ftp,
                onChange: (e) => setFitnessForm({ ...fitnessForm, ftp: parseInt(e.target.value) }),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
              "CdA",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-gray-500", children: "Aerodynamic drag" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                value: fitnessForm.cda,
                onChange: (e) => setFitnessForm({ ...fitnessForm, cda: parseFloat(e.target.value) }),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Rolling Resistance (Crr)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.0001",
                value: fitnessForm.crr,
                onChange: (e) => setFitnessForm({ ...fitnessForm, crr: parseFloat(e.target.value) }),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Riding Position" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: fitnessForm.position,
                onChange: (e) => setFitnessForm({ ...fitnessForm, position: e.target.value }),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hoods", children: "Hoods" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "drops", children: "Drops" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "aero", children: "Aero" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "tops", children: "Tops" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600", children: "💡" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-amber-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Tip:" }),
            " This profile is used for route predictions and iOS ride intelligence. Update your FTP regularly after fitness tests for accurate pacing recommendations."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-4 border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-6 py-2 bg-gradient-to-r from-velo-cyan-500 to-velo-blue-500 text-white rounded-md hover:from-velo-cyan-600 hover:to-velo-blue-600 font-semibold",
              children: "Save Profile"
            }
          ),
          editingFitness && fitnessProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setEditingFitness(false);
                setFitnessForm({
                  name: fitnessProfile.name,
                  mass: parseFloat(fitnessProfile.mass),
                  ftp: fitnessProfile.ftp,
                  cda: parseFloat(fitnessProfile.cda),
                  crr: parseFloat(fitnessProfile.crr),
                  drivetrain_loss: parseFloat(fitnessProfile.drivetrain_loss),
                  position: fitnessProfile.position
                });
              },
              className: "px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50",
              children: "Cancel"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Weight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-gray-900", children: [
            fitnessProfile.mass,
            " lbs"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "FTP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-gray-900", children: [
            fitnessProfile.ftp,
            " watts"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "CdA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-gray-900", children: fitnessProfile.cda })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Rolling Resistance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-gray-900", children: fitnessProfile.crr })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Position" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-gray-900 capitalize", children: fitnessProfile.position })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Power-to-Weight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-gray-900", children: [
            (fitnessProfile.ftp / (fitnessProfile.mass * 0.453592)).toFixed(2),
            " W/kg"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow rounded-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Strava Integration" }),
      stravaConnected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-6 w-6 text-green-500 mr-2", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600 font-medium", children: "Connected to Strava" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Your Strava activities are being synced automatically. You can view imported rides in the Sessions page." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleStravaDisconnect,
            className: "px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50",
            children: "Disconnect Strava"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Connect your Strava account to automatically import your cycling activities and share your VeloMind rides with the Strava community." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleStravaConnect,
            className: "inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 mr-2", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" }) }),
              "Connect with Strava"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow rounded-lg p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Bluetooth Devices" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Bluetooth sensors (heart rate monitors, speed/cadence sensors) are managed in the iOS app. Open VeloMind on your iPhone to connect and configure sensors." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow rounded-lg p-6 border-2 border-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-red-600 mb-4", children: "Danger Zone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Once you delete your account, there is no going back. All your sessions, routes, and data will be permanently deleted." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => alert("Account deletion feature coming soon"),
          className: "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700",
          children: "Delete Account"
        }
      )
    ] })
  ] });
}
export {
  Settings as default
};
