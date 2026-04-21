import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-1C0h7GIa.js";
import { w as getParameters, u as updateParameters, x as createParameters, y as deleteParameters } from "./api-DVYe6O7N.js";
import "./vendor-DqMYeBgE.js";
import "./charts-DAd8QRTx.js";
function Parameters() {
  const [parameters, setParameters] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    name: "",
    total_mass_kg: "",
    frontal_area_m2: "",
    drag_coefficient: "",
    rolling_resistance: "0.004",
    drivetrain_loss: "0.03",
    ftp: ""
  });
  reactExports.useEffect(() => {
    loadParameters();
  }, []);
  const loadParameters = async () => {
    try {
      const response = await getParameters();
      setParameters(response.data.parameters || []);
    } catch (error) {
      console.error("Failed to load parameters:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const params = {
      ...formData,
      total_mass_kg: parseFloat(formData.total_mass_kg),
      frontal_area_m2: parseFloat(formData.frontal_area_m2),
      drag_coefficient: parseFloat(formData.drag_coefficient),
      rolling_resistance: parseFloat(formData.rolling_resistance),
      drivetrain_loss: parseFloat(formData.drivetrain_loss),
      ftp: formData.ftp ? parseInt(formData.ftp) : null
    };
    try {
      if (editingId) {
        await updateParameters(editingId, params);
      } else {
        await createParameters(params);
      }
      await loadParameters();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        total_mass_kg: "",
        frontal_area_m2: "",
        drag_coefficient: "",
        rolling_resistance: "0.004",
        drivetrain_loss: "0.03",
        ftp: ""
      });
    } catch (error) {
      console.error("Failed to save parameters:", error);
      alert("Failed to save parameters");
    }
  };
  const handleEdit = (param) => {
    setEditingId(param.id);
    setFormData({
      name: param.name,
      total_mass_kg: param.total_mass_kg.toString(),
      frontal_area_m2: param.frontal_area_m2.toString(),
      drag_coefficient: param.drag_coefficient.toString(),
      rolling_resistance: param.rolling_resistance.toString(),
      drivetrain_loss: param.drivetrain_loss.toString(),
      ftp: param.ftp ? param.ftp.toString() : ""
    });
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this parameter set?")) return;
    try {
      await deleteParameters(id);
      setParameters(parameters.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete parameters:", error);
      alert("Failed to delete parameters");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Rider Parameters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              total_mass_kg: "",
              frontal_area_m2: "",
              drag_coefficient: "",
              rolling_resistance: "0.004",
              drivetrain_loss: "0.03",
              ftp: ""
            });
          },
          className: "px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700",
          children: showForm ? "Cancel" : "New Parameter Set"
        }
      )
    ] }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow rounded-lg p-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold mb-4", children: [
        editingId ? "Edit" : "New",
        " Parameter Set"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              required: true,
              value: formData.name,
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
              placeholder: "e.g., Road Bike, TT Bike"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Total Mass (lbs)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.1",
                required: true,
                value: formData.total_mass_kg,
                onChange: (e) => setFormData({ ...formData, total_mass_kg: e.target.value }),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                placeholder: "Rider + bike weight"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "FTP (watts)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: formData.ftp,
                onChange: (e) => setFormData({ ...formData, ftp: e.target.value }),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                placeholder: "Functional Threshold Power"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Frontal Area (m²)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.001",
                required: true,
                value: formData.frontal_area_m2,
                onChange: (e) => setFormData({ ...formData, frontal_area_m2: e.target.value }),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                placeholder: "Typical: 0.35-0.5"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Drag Coefficient (Cd)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                required: true,
                value: formData.drag_coefficient,
                onChange: (e) => setFormData({ ...formData, drag_coefficient: e.target.value }),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                placeholder: "Typical: 0.7-1.0"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Rolling Resistance (Crr)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.0001",
                required: true,
                value: formData.rolling_resistance,
                onChange: (e) => setFormData({ ...formData, rolling_resistance: e.target.value }),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                placeholder: "Typical: 0.003-0.005"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Drivetrain Loss (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.001",
                required: true,
                value: formData.drivetrain_loss,
                onChange: (e) => setFormData({ ...formData, drivetrain_loss: e.target.value }),
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                placeholder: "Typical: 0.02-0.04"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setShowForm(false);
                setEditingId(null);
              },
              className: "px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700",
              children: editingId ? "Update" : "Create"
            }
          )
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Loading..." }) : parameters.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 bg-white rounded-lg shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No parameter sets created yet" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: parameters.map((param) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow rounded-lg p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900", children: param.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleEdit(param),
              className: "text-primary-600 hover:text-primary-900",
              children: "Edit"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleDelete(param.id),
              className: "text-red-600 hover:text-red-900",
              children: "Delete"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-gray-500", children: "Total Mass:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "font-medium text-gray-900", children: [
            param.total_mass_kg,
            " lbs"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-gray-500", children: "CdA:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "font-medium text-gray-900", children: [
            (param.frontal_area_m2 * param.drag_coefficient).toFixed(3),
            " m²"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-gray-500", children: "Rolling Resistance:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-gray-900", children: param.rolling_resistance })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-gray-500", children: "Drivetrain Loss:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "font-medium text-gray-900", children: [
            (param.drivetrain_loss * 100).toFixed(1),
            "%"
          ] })
        ] }),
        param.ftp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-gray-500", children: "FTP:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "font-medium text-gray-900", children: [
            param.ftp,
            " W"
          ] })
        ] })
      ] })
    ] }, param.id)) })
  ] });
}
export {
  Parameters as default
};
