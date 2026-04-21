import { c as commonjsGlobal, g as getDefaultExportFromCjs } from "./charts-DAd8QRTx.js";
import { r as reactExports, R as React } from "./react-vendor-1C0h7GIa.js";
var scheduler = { exports: {} };
var scheduler_production_min = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(exports$1) {
  function f(a2, b) {
    var c2 = a2.length;
    a2.push(b);
    a: for (; 0 < c2; ) {
      var d = c2 - 1 >>> 1, e = a2[d];
      if (0 < g(e, b)) a2[d] = b, a2[c2] = e, c2 = d;
      else break a;
    }
  }
  function h(a2) {
    return 0 === a2.length ? null : a2[0];
  }
  function k2(a2) {
    if (0 === a2.length) return null;
    var b = a2[0], c2 = a2.pop();
    if (c2 !== b) {
      a2[0] = c2;
      a: for (var d = 0, e = a2.length, w = e >>> 1; d < w; ) {
        var m = 2 * (d + 1) - 1, C = a2[m], n = m + 1, x2 = a2[n];
        if (0 > g(C, c2)) n < e && 0 > g(x2, C) ? (a2[d] = x2, a2[n] = c2, d = n) : (a2[d] = C, a2[m] = c2, d = m);
        else if (n < e && 0 > g(x2, c2)) a2[d] = x2, a2[n] = c2, d = n;
        else break a;
      }
    }
    return b;
  }
  function g(a2, b) {
    var c2 = a2.sortIndex - b.sortIndex;
    return 0 !== c2 ? c2 : a2.id - b.id;
  }
  if ("object" === typeof performance && "function" === typeof performance.now) {
    var l = performance;
    exports$1.unstable_now = function() {
      return l.now();
    };
  } else {
    var p = Date, q = p.now();
    exports$1.unstable_now = function() {
      return p.now() - q;
    };
  }
  var r2 = [], t = [], u = 1, v = null, y2 = 3, z = false, A = false, B = false, D = "function" === typeof setTimeout ? setTimeout : null, E = "function" === typeof clearTimeout ? clearTimeout : null, F = "undefined" !== typeof setImmediate ? setImmediate : null;
  "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function G(a2) {
    for (var b = h(t); null !== b; ) {
      if (null === b.callback) k2(t);
      else if (b.startTime <= a2) k2(t), b.sortIndex = b.expirationTime, f(r2, b);
      else break;
      b = h(t);
    }
  }
  function H(a2) {
    B = false;
    G(a2);
    if (!A) if (null !== h(r2)) A = true, I(J);
    else {
      var b = h(t);
      null !== b && K(H, b.startTime - a2);
    }
  }
  function J(a2, b) {
    A = false;
    B && (B = false, E(L), L = -1);
    z = true;
    var c2 = y2;
    try {
      G(b);
      for (v = h(r2); null !== v && (!(v.expirationTime > b) || a2 && !M()); ) {
        var d = v.callback;
        if ("function" === typeof d) {
          v.callback = null;
          y2 = v.priorityLevel;
          var e = d(v.expirationTime <= b);
          b = exports$1.unstable_now();
          "function" === typeof e ? v.callback = e : v === h(r2) && k2(r2);
          G(b);
        } else k2(r2);
        v = h(r2);
      }
      if (null !== v) var w = true;
      else {
        var m = h(t);
        null !== m && K(H, m.startTime - b);
        w = false;
      }
      return w;
    } finally {
      v = null, y2 = c2, z = false;
    }
  }
  var N = false, O = null, L = -1, P2 = 5, Q = -1;
  function M() {
    return exports$1.unstable_now() - Q < P2 ? false : true;
  }
  function R() {
    if (null !== O) {
      var a2 = exports$1.unstable_now();
      Q = a2;
      var b = true;
      try {
        b = O(true, a2);
      } finally {
        b ? S() : (N = false, O = null);
      }
    } else N = false;
  }
  var S;
  if ("function" === typeof F) S = function() {
    F(R);
  };
  else if ("undefined" !== typeof MessageChannel) {
    var T = new MessageChannel(), U = T.port2;
    T.port1.onmessage = R;
    S = function() {
      U.postMessage(null);
    };
  } else S = function() {
    D(R, 0);
  };
  function I(a2) {
    O = a2;
    N || (N = true, S());
  }
  function K(a2, b) {
    L = D(function() {
      a2(exports$1.unstable_now());
    }, b);
  }
  exports$1.unstable_IdlePriority = 5;
  exports$1.unstable_ImmediatePriority = 1;
  exports$1.unstable_LowPriority = 4;
  exports$1.unstable_NormalPriority = 3;
  exports$1.unstable_Profiling = null;
  exports$1.unstable_UserBlockingPriority = 2;
  exports$1.unstable_cancelCallback = function(a2) {
    a2.callback = null;
  };
  exports$1.unstable_continueExecution = function() {
    A || z || (A = true, I(J));
  };
  exports$1.unstable_forceFrameRate = function(a2) {
    0 > a2 || 125 < a2 ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P2 = 0 < a2 ? Math.floor(1e3 / a2) : 5;
  };
  exports$1.unstable_getCurrentPriorityLevel = function() {
    return y2;
  };
  exports$1.unstable_getFirstCallbackNode = function() {
    return h(r2);
  };
  exports$1.unstable_next = function(a2) {
    switch (y2) {
      case 1:
      case 2:
      case 3:
        var b = 3;
        break;
      default:
        b = y2;
    }
    var c2 = y2;
    y2 = b;
    try {
      return a2();
    } finally {
      y2 = c2;
    }
  };
  exports$1.unstable_pauseExecution = function() {
  };
  exports$1.unstable_requestPaint = function() {
  };
  exports$1.unstable_runWithPriority = function(a2, b) {
    switch (a2) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        a2 = 3;
    }
    var c2 = y2;
    y2 = a2;
    try {
      return b();
    } finally {
      y2 = c2;
    }
  };
  exports$1.unstable_scheduleCallback = function(a2, b, c2) {
    var d = exports$1.unstable_now();
    "object" === typeof c2 && null !== c2 ? (c2 = c2.delay, c2 = "number" === typeof c2 && 0 < c2 ? d + c2 : d) : c2 = d;
    switch (a2) {
      case 1:
        var e = -1;
        break;
      case 2:
        e = 250;
        break;
      case 5:
        e = 1073741823;
        break;
      case 4:
        e = 1e4;
        break;
      default:
        e = 5e3;
    }
    e = c2 + e;
    a2 = { id: u++, callback: b, priorityLevel: a2, startTime: c2, expirationTime: e, sortIndex: -1 };
    c2 > d ? (a2.sortIndex = c2, f(t, a2), null === h(r2) && a2 === h(t) && (B ? (E(L), L = -1) : B = true, K(H, c2 - d))) : (a2.sortIndex = e, f(r2, a2), A || z || (A = true, I(J)));
    return a2;
  };
  exports$1.unstable_shouldYield = M;
  exports$1.unstable_wrapCallback = function(a2) {
    var b = y2;
    return function() {
      var c2 = y2;
      y2 = b;
      try {
        return a2.apply(this, arguments);
      } finally {
        y2 = c2;
      }
    };
  };
})(scheduler_production_min);
{
  scheduler.exports = scheduler_production_min;
}
var schedulerExports = scheduler.exports;
/**
 * @remix-run/router v1.23.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
var Action;
(function(Action2) {
  Action2["Pop"] = "POP";
  Action2["Push"] = "PUSH";
  Action2["Replace"] = "REPLACE";
})(Action || (Action = {}));
const PopStateEventType = "popstate";
function createBrowserHistory(options) {
  if (options === void 0) {
    options = {};
  }
  function createBrowserLocation(window2, globalHistory) {
    let {
      pathname,
      search,
      hash
    } = window2.location;
    return createLocation(
      "",
      {
        pathname,
        search,
        hash
      },
      // state defaults to `null` because `window.history.state` does
      globalHistory.state && globalHistory.state.usr || null,
      globalHistory.state && globalHistory.state.key || "default"
    );
  }
  function createBrowserHref(window2, to) {
    return typeof to === "string" ? to : createPath(to);
  }
  return getUrlBasedHistory(createBrowserLocation, createBrowserHref, null, options);
}
function invariant$1(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createKey() {
  return Math.random().toString(36).substr(2, 8);
}
function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index
  };
}
function createLocation(current, to, state, key) {
  if (state === void 0) {
    state = null;
  }
  let location = _extends({
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: ""
  }, typeof to === "string" ? parsePath(to) : to, {
    state,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: to && to.key || key || createKey()
  });
  return location;
}
function createPath(_ref) {
  let {
    pathname = "/",
    search = "",
    hash = ""
  } = _ref;
  if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex);
      path = path.substr(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex);
      path = path.substr(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref, validateLocation, options) {
  if (options === void 0) {
    options = {};
  }
  let {
    window: window2 = document.defaultView,
    v5Compat = false
  } = options;
  let globalHistory = window2.history;
  let action = Action.Pop;
  let listener = null;
  let index = getIndex();
  if (index == null) {
    index = 0;
    globalHistory.replaceState(_extends({}, globalHistory.state, {
      idx: index
    }), "");
  }
  function getIndex() {
    let state = globalHistory.state || {
      idx: null
    };
    return state.idx;
  }
  function handlePop() {
    action = Action.Pop;
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({
        action,
        location: history.location,
        delta
      });
    }
  }
  function push(to, state) {
    action = Action.Push;
    let location = createLocation(history.location, to, state);
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      window2.location.assign(url);
    }
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 1
      });
    }
  }
  function replace(to, state) {
    action = Action.Replace;
    let location = createLocation(history.location, to, state);
    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);
    if (v5Compat && listener) {
      listener({
        action,
        location: history.location,
        delta: 0
      });
    }
  }
  function createURL(to) {
    let base = window2.location.origin !== "null" ? window2.location.origin : window2.location.href;
    let href = typeof to === "string" ? to : createPath(to);
    href = href.replace(/ $/, "%20");
    invariant$1(base, "No window.location.(origin|href) available to create URL for href: " + href);
    return new URL(href, base);
  }
  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window2, globalHistory);
    },
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window2.addEventListener(PopStateEventType, handlePop);
      listener = fn;
      return () => {
        window2.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref(window2, to);
    },
    createURL,
    encodeLocation(to) {
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    },
    push,
    replace,
    go(n) {
      return globalHistory.go(n);
    }
  };
  return history;
}
var ResultType;
(function(ResultType2) {
  ResultType2["data"] = "data";
  ResultType2["deferred"] = "deferred";
  ResultType2["redirect"] = "redirect";
  ResultType2["error"] = "error";
})(ResultType || (ResultType = {}));
function matchRoutes(routes, locationArg, basename) {
  if (basename === void 0) {
    basename = "/";
  }
  return matchRoutesImpl(routes, locationArg, basename);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial) {
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    let decoded = decodePath(pathname);
    matches = matchRouteBranch(branches[i], decoded);
  }
  return matches;
}
function flattenRoutes(routes, branches, parentsMeta, parentPath) {
  if (branches === void 0) {
    branches = [];
  }
  if (parentsMeta === void 0) {
    parentsMeta = [];
  }
  if (parentPath === void 0) {
    parentPath = "";
  }
  let flattenRoute = (route, index, relativePath) => {
    let meta = {
      relativePath: relativePath === void 0 ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      invariant$1(meta.relativePath.startsWith(parentPath), 'Absolute route path "' + meta.relativePath + '" nested under path ' + ('"' + parentPath + '" is not valid. An absolute child route path ') + "must start with the combined path of all its parent routes.");
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    if (route.children && route.children.length > 0) {
      invariant$1(
        // Our types know better, but runtime JS may not!
        // @ts-expect-error
        route.index !== true,
        "Index routes must not have child routes. Please remove " + ('all child routes from route path "' + path + '".')
      );
      flattenRoutes(route.children, branches, routesMeta, path);
    }
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes.forEach((route, index) => {
    var _route$path;
    if (route.path === "" || !((_route$path = route.path) != null && _route$path.includes("?"))) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, exploded);
      }
    }
  });
  return branches;
}
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0) return [];
  let [first, ...rest] = segments;
  let isOptional = first.endsWith("?");
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  result.push(...restExploded.map((subpath) => subpath === "" ? required : [required, subpath].join("/")));
  if (isOptional) {
    result.push(...restExploded);
  }
  return result.map((exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded);
}
function rankRouteBranches(branches) {
  branches.sort((a2, b) => a2.score !== b.score ? b.score - a2.score : compareIndexes(a2.routesMeta.map((meta) => meta.childrenIndex), b.routesMeta.map((meta) => meta.childrenIndex)));
}
const paramRe = /^:[\w-]+$/;
const dynamicSegmentValue = 3;
const indexRouteValue = 2;
const emptySegmentValue = 1;
const staticSegmentValue = 10;
const splatPenalty = -2;
const isSplat = (s2) => s2 === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter((s2) => !isSplat(s2)).reduce((score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue), initialScore);
}
function compareIndexes(a2, b) {
  let siblings = a2.length === b.length && a2.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a2[a2.length - 1] - b[b.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function matchRouteBranch(branch, pathname, allowPartial) {
  let {
    routesMeta
  } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath({
      path: meta.relativePath,
      caseSensitive: meta.caseSensitive,
      end
    }, remainingPathname);
    let route = meta.route;
    if (!match) {
      return null;
    }
    Object.assign(matchedParams, match.params);
    matches.push({
      // TODO: Can this as be avoided?
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = {
      path: pattern,
      caseSensitive: false,
      end: true
    };
  }
  let [matcher, compiledParams] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce((memo, _ref, index) => {
    let {
      paramName,
      isOptional
    } = _ref;
    if (paramName === "*") {
      let splatValue = captureGroups[index] || "";
      pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
    }
    const value = captureGroups[index];
    if (isOptional && !value) {
      memo[paramName] = void 0;
    } else {
      memo[paramName] = (value || "").replace(/%2F/g, "/");
    }
    return memo;
  }, {});
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive, end) {
  if (caseSensitive === void 0) {
    caseSensitive = false;
  }
  if (end === void 0) {
    end = true;
  }
  warning(path === "*" || !path.endsWith("*") || path.endsWith("/*"), 'Route path "' + path + '" will be treated as if it were ' + ('"' + path.replace(/\*$/, "/*") + '" because the `*` character must ') + "always follow a `/` in the pattern. To get rid of this warning, " + ('please change the route path to "' + path.replace(/\*$/, "/*") + '".'));
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (_, paramName, isOptional) => {
    params.push({
      paramName,
      isOptional: isOptional != null
    });
    return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
  });
  if (path.endsWith("*")) {
    params.push({
      paramName: "*"
    });
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else ;
  let matcher = new RegExp(regexpSource, caseSensitive ? void 0 : "i");
  return [matcher, params];
}
function decodePath(value) {
  try {
    return value.split("/").map((v) => decodeURIComponent(v).replace(/\//g, "%2F")).join("/");
  } catch (error) {
    warning(false, 'The URL path "' + value + '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' + ("encoding (" + error + ")."));
    return value;
  }
}
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
const ABSOLUTE_URL_REGEX$1 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const isAbsoluteUrl = (url) => ABSOLUTE_URL_REGEX$1.test(url);
function resolvePath(to, fromPathname) {
  if (fromPathname === void 0) {
    fromPathname = "/";
  }
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname;
  if (toPathname) {
    if (isAbsoluteUrl(toPathname)) {
      pathname = toPathname;
    } else {
      if (toPathname.includes("//")) {
        let oldPathname = toPathname;
        toPathname = toPathname.replace(/\/\/+/g, "/");
        warning(false, "Pathnames cannot have embedded double slashes - normalizing " + (oldPathname + " -> " + toPathname));
      }
      if (toPathname.startsWith("/")) {
        pathname = resolvePathname(toPathname.substring(1), "/");
      } else {
        pathname = resolvePathname(toPathname, fromPathname);
      }
    }
  } else {
    pathname = fromPathname;
  }
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return "Cannot include a '" + char + "' character in a manually specified " + ("`to." + field + "` field [" + JSON.stringify(path) + "].  Please separate it out to the ") + ("`to." + dest + "` field. Alternatively you may provide the full path as ") + 'a string in <Link to="..."> and the router will parse it for you.';
}
function getPathContributingMatches(matches) {
  return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0);
}
function getResolveToMatches(matches, v7_relativeSplatPath) {
  let pathMatches = getPathContributingMatches(matches);
  if (v7_relativeSplatPath) {
    return pathMatches.map((match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase);
  }
  return pathMatches.map((match) => match.pathnameBase);
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative) {
  if (isPathRelative === void 0) {
    isPathRelative = false;
  }
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = _extends({}, toArg);
    invariant$1(!to.pathname || !to.pathname.includes("?"), getInvalidPathError("?", "pathname", "search", to));
    invariant$1(!to.pathname || !to.pathname.includes("#"), getInvalidPathError("#", "pathname", "hash", to));
    invariant$1(!to.search || !to.search.includes("#"), getInvalidPathError("#", "search", "hash", to));
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (!isPathRelative && toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
const joinPaths = (paths) => paths.join("/").replace(/\/\/+/g, "/");
const normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
const normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
const normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
const validMutationMethodsArr = ["post", "put", "patch", "delete"];
new Set(validMutationMethodsArr);
const validRequestMethodsArr = ["get", ...validMutationMethodsArr];
new Set(validRequestMethodsArr);
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString: toString$5 } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString$5.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray: isArray$f } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer$3(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction$5(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString$2 = typeOfTest("string");
const isFunction$5 = typeOfTest("function");
const isNumber$3 = typeOfTest("number");
const isObject$9 = (thing) => thing !== null && typeof thing === "object";
const isBoolean$2 = (thing) => thing === true || thing === false;
const isPlainObject$2 = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject$9(val) || isBuffer$3(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject$9(val) && isFunction$5(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction$5(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction$5(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray$f(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer$3(obj)) {
      return;
    }
    const keys2 = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys2.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys2[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer$3(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys2 = Object.keys(obj);
  let i = keys2.length;
  let _key;
  while (i-- > 0) {
    _key = keys2[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject$2(result[targetKey]) && isPlainObject$2(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject$2(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray$f(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend$1 = (a2, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction$5(val)) {
      a2[key] = bind(val, thisArg);
    } else {
      a2[key] = val;
    }
  }, { allOwnKeys });
  return a2;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray$f(thing)) return thing;
  let i = thing.length;
  if (!isNumber$3(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray$3 = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty$b = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction$5(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction$5(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define2 = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray$f(arrayOrString) ? define2(arrayOrString) : define2(String(arrayOrString).split(delimiter));
  return obj;
};
const noop$3 = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction$5(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject$9(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer$3(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray$f(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject$9(thing) || isFunction$5(thing)) && isFunction$5(thing.then) && isFunction$5(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction$5(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction$5(thing[iterator]);
const utils$1 = {
  isArray: isArray$f,
  isArrayBuffer,
  isBuffer: isBuffer$3,
  isFormData,
  isArrayBufferView,
  isString: isString$2,
  isNumber: isNumber$3,
  isBoolean: isBoolean$2,
  isObject: isObject$9,
  isPlainObject: isPlainObject$2,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction: isFunction$5,
  isStream,
  isURLSearchParams,
  isTypedArray: isTypedArray$3,
  isFileList,
  forEach,
  merge,
  extend: extend$1,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty: hasOwnProperty$b,
  hasOwnProp: hasOwnProperty$b,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop: noop$3,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config2, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config2 && (this.config = config2);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$1.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config2, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$1.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  const msg = error && error.message ? error.message : "Error";
  const errCode = code == null && error ? error.code : code;
  AxiosError$1.call(axiosError, msg, errCode, config2, request, response);
  if (error && axiosError.cause == null) {
    Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
  }
  axiosError.name = error && error.name || "Error";
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
const httpAdapter = null;
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new FormData();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$1.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  if (utils$1.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
const FormData$1 = typeof FormData !== "undefined" ? FormData : null;
const Blob$1 = typeof Blob !== "undefined" ? Blob : null;
const platform$1 = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: Blob$1
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = {
  ...utils,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys2 = Object.keys(arr);
  let i;
  const len = keys2.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys2[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults$1 = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults$1.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data, this.parseReviver);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults$1.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys2 = Object.keys(this);
    let i = keys2.length;
    let deleted = false;
    while (i--) {
      const key = keys2[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format2) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format2 ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config2 = this || defaults$1;
  const context = response || config2;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config2, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config2, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config2, request);
  this.name = "CanceledError";
}
utils$1.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
function speedometer(samplesCount, min2) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min2 = min2 !== void 0 ? min2 : 1e3;
  return function push(chunkLength) {
    const now2 = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now2;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now2;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now2 - firstSampleTS < min2) {
      return;
    }
    const passed = startedAt && now2 - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle$2(fn, freq) {
  let timestamp = 0;
  let threshold2 = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now2 = Date.now()) => {
    timestamp = now2;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now2 = Date.now();
    const passed = now2 - timestamp;
    if (passed >= threshold2) {
      invoke(args, now2);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold2 - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle$2((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure, sameSite) {
      if (typeof document === "undefined") return;
      const cookie = [`${name}=${encodeURIComponent(value)}`];
      if (utils$1.isNumber(expires)) {
        cookie.push(`expires=${new Date(expires).toUTCString()}`);
      }
      if (utils$1.isString(path)) {
        cookie.push(`path=${path}`);
      }
      if (utils$1.isString(domain)) {
        cookie.push(`domain=${domain}`);
      }
      if (secure === true) {
        cookie.push("secure");
      }
      if (utils$1.isString(sameSite)) {
        cookie.push(`SameSite=${sameSite}`);
      }
      document.cookie = cookie.join("; ");
    },
    read(name) {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config3 = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a2, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a2, b, prop, caseless);
    } else if (!utils$1.isUndefined(a2)) {
      return getMergedValue(void 0, a2, prop, caseless);
    }
  }
  function valueFromConfig2(a2, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a2, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$1.isUndefined(a2)) {
      return getMergedValue(void 0, a2);
    }
  }
  function mergeDirectKeys(a2, b, prop) {
    if (prop in config2) {
      return getMergedValue(a2, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a2);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a2, b, prop) => mergeDeepProperties(headersToObject(a2), headersToObject(b), prop, true)
  };
  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config3[prop] = configValue);
  });
  return config3;
}
const resolveConfig = (config2) => {
  const newConfig = mergeConfig$1({}, config2);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config2.params, config2.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if (utils$1.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config2) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config2);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config2,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config2, request));
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config2, request);
      err.event = event || null;
      reject(err);
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config2,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config2, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config2));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const { isFunction: isFunction$4 } = utils$1;
const globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response
}))(utils$1.global);
const {
  ReadableStream: ReadableStream$1,
  TextEncoder
} = utils$1.global;
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const factory = (env) => {
  env = utils$1.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction$4(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction$4(Request);
  const isResponseSupported = isFunction$4(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction$4(ReadableStream$1);
  const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream$1(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
      !resolvers[type] && (resolvers[type] = (res, config2) => {
        let method = res && res[type];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config2);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils$1.isBlob(body)) {
      return body.size;
    }
    if (utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils$1.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config2) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig(config2);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
        let _request = new Request(url, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request(url, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config2);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config: config2,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config2, request),
          {
            cause: err.cause || err
          }
        );
      }
      throw AxiosError$1.from(err, err && err.code, config2, request);
    }
  };
};
const seedCache = /* @__PURE__ */ new Map();
const getFetch = (config2) => {
  let env = config2 && config2.env || {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [
    Request,
    Response,
    fetch2
  ];
  let len = seeds.length, i = len, seed, target, map2 = seedCache;
  while (i--) {
    seed = seeds[i];
    target = map2.get(seed);
    target === void 0 && map2.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
    map2 = target;
  }
  return target;
};
getFetch();
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: {
    get: getFetch
  }
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
function getAdapter$1(adapters2, config2) {
  adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
  const { length } = adapters2;
  let nameOrAdapter;
  let adapter;
  const rejectedReasons = {};
  for (let i = 0; i < length; i++) {
    nameOrAdapter = adapters2[i];
    let id;
    adapter = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter === void 0) {
        throw new AxiosError$1(`Unknown adapter '${id}'`);
      }
    }
    if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config2)))) {
      break;
    }
    rejectedReasons[id || "#" + i] = adapter;
  }
  if (!adapter) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
    );
    let s2 = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError$1(
      `There is no suitable adapter to dispatch the request ` + s2,
      "ERR_NOT_SUPPORT"
    );
  }
  return adapter;
}
const adapters = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: getAdapter$1,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: knownAdapters
};
function throwIfCancellationRequested(config2) {
  if (config2.cancelToken) {
    config2.cancelToken.throwIfRequested();
  }
  if (config2.signal && config2.signal.aborted) {
    throw new CanceledError$1(null, config2);
  }
}
function dispatchRequest(config2) {
  throwIfCancellationRequested(config2);
  config2.headers = AxiosHeaders$1.from(config2.headers);
  config2.data = transformData.call(
    config2,
    config2.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config2.method) !== -1) {
    config2.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config2.adapter || defaults$1.adapter, config2);
  return adapter(config2).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config2);
    response.data = transformData.call(
      config2,
      config2.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config2);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config2,
          config2.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const VERSION$1 = "1.13.2";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators$1[type] = function validator2(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys2 = Object.keys(options);
  let i = keys2.length;
  while (i-- > 0) {
    const opt = keys2[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config2) {
    try {
      return await this._request(configOrUrl, config2);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config2) {
    if (typeof configOrUrl === "string") {
      config2 = config2 || {};
      config2.url = configOrUrl;
    } else {
      config2 = configOrUrl || {};
    }
    config2 = mergeConfig$1(this.defaults, config2);
    const { transitional: transitional2, paramsSerializer, headers } = config2;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config2.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config2.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config2.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config2.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config2, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config2.method = (config2.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config2.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config2.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config2) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config2);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config2;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config2) {
    config2 = mergeConfig$1(this.defaults, config2);
    const fullPath = buildFullPath(config2.baseURL, config2.url, config2.allowAbsoluteUrls);
    return buildURL(fullPath, config2.params, config2.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url, config2) {
    return this.request(mergeConfig$1(config2 || {}, {
      method,
      url,
      data: (config2 || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config2) {
      return this.request(mergeConfig$1(config2 || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config2, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config2, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c2) {
      cancel = c2;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults$1);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
var isArray$e = Array.isArray;
var isArray_1 = isArray$e;
var freeGlobal$1 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
var _freeGlobal = freeGlobal$1;
var freeGlobal = _freeGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root$9 = freeGlobal || freeSelf || Function("return this")();
var _root = root$9;
var root$8 = _root;
var Symbol$7 = root$8.Symbol;
var _Symbol = Symbol$7;
var Symbol$6 = _Symbol;
var objectProto$c = Object.prototype;
var hasOwnProperty$a = objectProto$c.hasOwnProperty;
var nativeObjectToString$1 = objectProto$c.toString;
var symToStringTag$1 = Symbol$6 ? Symbol$6.toStringTag : void 0;
function getRawTag$1(value) {
  var isOwn = hasOwnProperty$a.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var _getRawTag = getRawTag$1;
var objectProto$b = Object.prototype;
var nativeObjectToString = objectProto$b.toString;
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}
var _objectToString = objectToString$1;
var Symbol$5 = _Symbol, getRawTag = _getRawTag, objectToString = _objectToString;
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$5 ? Symbol$5.toStringTag : void 0;
function baseGetTag$9(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
var _baseGetTag = baseGetTag$9;
function isObjectLike$9(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_1 = isObjectLike$9;
var baseGetTag$8 = _baseGetTag, isObjectLike$8 = isObjectLike_1;
var symbolTag$1 = "[object Symbol]";
function isSymbol$6(value) {
  return typeof value == "symbol" || isObjectLike$8(value) && baseGetTag$8(value) == symbolTag$1;
}
var isSymbol_1 = isSymbol$6;
var isArray$d = isArray_1, isSymbol$5 = isSymbol_1;
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
function isKey$3(value, object2) {
  if (isArray$d(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol$5(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object2 != null && value in Object(object2);
}
var _isKey = isKey$3;
function isObject$7(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_1 = isObject$7;
const isObject$8 = /* @__PURE__ */ getDefaultExportFromCjs(isObject_1);
var baseGetTag$7 = _baseGetTag, isObject$6 = isObject_1;
var asyncTag = "[object AsyncFunction]", funcTag$1 = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction$2(value) {
  if (!isObject$6(value)) {
    return false;
  }
  var tag = baseGetTag$7(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var isFunction_1 = isFunction$2;
const isFunction$3 = /* @__PURE__ */ getDefaultExportFromCjs(isFunction_1);
var root$7 = _root;
var coreJsData$1 = root$7["__core-js_shared__"];
var _coreJsData = coreJsData$1;
var coreJsData = _coreJsData;
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked$1(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var _isMasked = isMasked$1;
var funcProto$2 = Function.prototype;
var funcToString$2 = funcProto$2.toString;
function toSource$2(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var _toSource = toSource$2;
var isFunction$1 = isFunction_1, isMasked = _isMasked, isObject$5 = isObject_1, toSource$1 = _toSource;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto$1 = Function.prototype, objectProto$a = Object.prototype;
var funcToString$1 = funcProto$1.toString;
var hasOwnProperty$9 = objectProto$a.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString$1.call(hasOwnProperty$9).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative$1(value) {
  if (!isObject$5(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource$1(value));
}
var _baseIsNative = baseIsNative$1;
function getValue$1(object2, key) {
  return object2 == null ? void 0 : object2[key];
}
var _getValue = getValue$1;
var baseIsNative = _baseIsNative, getValue = _getValue;
function getNative$7(object2, key) {
  var value = getValue(object2, key);
  return baseIsNative(value) ? value : void 0;
}
var _getNative = getNative$7;
var getNative$6 = _getNative;
var nativeCreate$4 = getNative$6(Object, "create");
var _nativeCreate = nativeCreate$4;
var nativeCreate$3 = _nativeCreate;
function hashClear$1() {
  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
  this.size = 0;
}
var _hashClear = hashClear$1;
function hashDelete$1(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var _hashDelete = hashDelete$1;
var nativeCreate$2 = _nativeCreate;
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$9 = Object.prototype;
var hasOwnProperty$8 = objectProto$9.hasOwnProperty;
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$2) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$8.call(data, key) ? data[key] : void 0;
}
var _hashGet = hashGet$1;
var nativeCreate$1 = _nativeCreate;
var objectProto$8 = Object.prototype;
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? data[key] !== void 0 : hasOwnProperty$7.call(data, key);
}
var _hashHas = hashHas$1;
var nativeCreate = _nativeCreate;
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet$1(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
var _hashSet = hashSet$1;
var hashClear = _hashClear, hashDelete = _hashDelete, hashGet = _hashGet, hashHas = _hashHas, hashSet = _hashSet;
function Hash$1(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash$1.prototype.clear = hashClear;
Hash$1.prototype["delete"] = hashDelete;
Hash$1.prototype.get = hashGet;
Hash$1.prototype.has = hashHas;
Hash$1.prototype.set = hashSet;
var _Hash = Hash$1;
function listCacheClear$1() {
  this.__data__ = [];
  this.size = 0;
}
var _listCacheClear = listCacheClear$1;
function eq$3(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_1 = eq$3;
var eq$2 = eq_1;
function assocIndexOf$4(array2, key) {
  var length = array2.length;
  while (length--) {
    if (eq$2(array2[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var _assocIndexOf = assocIndexOf$4;
var assocIndexOf$3 = _assocIndexOf;
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete$1(key) {
  var data = this.__data__, index = assocIndexOf$3(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
var _listCacheDelete = listCacheDelete$1;
var assocIndexOf$2 = _assocIndexOf;
function listCacheGet$1(key) {
  var data = this.__data__, index = assocIndexOf$2(data, key);
  return index < 0 ? void 0 : data[index][1];
}
var _listCacheGet = listCacheGet$1;
var assocIndexOf$1 = _assocIndexOf;
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}
var _listCacheHas = listCacheHas$1;
var assocIndexOf = _assocIndexOf;
function listCacheSet$1(key, value) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
var _listCacheSet = listCacheSet$1;
var listCacheClear = _listCacheClear, listCacheDelete = _listCacheDelete, listCacheGet = _listCacheGet, listCacheHas = _listCacheHas, listCacheSet = _listCacheSet;
function ListCache$4(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache$4.prototype.clear = listCacheClear;
ListCache$4.prototype["delete"] = listCacheDelete;
ListCache$4.prototype.get = listCacheGet;
ListCache$4.prototype.has = listCacheHas;
ListCache$4.prototype.set = listCacheSet;
var _ListCache = ListCache$4;
var getNative$5 = _getNative, root$6 = _root;
var Map$4 = getNative$5(root$6, "Map");
var _Map = Map$4;
var Hash = _Hash, ListCache$3 = _ListCache, Map$3 = _Map;
function mapCacheClear$1() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$3 || ListCache$3)(),
    "string": new Hash()
  };
}
var _mapCacheClear = mapCacheClear$1;
function isKeyable$1(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
var _isKeyable = isKeyable$1;
var isKeyable = _isKeyable;
function getMapData$4(map2, key) {
  var data = map2.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var _getMapData = getMapData$4;
var getMapData$3 = _getMapData;
function mapCacheDelete$1(key) {
  var result = getMapData$3(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var _mapCacheDelete = mapCacheDelete$1;
var getMapData$2 = _getMapData;
function mapCacheGet$1(key) {
  return getMapData$2(this, key).get(key);
}
var _mapCacheGet = mapCacheGet$1;
var getMapData$1 = _getMapData;
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}
var _mapCacheHas = mapCacheHas$1;
var getMapData = _getMapData;
function mapCacheSet$1(key, value) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var _mapCacheSet = mapCacheSet$1;
var mapCacheClear = _mapCacheClear, mapCacheDelete = _mapCacheDelete, mapCacheGet = _mapCacheGet, mapCacheHas = _mapCacheHas, mapCacheSet = _mapCacheSet;
function MapCache$3(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache$3.prototype.clear = mapCacheClear;
MapCache$3.prototype["delete"] = mapCacheDelete;
MapCache$3.prototype.get = mapCacheGet;
MapCache$3.prototype.has = mapCacheHas;
MapCache$3.prototype.set = mapCacheSet;
var _MapCache = MapCache$3;
var MapCache$2 = _MapCache;
var FUNC_ERROR_TEXT$2 = "Expected a function";
function memoize$2(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$2);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize$2.Cache || MapCache$2)();
  return memoized;
}
memoize$2.Cache = MapCache$2;
var memoize_1 = memoize$2;
const memoize$3 = /* @__PURE__ */ getDefaultExportFromCjs(memoize_1);
var memoize$1 = memoize_1;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped$1(func) {
  var result = memoize$1(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var _memoizeCapped = memoizeCapped$1;
var memoizeCapped = _memoizeCapped;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath$1 = memoizeCapped(function(string2) {
  var result = [];
  if (string2.charCodeAt(0) === 46) {
    result.push("");
  }
  string2.replace(rePropName, function(match, number2, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number2 || match);
  });
  return result;
});
var _stringToPath = stringToPath$1;
function arrayMap$3(array2, iteratee) {
  var index = -1, length = array2 == null ? 0 : array2.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array2[index], index, array2);
  }
  return result;
}
var _arrayMap = arrayMap$3;
var Symbol$4 = _Symbol, arrayMap$2 = _arrayMap, isArray$c = isArray_1, isSymbol$4 = isSymbol_1;
var symbolProto$1 = Symbol$4 ? Symbol$4.prototype : void 0, symbolToString = symbolProto$1 ? symbolProto$1.toString : void 0;
function baseToString$1(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray$c(value)) {
    return arrayMap$2(value, baseToString$1) + "";
  }
  if (isSymbol$4(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -Infinity ? "-0" : result;
}
var _baseToString = baseToString$1;
var baseToString = _baseToString;
function toString$4(value) {
  return value == null ? "" : baseToString(value);
}
var toString_1 = toString$4;
var isArray$b = isArray_1, isKey$2 = _isKey, stringToPath = _stringToPath, toString$3 = toString_1;
function castPath$2(value, object2) {
  if (isArray$b(value)) {
    return value;
  }
  return isKey$2(value, object2) ? [value] : stringToPath(toString$3(value));
}
var _castPath = castPath$2;
var isSymbol$3 = isSymbol_1;
function toKey$4(value) {
  if (typeof value == "string" || isSymbol$3(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -Infinity ? "-0" : result;
}
var _toKey = toKey$4;
var castPath$1 = _castPath, toKey$3 = _toKey;
function baseGet$3(object2, path) {
  path = castPath$1(path, object2);
  var index = 0, length = path.length;
  while (object2 != null && index < length) {
    object2 = object2[toKey$3(path[index++])];
  }
  return index && index == length ? object2 : void 0;
}
var _baseGet = baseGet$3;
var baseGet$2 = _baseGet;
function get$1(object2, path, defaultValue) {
  var result = object2 == null ? void 0 : baseGet$2(object2, path);
  return result === void 0 ? defaultValue : result;
}
var get_1 = get$1;
const get$2 = /* @__PURE__ */ getDefaultExportFromCjs(get_1);
function isNil(value) {
  return value == null;
}
var isNil_1 = isNil;
const isNil$1 = /* @__PURE__ */ getDefaultExportFromCjs(isNil_1);
var baseGetTag$6 = _baseGetTag, isArray$a = isArray_1, isObjectLike$7 = isObjectLike_1;
var stringTag$2 = "[object String]";
function isString(value) {
  return typeof value == "string" || !isArray$a(value) && isObjectLike$7(value) && baseGetTag$6(value) == stringTag$2;
}
var isString_1 = isString;
const isString$1 = /* @__PURE__ */ getDefaultExportFromCjs(isString_1);
var baseGetTag$5 = _baseGetTag, isObjectLike$6 = isObjectLike_1;
var numberTag$2 = "[object Number]";
function isNumber$1(value) {
  return typeof value == "number" || isObjectLike$6(value) && baseGetTag$5(value) == numberTag$2;
}
var isNumber_1 = isNumber$1;
const isNumber$2 = /* @__PURE__ */ getDefaultExportFromCjs(isNumber_1);
var isNumber = isNumber_1;
function isNaN$1(value) {
  return isNumber(value) && value != +value;
}
var _isNaN = isNaN$1;
const isNan = /* @__PURE__ */ getDefaultExportFromCjs(_isNaN);
function baseSlice$1(array2, start, end) {
  var index = -1, length = array2.length;
  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result = Array(length);
  while (++index < length) {
    result[index] = array2[index + start];
  }
  return result;
}
var _baseSlice = baseSlice$1;
var baseSlice = _baseSlice;
function castSlice$1(array2, start, end) {
  var length = array2.length;
  end = end === void 0 ? length : end;
  return !start && end >= length ? array2 : baseSlice(array2, start, end);
}
var _castSlice = castSlice$1;
var rsAstralRange$1 = "\\ud800-\\udfff", rsComboMarksRange$1 = "\\u0300-\\u036f", reComboHalfMarksRange$1 = "\\ufe20-\\ufe2f", rsComboSymbolsRange$1 = "\\u20d0-\\u20ff", rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1, rsVarRange$1 = "\\ufe0e\\ufe0f";
var rsZWJ$1 = "\\u200d";
var reHasUnicode = RegExp("[" + rsZWJ$1 + rsAstralRange$1 + rsComboRange$1 + rsVarRange$1 + "]");
function hasUnicode$2(string2) {
  return reHasUnicode.test(string2);
}
var _hasUnicode = hasUnicode$2;
function asciiToArray$1(string2) {
  return string2.split("");
}
var _asciiToArray = asciiToArray$1;
var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsVarRange = "\\ufe0e\\ufe0f";
var rsAstral = "[" + rsAstralRange + "]", rsCombo = "[" + rsComboRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsZWJ = "\\u200d";
var reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
function unicodeToArray$1(string2) {
  return string2.match(reUnicode) || [];
}
var _unicodeToArray = unicodeToArray$1;
var asciiToArray = _asciiToArray, hasUnicode$1 = _hasUnicode, unicodeToArray = _unicodeToArray;
function stringToArray$1(string2) {
  return hasUnicode$1(string2) ? unicodeToArray(string2) : asciiToArray(string2);
}
var _stringToArray = stringToArray$1;
var castSlice = _castSlice, hasUnicode = _hasUnicode, stringToArray = _stringToArray, toString$2 = toString_1;
function createCaseFirst$1(methodName) {
  return function(string2) {
    string2 = toString$2(string2);
    var strSymbols = hasUnicode(string2) ? stringToArray(string2) : void 0;
    var chr = strSymbols ? strSymbols[0] : string2.charAt(0);
    var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string2.slice(1);
    return chr[methodName]() + trailing;
  };
}
var _createCaseFirst = createCaseFirst$1;
var createCaseFirst = _createCaseFirst;
var upperFirst = createCaseFirst("toUpperCase");
var upperFirst_1 = upperFirst;
const upperFirst$1 = /* @__PURE__ */ getDefaultExportFromCjs(upperFirst_1);
function constant$3(x2) {
  return function constant2() {
    return x2;
  };
}
const cos = Math.cos;
const sin = Math.sin;
const sqrt$1 = Math.sqrt;
const pi$1 = Math.PI;
const tau$1 = 2 * pi$1;
const pi = Math.PI, tau = 2 * pi, epsilon = 1e-6, tauEpsilon = tau - epsilon;
function append2(strings) {
  this._ += strings[0];
  for (let i = 1, n = strings.length; i < n; ++i) {
    this._ += arguments[i] + strings[i];
  }
}
function appendRound(digits) {
  let d = Math.floor(digits);
  if (!(d >= 0)) throw new Error(`invalid digits: ${digits}`);
  if (d > 15) return append2;
  const k2 = 10 ** d;
  return function(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length; i < n; ++i) {
      this._ += Math.round(arguments[i] * k2) / k2 + strings[i];
    }
  };
}
class Path {
  constructor(digits) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null;
    this._ = "";
    this._append = digits == null ? append2 : appendRound(digits);
  }
  moveTo(x2, y2) {
    this._append`M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}`;
  }
  closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._append`Z`;
    }
  }
  lineTo(x2, y2) {
    this._append`L${this._x1 = +x2},${this._y1 = +y2}`;
  }
  quadraticCurveTo(x1, y1, x2, y2) {
    this._append`Q${+x1},${+y1},${this._x1 = +x2},${this._y1 = +y2}`;
  }
  bezierCurveTo(x1, y1, x2, y2, x3, y3) {
    this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x3},${this._y1 = +y3}`;
  }
  arcTo(x1, y1, x2, y2, r2) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r2 = +r2;
    if (r2 < 0) throw new Error(`negative radius: ${r2}`);
    let x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
    if (this._x1 === null) {
      this._append`M${this._x1 = x1},${this._y1 = y1}`;
    } else if (!(l01_2 > epsilon)) ;
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r2) {
      this._append`L${this._x1 = x1},${this._y1 = y1}`;
    } else {
      let x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r2 * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
      if (Math.abs(t01 - 1) > epsilon) {
        this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
      }
      this._append`A${r2},${r2},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
    }
  }
  arc(x2, y2, r2, a0, a1, ccw) {
    x2 = +x2, y2 = +y2, r2 = +r2, ccw = !!ccw;
    if (r2 < 0) throw new Error(`negative radius: ${r2}`);
    let dx = r2 * Math.cos(a0), dy = r2 * Math.sin(a0), x0 = x2 + dx, y0 = y2 + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
    if (this._x1 === null) {
      this._append`M${x0},${y0}`;
    } else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
      this._append`L${x0},${y0}`;
    }
    if (!r2) return;
    if (da < 0) da = da % tau + tau;
    if (da > tauEpsilon) {
      this._append`A${r2},${r2},0,1,${cw},${x2 - dx},${y2 - dy}A${r2},${r2},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
    } else if (da > epsilon) {
      this._append`A${r2},${r2},0,${+(da >= pi)},${cw},${this._x1 = x2 + r2 * Math.cos(a1)},${this._y1 = y2 + r2 * Math.sin(a1)}`;
    }
  }
  rect(x2, y2, w, h) {
    this._append`M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}h${w = +w}v${+h}h${-w}Z`;
  }
  toString() {
    return this._;
  }
}
function withPath(shape) {
  let digits = 3;
  shape.digits = function(_) {
    if (!arguments.length) return digits;
    if (_ == null) {
      digits = null;
    } else {
      const d = Math.floor(_);
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    return shape;
  };
  return () => new Path(digits);
}
function array(x2) {
  return typeof x2 === "object" && "length" in x2 ? x2 : Array.from(x2);
}
function Linear(context) {
  this._context = context;
}
Linear.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
      default:
        this._context.lineTo(x2, y2);
        break;
    }
  }
};
function curveLinear(context) {
  return new Linear(context);
}
function x(p) {
  return p[0];
}
function y(p) {
  return p[1];
}
function shapeLine(x$1, y$1) {
  var defined = constant$3(true), context = null, curve = curveLinear, output = null, path = withPath(line);
  x$1 = typeof x$1 === "function" ? x$1 : x$1 === void 0 ? x : constant$3(x$1);
  y$1 = typeof y$1 === "function" ? y$1 : y$1 === void 0 ? y : constant$3(y$1);
  function line(data) {
    var i, n = (data = array(data)).length, d, defined0 = false, buffer;
    if (context == null) output = curve(buffer = path());
    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart();
        else output.lineEnd();
      }
      if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
    }
    if (buffer) return output = null, buffer + "" || null;
  }
  line.x = function(_) {
    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$3(+_), line) : x$1;
  };
  line.y = function(_) {
    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$3(+_), line) : y$1;
  };
  line.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$3(!!_), line) : defined;
  };
  line.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
  };
  line.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
  };
  return line;
}
function shapeArea(x0, y0, y1) {
  var x1 = null, defined = constant$3(true), context = null, curve = curveLinear, output = null, path = withPath(area);
  x0 = typeof x0 === "function" ? x0 : x0 === void 0 ? x : constant$3(+x0);
  y0 = typeof y0 === "function" ? y0 : y0 === void 0 ? constant$3(0) : constant$3(+y0);
  y1 = typeof y1 === "function" ? y1 : y1 === void 0 ? y : constant$3(+y1);
  function area(data) {
    var i, j, k2, n = (data = array(data)).length, d, defined0 = false, buffer, x0z = new Array(n), y0z = new Array(n);
    if (context == null) output = curve(buffer = path());
    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) {
          j = i;
          output.areaStart();
          output.lineStart();
        } else {
          output.lineEnd();
          output.lineStart();
          for (k2 = i - 1; k2 >= j; --k2) {
            output.point(x0z[k2], y0z[k2]);
          }
          output.lineEnd();
          output.areaEnd();
        }
      }
      if (defined0) {
        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
      }
    }
    if (buffer) return output = null, buffer + "" || null;
  }
  function arealine() {
    return shapeLine().defined(defined).curve(curve).context(context);
  }
  area.x = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$3(+_), x1 = null, area) : x0;
  };
  area.x0 = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$3(+_), area) : x0;
  };
  area.x1 = function(_) {
    return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant$3(+_), area) : x1;
  };
  area.y = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$3(+_), y1 = null, area) : y0;
  };
  area.y0 = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$3(+_), area) : y0;
  };
  area.y1 = function(_) {
    return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant$3(+_), area) : y1;
  };
  area.lineX0 = area.lineY0 = function() {
    return arealine().x(x0).y(y0);
  };
  area.lineY1 = function() {
    return arealine().x(x0).y(y1);
  };
  area.lineX1 = function() {
    return arealine().x(x1).y(y0);
  };
  area.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$3(!!_), area) : defined;
  };
  area.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
  };
  area.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
  };
  return area;
}
class Bump {
  constructor(context, x2) {
    this._context = context;
    this._x = x2;
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  }
  point(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0: {
        this._point = 1;
        if (this._line) this._context.lineTo(x2, y2);
        else this._context.moveTo(x2, y2);
        break;
      }
      case 1:
        this._point = 2;
      default: {
        if (this._x) this._context.bezierCurveTo(this._x0 = (this._x0 + x2) / 2, this._y0, this._x0, y2, x2, y2);
        else this._context.bezierCurveTo(this._x0, this._y0 = (this._y0 + y2) / 2, x2, this._y0, x2, y2);
        break;
      }
    }
    this._x0 = x2, this._y0 = y2;
  }
}
function bumpX(context) {
  return new Bump(context, true);
}
function bumpY(context) {
  return new Bump(context, false);
}
const symbolCircle = {
  draw(context, size) {
    const r2 = sqrt$1(size / pi$1);
    context.moveTo(r2, 0);
    context.arc(0, 0, r2, 0, tau$1);
  }
};
const symbolCross = {
  draw(context, size) {
    const r2 = sqrt$1(size / 5) / 2;
    context.moveTo(-3 * r2, -r2);
    context.lineTo(-r2, -r2);
    context.lineTo(-r2, -3 * r2);
    context.lineTo(r2, -3 * r2);
    context.lineTo(r2, -r2);
    context.lineTo(3 * r2, -r2);
    context.lineTo(3 * r2, r2);
    context.lineTo(r2, r2);
    context.lineTo(r2, 3 * r2);
    context.lineTo(-r2, 3 * r2);
    context.lineTo(-r2, r2);
    context.lineTo(-3 * r2, r2);
    context.closePath();
  }
};
const tan30 = sqrt$1(1 / 3);
const tan30_2 = tan30 * 2;
const symbolDiamond = {
  draw(context, size) {
    const y2 = sqrt$1(size / tan30_2);
    const x2 = y2 * tan30;
    context.moveTo(0, -y2);
    context.lineTo(x2, 0);
    context.lineTo(0, y2);
    context.lineTo(-x2, 0);
    context.closePath();
  }
};
const symbolSquare = {
  draw(context, size) {
    const w = sqrt$1(size);
    const x2 = -w / 2;
    context.rect(x2, x2, w, w);
  }
};
const ka = 0.8908130915292852;
const kr = sin(pi$1 / 10) / sin(7 * pi$1 / 10);
const kx = sin(tau$1 / 10) * kr;
const ky = -cos(tau$1 / 10) * kr;
const symbolStar = {
  draw(context, size) {
    const r2 = sqrt$1(size * ka);
    const x2 = kx * r2;
    const y2 = ky * r2;
    context.moveTo(0, -r2);
    context.lineTo(x2, y2);
    for (let i = 1; i < 5; ++i) {
      const a2 = tau$1 * i / 5;
      const c2 = cos(a2);
      const s2 = sin(a2);
      context.lineTo(s2 * r2, -c2 * r2);
      context.lineTo(c2 * x2 - s2 * y2, s2 * x2 + c2 * y2);
    }
    context.closePath();
  }
};
const sqrt3 = sqrt$1(3);
const symbolTriangle = {
  draw(context, size) {
    const y2 = -sqrt$1(size / (sqrt3 * 3));
    context.moveTo(0, y2 * 2);
    context.lineTo(-sqrt3 * y2, -y2);
    context.lineTo(sqrt3 * y2, -y2);
    context.closePath();
  }
};
const c = -0.5;
const s = sqrt$1(3) / 2;
const k = 1 / sqrt$1(12);
const a = (k / 2 + 1) * 3;
const symbolWye = {
  draw(context, size) {
    const r2 = sqrt$1(size / a);
    const x0 = r2 / 2, y0 = r2 * k;
    const x1 = x0, y1 = r2 * k + r2;
    const x2 = -x1, y2 = y1;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(c * x0 - s * y0, s * x0 + c * y0);
    context.lineTo(c * x1 - s * y1, s * x1 + c * y1);
    context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
    context.lineTo(c * x0 + s * y0, c * y0 - s * x0);
    context.lineTo(c * x1 + s * y1, c * y1 - s * x1);
    context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
    context.closePath();
  }
};
function Symbol$3(type, size) {
  let context = null, path = withPath(symbol);
  type = typeof type === "function" ? type : constant$3(type || symbolCircle);
  size = typeof size === "function" ? size : constant$3(size === void 0 ? 64 : +size);
  function symbol() {
    let buffer;
    if (!context) context = buffer = path();
    type.apply(this, arguments).draw(context, +size.apply(this, arguments));
    if (buffer) return context = null, buffer + "" || null;
  }
  symbol.type = function(_) {
    return arguments.length ? (type = typeof _ === "function" ? _ : constant$3(_), symbol) : type;
  };
  symbol.size = function(_) {
    return arguments.length ? (size = typeof _ === "function" ? _ : constant$3(+_), symbol) : size;
  };
  symbol.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, symbol) : context;
  };
  return symbol;
}
function noop$2() {
}
function point$2(that, x2, y2) {
  that._context.bezierCurveTo(
    (2 * that._x0 + that._x1) / 3,
    (2 * that._y0 + that._y1) / 3,
    (that._x0 + 2 * that._x1) / 3,
    (that._y0 + 2 * that._y1) / 3,
    (that._x0 + 4 * that._x1 + x2) / 6,
    (that._y0 + 4 * that._y1 + y2) / 6
  );
}
function Basis(context) {
  this._context = context;
}
Basis.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 3:
        point$2(this, this._x1, this._y1);
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
      default:
        point$2(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function curveBasis(context) {
  return new Basis(context);
}
function BasisClosed(context) {
  this._context = context;
}
BasisClosed.prototype = {
  areaStart: noop$2,
  areaEnd: noop$2,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x2, this._y2);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x2, this._y2);
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x2 = x2, this._y2 = y2;
        break;
      case 1:
        this._point = 2;
        this._x3 = x2, this._y3 = y2;
        break;
      case 2:
        this._point = 3;
        this._x4 = x2, this._y4 = y2;
        this._context.moveTo((this._x0 + 4 * this._x1 + x2) / 6, (this._y0 + 4 * this._y1 + y2) / 6);
        break;
      default:
        point$2(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function curveBasisClosed(context) {
  return new BasisClosed(context);
}
function BasisOpen(context) {
  this._context = context;
}
BasisOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        var x0 = (this._x0 + 4 * this._x1 + x2) / 6, y0 = (this._y0 + 4 * this._y1 + y2) / 6;
        this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0);
        break;
      case 3:
        this._point = 4;
      default:
        point$2(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function curveBasisOpen(context) {
  return new BasisOpen(context);
}
function LinearClosed(context) {
  this._context = context;
}
LinearClosed.prototype = {
  areaStart: noop$2,
  areaEnd: noop$2,
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._point) this._context.closePath();
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) this._context.lineTo(x2, y2);
    else this._point = 1, this._context.moveTo(x2, y2);
  }
};
function curveLinearClosed(context) {
  return new LinearClosed(context);
}
function sign(x2) {
  return x2 < 0 ? -1 : 1;
}
function slope3(that, x2, y2) {
  var h0 = that._x1 - that._x0, h1 = x2 - that._x1, s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0), s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0), p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}
function slope2(that, t) {
  var h = that._x1 - that._x0;
  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
}
function point$1(that, t02, t12) {
  var x0 = that._x0, y0 = that._y0, x1 = that._x1, y1 = that._y1, dx = (x1 - x0) / 3;
  that._context.bezierCurveTo(x0 + dx, y0 + dx * t02, x1 - dx, y1 - dx * t12, x1, y1);
}
function MonotoneX(context) {
  this._context = context;
}
MonotoneX.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        point$1(this, this._t0, slope2(this, this._t0));
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    var t12 = NaN;
    x2 = +x2, y2 = +y2;
    if (x2 === this._x1 && y2 === this._y1) return;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        point$1(this, slope2(this, t12 = slope3(this, x2, y2)), t12);
        break;
      default:
        point$1(this, this._t0, t12 = slope3(this, x2, y2));
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
    this._t0 = t12;
  }
};
function MonotoneY(context) {
  this._context = new ReflectContext(context);
}
(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x2, y2) {
  MonotoneX.prototype.point.call(this, y2, x2);
};
function ReflectContext(context) {
  this._context = context;
}
ReflectContext.prototype = {
  moveTo: function(x2, y2) {
    this._context.moveTo(y2, x2);
  },
  closePath: function() {
    this._context.closePath();
  },
  lineTo: function(x2, y2) {
    this._context.lineTo(y2, x2);
  },
  bezierCurveTo: function(x1, y1, x2, y2, x3, y3) {
    this._context.bezierCurveTo(y1, x1, y2, x2, y3, x3);
  }
};
function monotoneX(context) {
  return new MonotoneX(context);
}
function monotoneY(context) {
  return new MonotoneY(context);
}
function Natural(context) {
  this._context = context;
}
Natural.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = [];
    this._y = [];
  },
  lineEnd: function() {
    var x2 = this._x, y2 = this._y, n = x2.length;
    if (n) {
      this._line ? this._context.lineTo(x2[0], y2[0]) : this._context.moveTo(x2[0], y2[0]);
      if (n === 2) {
        this._context.lineTo(x2[1], y2[1]);
      } else {
        var px = controlPoints(x2), py = controlPoints(y2);
        for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x2[i1], y2[i1]);
        }
      }
    }
    if (this._line || this._line !== 0 && n === 1) this._context.closePath();
    this._line = 1 - this._line;
    this._x = this._y = null;
  },
  point: function(x2, y2) {
    this._x.push(+x2);
    this._y.push(+y2);
  }
};
function controlPoints(x2) {
  var i, n = x2.length - 1, m, a2 = new Array(n), b = new Array(n), r2 = new Array(n);
  a2[0] = 0, b[0] = 2, r2[0] = x2[0] + 2 * x2[1];
  for (i = 1; i < n - 1; ++i) a2[i] = 1, b[i] = 4, r2[i] = 4 * x2[i] + 2 * x2[i + 1];
  a2[n - 1] = 2, b[n - 1] = 7, r2[n - 1] = 8 * x2[n - 1] + x2[n];
  for (i = 1; i < n; ++i) m = a2[i] / b[i - 1], b[i] -= m, r2[i] -= m * r2[i - 1];
  a2[n - 1] = r2[n - 1] / b[n - 1];
  for (i = n - 2; i >= 0; --i) a2[i] = (r2[i] - a2[i + 1]) / b[i];
  b[n - 1] = (x2[n] + a2[n - 1]) / 2;
  for (i = 0; i < n - 1; ++i) b[i] = 2 * x2[i + 1] - a2[i + 1];
  return [a2, b];
}
function curveNatural(context) {
  return new Natural(context);
}
function Step(context, t) {
  this._context = context;
  this._t = t;
}
Step.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
      default: {
        if (this._t <= 0) {
          this._context.lineTo(this._x, y2);
          this._context.lineTo(x2, y2);
        } else {
          var x1 = this._x * (1 - this._t) + x2 * this._t;
          this._context.lineTo(x1, this._y);
          this._context.lineTo(x1, y2);
        }
        break;
      }
    }
    this._x = x2, this._y = y2;
  }
};
function curveStep(context) {
  return new Step(context, 0.5);
}
function stepBefore(context) {
  return new Step(context, 0);
}
function stepAfter(context) {
  return new Step(context, 1);
}
function stackOffsetNone(series, order) {
  if (!((n = series.length) > 1)) return;
  for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
    s0 = s1, s1 = series[order[i]];
    for (j = 0; j < m; ++j) {
      s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
    }
  }
}
function stackOrderNone(series) {
  var n = series.length, o = new Array(n);
  while (--n >= 0) o[n] = n;
  return o;
}
function stackValue(d, key) {
  return d[key];
}
function stackSeries(key) {
  const series = [];
  series.key = key;
  return series;
}
function shapeStack() {
  var keys2 = constant$3([]), order = stackOrderNone, offset = stackOffsetNone, value = stackValue;
  function stack(data) {
    var sz = Array.from(keys2.apply(this, arguments), stackSeries), i, n = sz.length, j = -1, oz;
    for (const d of data) {
      for (i = 0, ++j; i < n; ++i) {
        (sz[i][j] = [0, +value(d, sz[i].key, j, data)]).data = d;
      }
    }
    for (i = 0, oz = array(order(sz)); i < n; ++i) {
      sz[oz[i]].index = i;
    }
    offset(sz, oz);
    return sz;
  }
  stack.keys = function(_) {
    return arguments.length ? (keys2 = typeof _ === "function" ? _ : constant$3(Array.from(_)), stack) : keys2;
  };
  stack.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant$3(+_), stack) : value;
  };
  stack.order = function(_) {
    return arguments.length ? (order = _ == null ? stackOrderNone : typeof _ === "function" ? _ : constant$3(Array.from(_)), stack) : order;
  };
  stack.offset = function(_) {
    return arguments.length ? (offset = _ == null ? stackOffsetNone : _, stack) : offset;
  };
  return stack;
}
function stackOffsetExpand(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var i, n, j = 0, m = series[0].length, y2; j < m; ++j) {
    for (y2 = i = 0; i < n; ++i) y2 += series[i][j][1] || 0;
    if (y2) for (i = 0; i < n; ++i) series[i][j][1] /= y2;
  }
  stackOffsetNone(series, order);
}
function stackOffsetSilhouette(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
    for (var i = 0, y2 = 0; i < n; ++i) y2 += series[i][j][1] || 0;
    s0[j][1] += s0[j][0] = -y2 / 2;
  }
  stackOffsetNone(series, order);
}
function stackOffsetWiggle(series, order) {
  if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
  for (var y2 = 0, j = 1, s0, m, n; j < m; ++j) {
    for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
      var si = series[order[i]], sij0 = si[j][1] || 0, sij1 = si[j - 1][1] || 0, s3 = (sij0 - sij1) / 2;
      for (var k2 = 0; k2 < i; ++k2) {
        var sk = series[order[k2]], skj0 = sk[j][1] || 0, skj1 = sk[j - 1][1] || 0;
        s3 += skj0 - skj1;
      }
      s1 += sij0, s2 += s3 * sij0;
    }
    s0[j - 1][1] += s0[j - 1][0] = y2;
    if (s1) y2 -= s2 / s1;
  }
  s0[j - 1][1] += s0[j - 1][0] = y2;
  stackOffsetNone(series, order);
}
var ListCache$2 = _ListCache;
function stackClear$1() {
  this.__data__ = new ListCache$2();
  this.size = 0;
}
var _stackClear = stackClear$1;
function stackDelete$1(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
var _stackDelete = stackDelete$1;
function stackGet$1(key) {
  return this.__data__.get(key);
}
var _stackGet = stackGet$1;
function stackHas$1(key) {
  return this.__data__.has(key);
}
var _stackHas = stackHas$1;
var ListCache$1 = _ListCache, Map$2 = _Map, MapCache$1 = _MapCache;
var LARGE_ARRAY_SIZE$1 = 200;
function stackSet$1(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache$1) {
    var pairs = data.__data__;
    if (!Map$2 || pairs.length < LARGE_ARRAY_SIZE$1 - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache$1(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
var _stackSet = stackSet$1;
var ListCache = _ListCache, stackClear = _stackClear, stackDelete = _stackDelete, stackGet = _stackGet, stackHas = _stackHas, stackSet = _stackSet;
function Stack$2(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack$2.prototype.clear = stackClear;
Stack$2.prototype["delete"] = stackDelete;
Stack$2.prototype.get = stackGet;
Stack$2.prototype.has = stackHas;
Stack$2.prototype.set = stackSet;
var _Stack = Stack$2;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd$1(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
var _setCacheAdd = setCacheAdd$1;
function setCacheHas$1(value) {
  return this.__data__.has(value);
}
var _setCacheHas = setCacheHas$1;
var MapCache = _MapCache, setCacheAdd = _setCacheAdd, setCacheHas = _setCacheHas;
function SetCache$2(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache$2.prototype.add = SetCache$2.prototype.push = setCacheAdd;
SetCache$2.prototype.has = setCacheHas;
var _SetCache = SetCache$2;
function arraySome$2(array2, predicate) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  while (++index < length) {
    if (predicate(array2[index], index, array2)) {
      return true;
    }
  }
  return false;
}
var _arraySome = arraySome$2;
function cacheHas$2(cache, key) {
  return cache.has(key);
}
var _cacheHas = cacheHas$2;
var SetCache$1 = _SetCache, arraySome$1 = _arraySome, cacheHas$1 = _cacheHas;
var COMPARE_PARTIAL_FLAG$5 = 1, COMPARE_UNORDERED_FLAG$3 = 2;
function equalArrays$2(array2, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5, arrLength = array2.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array2);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array2;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new SetCache$1() : void 0;
  stack.set(array2, other);
  stack.set(other, array2);
  while (++index < arrLength) {
    var arrValue = array2[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array2, stack) : customizer(arrValue, othValue, index, array2, other, stack);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome$1(other, function(othValue2, othIndex) {
        if (!cacheHas$1(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array2);
  stack["delete"](other);
  return result;
}
var _equalArrays = equalArrays$2;
var root$5 = _root;
var Uint8Array$2 = root$5.Uint8Array;
var _Uint8Array = Uint8Array$2;
function mapToArray$1(map2) {
  var index = -1, result = Array(map2.size);
  map2.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
var _mapToArray = mapToArray$1;
function setToArray$3(set) {
  var index = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var _setToArray = setToArray$3;
var Symbol$2 = _Symbol, Uint8Array$1 = _Uint8Array, eq$1 = eq_1, equalArrays$1 = _equalArrays, mapToArray = _mapToArray, setToArray$2 = _setToArray;
var COMPARE_PARTIAL_FLAG$4 = 1, COMPARE_UNORDERED_FLAG$2 = 2;
var boolTag$2 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", mapTag$2 = "[object Map]", numberTag$1 = "[object Number]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", symbolTag = "[object Symbol]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]";
var symbolProto = Symbol$2 ? Symbol$2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag$1(object2, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$2:
      if (object2.byteLength != other.byteLength || object2.byteOffset != other.byteOffset) {
        return false;
      }
      object2 = object2.buffer;
      other = other.buffer;
    case arrayBufferTag$1:
      if (object2.byteLength != other.byteLength || !equalFunc(new Uint8Array$1(object2), new Uint8Array$1(other))) {
        return false;
      }
      return true;
    case boolTag$2:
    case dateTag$1:
    case numberTag$1:
      return eq$1(+object2, +other);
    case errorTag$1:
      return object2.name == other.name && object2.message == other.message;
    case regexpTag$1:
    case stringTag$1:
      return object2 == other + "";
    case mapTag$2:
      var convert = mapToArray;
    case setTag$2:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
      convert || (convert = setToArray$2);
      if (object2.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object2);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;
      stack.set(object2, other);
      var result = equalArrays$1(convert(object2), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object2);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object2) == symbolValueOf.call(other);
      }
  }
  return false;
}
var _equalByTag = equalByTag$1;
function arrayPush$2(array2, values) {
  var index = -1, length = values.length, offset = array2.length;
  while (++index < length) {
    array2[offset + index] = values[index];
  }
  return array2;
}
var _arrayPush = arrayPush$2;
var arrayPush$1 = _arrayPush, isArray$9 = isArray_1;
function baseGetAllKeys$1(object2, keysFunc, symbolsFunc) {
  var result = keysFunc(object2);
  return isArray$9(object2) ? result : arrayPush$1(result, symbolsFunc(object2));
}
var _baseGetAllKeys = baseGetAllKeys$1;
function arrayFilter$1(array2, predicate) {
  var index = -1, length = array2 == null ? 0 : array2.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array2[index];
    if (predicate(value, index, array2)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var _arrayFilter = arrayFilter$1;
function stubArray$1() {
  return [];
}
var stubArray_1 = stubArray$1;
var arrayFilter = _arrayFilter, stubArray = stubArray_1;
var objectProto$7 = Object.prototype;
var propertyIsEnumerable$1 = objectProto$7.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols$1 = !nativeGetSymbols ? stubArray : function(object2) {
  if (object2 == null) {
    return [];
  }
  object2 = Object(object2);
  return arrayFilter(nativeGetSymbols(object2), function(symbol) {
    return propertyIsEnumerable$1.call(object2, symbol);
  });
};
var _getSymbols = getSymbols$1;
function baseTimes$1(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
var _baseTimes = baseTimes$1;
var baseGetTag$4 = _baseGetTag, isObjectLike$5 = isObjectLike_1;
var argsTag$2 = "[object Arguments]";
function baseIsArguments$1(value) {
  return isObjectLike$5(value) && baseGetTag$4(value) == argsTag$2;
}
var _baseIsArguments = baseIsArguments$1;
var baseIsArguments = _baseIsArguments, isObjectLike$4 = isObjectLike_1;
var objectProto$6 = Object.prototype;
var hasOwnProperty$6 = objectProto$6.hasOwnProperty;
var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;
var isArguments$3 = baseIsArguments(/* @__PURE__ */ function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike$4(value) && hasOwnProperty$6.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
};
var isArguments_1 = isArguments$3;
var isBuffer$2 = { exports: {} };
function stubFalse() {
  return false;
}
var stubFalse_1 = stubFalse;
isBuffer$2.exports;
(function(module, exports$1) {
  var root2 = _root, stubFalse2 = stubFalse_1;
  var freeExports = exports$1 && !exports$1.nodeType && exports$1;
  var freeModule = freeExports && true && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root2.Buffer : void 0;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
  var isBuffer2 = nativeIsBuffer || stubFalse2;
  module.exports = isBuffer2;
})(isBuffer$2, isBuffer$2.exports);
var isBufferExports = isBuffer$2.exports;
var MAX_SAFE_INTEGER$2 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex$3(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$2 : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var _isIndex = isIndex$3;
var MAX_SAFE_INTEGER$1 = 9007199254740991;
function isLength$3(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}
var isLength_1 = isLength$3;
var baseGetTag$3 = _baseGetTag, isLength$2 = isLength_1, isObjectLike$3 = isObjectLike_1;
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$1 = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag$1 = "[object Map]", numberTag = "[object Number]", objectTag$3 = "[object Object]", regexpTag = "[object RegExp]", setTag$1 = "[object Set]", stringTag = "[object String]", weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag$1] = typedArrayTags[numberTag] = typedArrayTags[objectTag$3] = typedArrayTags[regexpTag] = typedArrayTags[setTag$1] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag$1] = false;
function baseIsTypedArray$1(value) {
  return isObjectLike$3(value) && isLength$2(value.length) && !!typedArrayTags[baseGetTag$3(value)];
}
var _baseIsTypedArray = baseIsTypedArray$1;
function baseUnary$2(func) {
  return function(value) {
    return func(value);
  };
}
var _baseUnary = baseUnary$2;
var _nodeUtil = { exports: {} };
_nodeUtil.exports;
(function(module, exports$1) {
  var freeGlobal2 = _freeGlobal;
  var freeExports = exports$1 && !exports$1.nodeType && exports$1;
  var freeModule = freeExports && true && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal2.process;
  var nodeUtil2 = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  module.exports = nodeUtil2;
})(_nodeUtil, _nodeUtil.exports);
var _nodeUtilExports = _nodeUtil.exports;
var baseIsTypedArray = _baseIsTypedArray, baseUnary$1 = _baseUnary, nodeUtil = _nodeUtilExports;
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray$2 = nodeIsTypedArray ? baseUnary$1(nodeIsTypedArray) : baseIsTypedArray;
var isTypedArray_1 = isTypedArray$2;
var baseTimes = _baseTimes, isArguments$2 = isArguments_1, isArray$8 = isArray_1, isBuffer$1 = isBufferExports, isIndex$2 = _isIndex, isTypedArray$1 = isTypedArray_1;
var objectProto$5 = Object.prototype;
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;
function arrayLikeKeys$1(value, inherited) {
  var isArr = isArray$8(value), isArg = !isArr && isArguments$2(value), isBuff = !isArr && !isArg && isBuffer$1(value), isType = !isArr && !isArg && !isBuff && isTypedArray$1(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$5.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex$2(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var _arrayLikeKeys = arrayLikeKeys$1;
var objectProto$4 = Object.prototype;
function isPrototype$1(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$4;
  return value === proto;
}
var _isPrototype = isPrototype$1;
function overArg$2(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var _overArg = overArg$2;
var overArg$1 = _overArg;
var nativeKeys$1 = overArg$1(Object.keys, Object);
var _nativeKeys = nativeKeys$1;
var isPrototype = _isPrototype, nativeKeys = _nativeKeys;
var objectProto$3 = Object.prototype;
var hasOwnProperty$4 = objectProto$3.hasOwnProperty;
function baseKeys$1(object2) {
  if (!isPrototype(object2)) {
    return nativeKeys(object2);
  }
  var result = [];
  for (var key in Object(object2)) {
    if (hasOwnProperty$4.call(object2, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
var _baseKeys = baseKeys$1;
var isFunction = isFunction_1, isLength$1 = isLength_1;
function isArrayLike$5(value) {
  return value != null && isLength$1(value.length) && !isFunction(value);
}
var isArrayLike_1 = isArrayLike$5;
var arrayLikeKeys = _arrayLikeKeys, baseKeys = _baseKeys, isArrayLike$4 = isArrayLike_1;
function keys$5(object2) {
  return isArrayLike$4(object2) ? arrayLikeKeys(object2) : baseKeys(object2);
}
var keys_1 = keys$5;
var baseGetAllKeys = _baseGetAllKeys, getSymbols = _getSymbols, keys$4 = keys_1;
function getAllKeys$1(object2) {
  return baseGetAllKeys(object2, keys$4, getSymbols);
}
var _getAllKeys = getAllKeys$1;
var getAllKeys = _getAllKeys;
var COMPARE_PARTIAL_FLAG$3 = 1;
var objectProto$2 = Object.prototype;
var hasOwnProperty$3 = objectProto$2.hasOwnProperty;
function equalObjects$1(object2, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, objProps = getAllKeys(object2), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$3.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object2);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object2;
  }
  var result = true;
  stack.set(object2, other);
  stack.set(other, object2);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object2[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object2, stack) : customizer(objValue, othValue, key, object2, other, stack);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object2.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object2 && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object2);
  stack["delete"](other);
  return result;
}
var _equalObjects = equalObjects$1;
var getNative$4 = _getNative, root$4 = _root;
var DataView$2 = getNative$4(root$4, "DataView");
var _DataView = DataView$2;
var getNative$3 = _getNative, root$3 = _root;
var Promise$2 = getNative$3(root$3, "Promise");
var _Promise = Promise$2;
var getNative$2 = _getNative, root$2 = _root;
var Set$3 = getNative$2(root$2, "Set");
var _Set = Set$3;
var getNative$1 = _getNative, root$1 = _root;
var WeakMap$2 = getNative$1(root$1, "WeakMap");
var _WeakMap = WeakMap$2;
var DataView$1 = _DataView, Map$1 = _Map, Promise$1 = _Promise, Set$2 = _Set, WeakMap$1 = _WeakMap, baseGetTag$2 = _baseGetTag, toSource = _toSource;
var mapTag = "[object Map]", objectTag$2 = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
var dataViewTag = "[object DataView]";
var dataViewCtorString = toSource(DataView$1), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set$2), weakMapCtorString = toSource(WeakMap$1);
var getTag$1 = baseGetTag$2;
if (DataView$1 && getTag$1(new DataView$1(new ArrayBuffer(1))) != dataViewTag || Map$1 && getTag$1(new Map$1()) != mapTag || Promise$1 && getTag$1(Promise$1.resolve()) != promiseTag || Set$2 && getTag$1(new Set$2()) != setTag || WeakMap$1 && getTag$1(new WeakMap$1()) != weakMapTag) {
  getTag$1 = function(value) {
    var result = baseGetTag$2(value), Ctor = result == objectTag$2 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;
        case mapCtorString:
          return mapTag;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}
var _getTag = getTag$1;
var Stack$1 = _Stack, equalArrays = _equalArrays, equalByTag = _equalByTag, equalObjects = _equalObjects, getTag = _getTag, isArray$7 = isArray_1, isBuffer = isBufferExports, isTypedArray = isTypedArray_1;
var COMPARE_PARTIAL_FLAG$2 = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag$1 = "[object Object]";
var objectProto$1 = Object.prototype;
var hasOwnProperty$2 = objectProto$1.hasOwnProperty;
function baseIsEqualDeep$1(object2, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray$7(object2), othIsArr = isArray$7(other), objTag = objIsArr ? arrayTag : getTag(object2), othTag = othIsArr ? arrayTag : getTag(other);
  objTag = objTag == argsTag ? objectTag$1 : objTag;
  othTag = othTag == argsTag ? objectTag$1 : othTag;
  var objIsObj = objTag == objectTag$1, othIsObj = othTag == objectTag$1, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer(object2)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack$1());
    return objIsArr || isTypedArray(object2) ? equalArrays(object2, other, bitmask, customizer, equalFunc, stack) : equalByTag(object2, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty$2.call(object2, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty$2.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object2.value() : object2, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack$1());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack$1());
  return equalObjects(object2, other, bitmask, customizer, equalFunc, stack);
}
var _baseIsEqualDeep = baseIsEqualDeep$1;
var baseIsEqualDeep = _baseIsEqualDeep, isObjectLike$2 = isObjectLike_1;
function baseIsEqual$3(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike$2(value) && !isObjectLike$2(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$3, stack);
}
var _baseIsEqual = baseIsEqual$3;
var Stack = _Stack, baseIsEqual$2 = _baseIsEqual;
var COMPARE_PARTIAL_FLAG$1 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function baseIsMatch$1(object2, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object2 == null) {
    return !length;
  }
  object2 = Object(object2);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object2[data[0]] : !(data[0] in object2)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0], objValue = object2[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === void 0 && !(key in object2)) {
        return false;
      }
    } else {
      var stack = new Stack();
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object2, source, stack);
      }
      if (!(result === void 0 ? baseIsEqual$2(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
var _baseIsMatch = baseIsMatch$1;
var isObject$4 = isObject_1;
function isStrictComparable$2(value) {
  return value === value && !isObject$4(value);
}
var _isStrictComparable = isStrictComparable$2;
var isStrictComparable$1 = _isStrictComparable, keys$3 = keys_1;
function getMatchData$1(object2) {
  var result = keys$3(object2), length = result.length;
  while (length--) {
    var key = result[length], value = object2[key];
    result[length] = [key, value, isStrictComparable$1(value)];
  }
  return result;
}
var _getMatchData = getMatchData$1;
function matchesStrictComparable$2(key, srcValue) {
  return function(object2) {
    if (object2 == null) {
      return false;
    }
    return object2[key] === srcValue && (srcValue !== void 0 || key in Object(object2));
  };
}
var _matchesStrictComparable = matchesStrictComparable$2;
var baseIsMatch = _baseIsMatch, getMatchData = _getMatchData, matchesStrictComparable$1 = _matchesStrictComparable;
function baseMatches$1(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
  }
  return function(object2) {
    return object2 === source || baseIsMatch(object2, source, matchData);
  };
}
var _baseMatches = baseMatches$1;
function baseHasIn$1(object2, key) {
  return object2 != null && key in Object(object2);
}
var _baseHasIn = baseHasIn$1;
var castPath = _castPath, isArguments$1 = isArguments_1, isArray$6 = isArray_1, isIndex$1 = _isIndex, isLength = isLength_1, toKey$2 = _toKey;
function hasPath$1(object2, path, hasFunc) {
  path = castPath(path, object2);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = toKey$2(path[index]);
    if (!(result = object2 != null && hasFunc(object2, key))) {
      break;
    }
    object2 = object2[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object2 == null ? 0 : object2.length;
  return !!length && isLength(length) && isIndex$1(key, length) && (isArray$6(object2) || isArguments$1(object2));
}
var _hasPath = hasPath$1;
var baseHasIn = _baseHasIn, hasPath = _hasPath;
function hasIn$1(object2, path) {
  return object2 != null && hasPath(object2, path, baseHasIn);
}
var hasIn_1 = hasIn$1;
var baseIsEqual$1 = _baseIsEqual, get = get_1, hasIn = hasIn_1, isKey$1 = _isKey, isStrictComparable = _isStrictComparable, matchesStrictComparable = _matchesStrictComparable, toKey$1 = _toKey;
var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
function baseMatchesProperty$1(path, srcValue) {
  if (isKey$1(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey$1(path), srcValue);
  }
  return function(object2) {
    var objValue = get(object2, path);
    return objValue === void 0 && objValue === srcValue ? hasIn(object2, path) : baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}
var _baseMatchesProperty = baseMatchesProperty$1;
function identity$b(value) {
  return value;
}
var identity_1 = identity$b;
function baseProperty$1(key) {
  return function(object2) {
    return object2 == null ? void 0 : object2[key];
  };
}
var _baseProperty = baseProperty$1;
var baseGet$1 = _baseGet;
function basePropertyDeep$1(path) {
  return function(object2) {
    return baseGet$1(object2, path);
  };
}
var _basePropertyDeep = basePropertyDeep$1;
var baseProperty = _baseProperty, basePropertyDeep = _basePropertyDeep, isKey = _isKey, toKey = _toKey;
function property$1(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
var property_1 = property$1;
var baseMatches = _baseMatches, baseMatchesProperty = _baseMatchesProperty, identity$a = identity_1, isArray$5 = isArray_1, property = property_1;
function baseIteratee$a(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity$a;
  }
  if (typeof value == "object") {
    return isArray$5(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }
  return property(value);
}
var _baseIteratee = baseIteratee$a;
function baseFindIndex$2(array2, predicate, fromIndex, fromRight) {
  var length = array2.length, index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array2[index], index, array2)) {
      return index;
    }
  }
  return -1;
}
var _baseFindIndex = baseFindIndex$2;
function baseIsNaN$1(value) {
  return value !== value;
}
var _baseIsNaN = baseIsNaN$1;
function strictIndexOf$1(array2, value, fromIndex) {
  var index = fromIndex - 1, length = array2.length;
  while (++index < length) {
    if (array2[index] === value) {
      return index;
    }
  }
  return -1;
}
var _strictIndexOf = strictIndexOf$1;
var baseFindIndex$1 = _baseFindIndex, baseIsNaN = _baseIsNaN, strictIndexOf = _strictIndexOf;
function baseIndexOf$1(array2, value, fromIndex) {
  return value === value ? strictIndexOf(array2, value, fromIndex) : baseFindIndex$1(array2, baseIsNaN, fromIndex);
}
var _baseIndexOf = baseIndexOf$1;
var baseIndexOf = _baseIndexOf;
function arrayIncludes$1(array2, value) {
  var length = array2 == null ? 0 : array2.length;
  return !!length && baseIndexOf(array2, value, 0) > -1;
}
var _arrayIncludes = arrayIncludes$1;
function arrayIncludesWith$1(array2, value, comparator) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  while (++index < length) {
    if (comparator(value, array2[index])) {
      return true;
    }
  }
  return false;
}
var _arrayIncludesWith = arrayIncludesWith$1;
function noop$1() {
}
var noop_1 = noop$1;
var Set$1 = _Set, noop = noop_1, setToArray$1 = _setToArray;
var INFINITY$1 = 1 / 0;
var createSet$1 = !(Set$1 && 1 / setToArray$1(new Set$1([, -0]))[1] == INFINITY$1) ? noop : function(values) {
  return new Set$1(values);
};
var _createSet = createSet$1;
var SetCache = _SetCache, arrayIncludes = _arrayIncludes, arrayIncludesWith = _arrayIncludesWith, cacheHas = _cacheHas, createSet = _createSet, setToArray = _setToArray;
var LARGE_ARRAY_SIZE = 200;
function baseUniq$1(array2, iteratee, comparator) {
  var index = -1, includes = arrayIncludes, length = array2.length, isCommon = true, result = [], seen = result;
  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  } else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array2);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache();
  } else {
    seen = iteratee ? [] : result;
  }
  outer:
    while (++index < length) {
      var value = array2[index], computed = iteratee ? iteratee(value) : value;
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
  return result;
}
var _baseUniq = baseUniq$1;
var baseIteratee$9 = _baseIteratee, baseUniq = _baseUniq;
function uniqBy(array2, iteratee) {
  return array2 && array2.length ? baseUniq(array2, baseIteratee$9(iteratee)) : [];
}
var uniqBy_1 = uniqBy;
const uniqBy$1 = /* @__PURE__ */ getDefaultExportFromCjs(uniqBy_1);
var Symbol$1 = _Symbol, isArguments = isArguments_1, isArray$4 = isArray_1;
var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : void 0;
function isFlattenable$1(value) {
  return isArray$4(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
var _isFlattenable = isFlattenable$1;
var arrayPush = _arrayPush, isFlattenable = _isFlattenable;
function baseFlatten$2(array2, depth, predicate, isStrict, result) {
  var index = -1, length = array2.length;
  predicate || (predicate = isFlattenable);
  result || (result = []);
  while (++index < length) {
    var value = array2[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten$2(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}
var _baseFlatten = baseFlatten$2;
function createBaseFor$1(fromRight) {
  return function(object2, iteratee, keysFunc) {
    var index = -1, iterable = Object(object2), props = keysFunc(object2), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object2;
  };
}
var _createBaseFor = createBaseFor$1;
var createBaseFor = _createBaseFor;
var baseFor$1 = createBaseFor();
var _baseFor = baseFor$1;
var baseFor = _baseFor, keys$2 = keys_1;
function baseForOwn$2(object2, iteratee) {
  return object2 && baseFor(object2, iteratee, keys$2);
}
var _baseForOwn = baseForOwn$2;
var isArrayLike$3 = isArrayLike_1;
function createBaseEach$1(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike$3(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}
var _createBaseEach = createBaseEach$1;
var baseForOwn$1 = _baseForOwn, createBaseEach = _createBaseEach;
var baseEach$3 = createBaseEach(baseForOwn$1);
var _baseEach = baseEach$3;
var baseEach$2 = _baseEach, isArrayLike$2 = isArrayLike_1;
function baseMap$2(collection, iteratee) {
  var index = -1, result = isArrayLike$2(collection) ? Array(collection.length) : [];
  baseEach$2(collection, function(value, key, collection2) {
    result[++index] = iteratee(value, key, collection2);
  });
  return result;
}
var _baseMap = baseMap$2;
function baseSortBy$1(array2, comparer) {
  var length = array2.length;
  array2.sort(comparer);
  while (length--) {
    array2[length] = array2[length].value;
  }
  return array2;
}
var _baseSortBy = baseSortBy$1;
var isSymbol$2 = isSymbol_1;
function compareAscending$1(value, other) {
  if (value !== other) {
    var valIsDefined = value !== void 0, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol$2(value);
    var othIsDefined = other !== void 0, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol$2(other);
    if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
      return 1;
    }
    if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
      return -1;
    }
  }
  return 0;
}
var _compareAscending = compareAscending$1;
var compareAscending = _compareAscending;
function compareMultiple$1(object2, other, orders) {
  var index = -1, objCriteria = object2.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
  while (++index < length) {
    var result = compareAscending(objCriteria[index], othCriteria[index]);
    if (result) {
      if (index >= ordersLength) {
        return result;
      }
      var order = orders[index];
      return result * (order == "desc" ? -1 : 1);
    }
  }
  return object2.index - other.index;
}
var _compareMultiple = compareMultiple$1;
var arrayMap$1 = _arrayMap, baseGet = _baseGet, baseIteratee$8 = _baseIteratee, baseMap$1 = _baseMap, baseSortBy = _baseSortBy, baseUnary = _baseUnary, compareMultiple = _compareMultiple, identity$9 = identity_1, isArray$3 = isArray_1;
function baseOrderBy$1(collection, iteratees, orders) {
  if (iteratees.length) {
    iteratees = arrayMap$1(iteratees, function(iteratee) {
      if (isArray$3(iteratee)) {
        return function(value) {
          return baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
        };
      }
      return iteratee;
    });
  } else {
    iteratees = [identity$9];
  }
  var index = -1;
  iteratees = arrayMap$1(iteratees, baseUnary(baseIteratee$8));
  var result = baseMap$1(collection, function(value, key, collection2) {
    var criteria = arrayMap$1(iteratees, function(iteratee) {
      return iteratee(value);
    });
    return { "criteria": criteria, "index": ++index, "value": value };
  });
  return baseSortBy(result, function(object2, other) {
    return compareMultiple(object2, other, orders);
  });
}
var _baseOrderBy = baseOrderBy$1;
function apply$1(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
var _apply = apply$1;
var apply = _apply;
var nativeMax$3 = Math.max;
function overRest$1(func, start, transform) {
  start = nativeMax$3(start === void 0 ? func.length - 1 : start, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax$3(args.length - start, 0), array2 = Array(length);
    while (++index < length) {
      array2[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array2);
    return apply(func, this, otherArgs);
  };
}
var _overRest = overRest$1;
function constant$2(value) {
  return function() {
    return value;
  };
}
var constant_1 = constant$2;
var getNative = _getNative;
var defineProperty$2 = function() {
  try {
    var func = getNative(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
var _defineProperty$3 = defineProperty$2;
var constant$1 = constant_1, defineProperty$1 = _defineProperty$3, identity$8 = identity_1;
var baseSetToString$1 = !defineProperty$1 ? identity$8 : function(func, string2) {
  return defineProperty$1(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant$1(string2),
    "writable": true
  });
};
var _baseSetToString = baseSetToString$1;
var HOT_COUNT = 800, HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut$1(func) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(void 0, arguments);
  };
}
var _shortOut = shortOut$1;
var baseSetToString = _baseSetToString, shortOut = _shortOut;
var setToString$1 = shortOut(baseSetToString);
var _setToString = setToString$1;
var identity$7 = identity_1, overRest = _overRest, setToString = _setToString;
function baseRest$1(func, start) {
  return setToString(overRest(func, start, identity$7), func + "");
}
var _baseRest = baseRest$1;
var eq = eq_1, isArrayLike$1 = isArrayLike_1, isIndex = _isIndex, isObject$3 = isObject_1;
function isIterateeCall$4(value, index, object2) {
  if (!isObject$3(object2)) {
    return false;
  }
  var type = typeof index;
  if (type == "number" ? isArrayLike$1(object2) && isIndex(index, object2.length) : type == "string" && index in object2) {
    return eq(object2[index], value);
  }
  return false;
}
var _isIterateeCall = isIterateeCall$4;
var baseFlatten$1 = _baseFlatten, baseOrderBy = _baseOrderBy, baseRest = _baseRest, isIterateeCall$3 = _isIterateeCall;
var sortBy = baseRest(function(collection, iteratees) {
  if (collection == null) {
    return [];
  }
  var length = iteratees.length;
  if (length > 1 && isIterateeCall$3(collection, iteratees[0], iteratees[1])) {
    iteratees = [];
  } else if (length > 2 && isIterateeCall$3(iteratees[0], iteratees[1], iteratees[2])) {
    iteratees = [iteratees[0]];
  }
  return baseOrderBy(collection, baseFlatten$1(iteratees, 1), []);
});
var sortBy_1 = sortBy;
const sortBy$1 = /* @__PURE__ */ getDefaultExportFromCjs(sortBy_1);
var root = _root;
var now$1 = function() {
  return root.Date.now();
};
var now_1 = now$1;
var reWhitespace = /\s/;
function trimmedEndIndex$1(string2) {
  var index = string2.length;
  while (index-- && reWhitespace.test(string2.charAt(index))) {
  }
  return index;
}
var _trimmedEndIndex = trimmedEndIndex$1;
var trimmedEndIndex = _trimmedEndIndex;
var reTrimStart = /^\s+/;
function baseTrim$1(string2) {
  return string2 ? string2.slice(0, trimmedEndIndex(string2) + 1).replace(reTrimStart, "") : string2;
}
var _baseTrim = baseTrim$1;
var baseTrim = _baseTrim, isObject$2 = isObject_1, isSymbol$1 = isSymbol_1;
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber$2(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol$1(value)) {
    return NAN;
  }
  if (isObject$2(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject$2(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var toNumber_1 = toNumber$2;
var isObject$1 = isObject_1, now = now_1, toNumber$1 = toNumber_1;
var FUNC_ERROR_TEXT$1 = "Expected a function";
var nativeMax$2 = Math.max, nativeMin = Math.min;
function debounce$1(func, wait, options) {
  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber$1(wait) || 0;
  if (isObject$1(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax$2(toNumber$1(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time2) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time2;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time2) {
    lastInvokeTime = time2;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time2) : result;
  }
  function remainingWait(time2) {
    var timeSinceLastCall = time2 - lastCallTime, timeSinceLastInvoke = time2 - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time2) {
    var timeSinceLastCall = time2 - lastCallTime, timeSinceLastInvoke = time2 - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time2 = now();
    if (shouldInvoke(time2)) {
      return trailingEdge(time2);
    }
    timerId = setTimeout(timerExpired, remainingWait(time2));
  }
  function trailingEdge(time2) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time2);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(now());
  }
  function debounced() {
    var time2 = now(), isInvoking = shouldInvoke(time2);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time2;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
var debounce_1 = debounce$1;
var debounce = debounce_1, isObject = isObject_1;
var FUNC_ERROR_TEXT = "Expected a function";
function throttle(func, wait, options) {
  var leading = true, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    "leading": leading,
    "maxWait": wait,
    "trailing": trailing
  });
}
var throttle_1 = throttle;
const throttle$1 = /* @__PURE__ */ getDefaultExportFromCjs(throttle_1);
function ascending(a2, b) {
  return a2 == null || b == null ? NaN : a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
}
function descending(a2, b) {
  return a2 == null || b == null ? NaN : b < a2 ? -1 : b > a2 ? 1 : b >= a2 ? 0 : NaN;
}
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d, x2) => ascending(f(d), x2);
    delta = (d, x2) => f(d) - x2;
  } else {
    compare1 = f === ascending || f === descending ? f : zero$1;
    compare2 = f;
    delta = f;
  }
  function left(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a2, x2, lo = 0, hi = a2.length) {
    const i = left(a2, x2, lo, hi - 1);
    return i > lo && delta(a2[i - 1], x2) > -delta(a2[i], x2) ? i - 1 : i;
  }
  return { left, center, right };
}
function zero$1() {
  return 0;
}
function number$2(x2) {
  return x2 === null ? NaN : +x2;
}
function* numbers(values, valueof) {
  {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        yield value;
      }
    }
  }
}
const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
bisector(number$2).center;
class InternMap extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
    if (entries != null) for (const [key2, value] of entries) this.set(key2, value);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value) {
    return super.set(intern_set(this, key), value);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
}
function intern_get({ _intern, _key }, value) {
  const key = _key(value);
  return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) return _intern.get(key);
  _intern.set(key, value);
  return value;
}
function intern_delete({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) {
    value = _intern.get(key);
    _intern.delete(key);
  }
  return value;
}
function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}
function compareDefined(compare = ascending) {
  if (compare === ascending) return ascendingDefined;
  if (typeof compare !== "function") throw new TypeError("compare is not a function");
  return (a2, b) => {
    const x2 = compare(a2, b);
    if (x2 || x2 === 0) return x2;
    return (compare(b, b) === 0) - (compare(a2, a2) === 0);
  };
}
function ascendingDefined(a2, b) {
  return (a2 == null || !(a2 >= a2)) - (b == null || !(b >= b)) || (a2 < b ? -1 : a2 > b ? 1 : 0);
}
const e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
function tickSpec(start, stop, count) {
  const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start) ++i1;
    if (i2 * inc > stop) --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
  return [i1, i2, inc];
}
function ticks(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  if (!(count > 0)) return [];
  if (start === stop) return [start];
  const reverse3 = stop < start, [i1, i2, inc] = reverse3 ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
  if (!(i2 >= i1)) return [];
  const n = i2 - i1 + 1, ticks2 = new Array(n);
  if (reverse3) {
    if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) / -inc;
    else for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) * inc;
  } else {
    if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) / -inc;
    else for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) * inc;
  }
  return ticks2;
}
function tickIncrement(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  return tickSpec(start, stop, count)[2];
}
function tickStep(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  const reverse3 = stop < start, inc = reverse3 ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
  return (reverse3 ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}
function max$2(values, valueof) {
  let max2;
  {
    for (const value of values) {
      if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value;
      }
    }
  }
  return max2;
}
function min$2(values, valueof) {
  let min2;
  {
    for (const value of values) {
      if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value;
      }
    }
  }
  return min2;
}
function quickselect(array2, k2, left = 0, right = Infinity, compare) {
  k2 = Math.floor(k2);
  left = Math.floor(Math.max(0, left));
  right = Math.floor(Math.min(array2.length - 1, right));
  if (!(left <= k2 && k2 <= right)) return array2;
  compare = compare === void 0 ? ascendingDefined : compareDefined(compare);
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k2 - left + 1;
      const z = Math.log(n);
      const s2 = 0.5 * Math.exp(2 * z / 3);
      const sd = 0.5 * Math.sqrt(z * s2 * (n - s2) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k2 - m * s2 / n + sd));
      const newRight = Math.min(right, Math.floor(k2 + (n - m) * s2 / n + sd));
      quickselect(array2, k2, newLeft, newRight, compare);
    }
    const t = array2[k2];
    let i = left;
    let j = right;
    swap(array2, left, k2);
    if (compare(array2[right], t) > 0) swap(array2, left, right);
    while (i < j) {
      swap(array2, i, j), ++i, --j;
      while (compare(array2[i], t) < 0) ++i;
      while (compare(array2[j], t) > 0) --j;
    }
    if (compare(array2[left], t) === 0) swap(array2, left, j);
    else ++j, swap(array2, j, right);
    if (j <= k2) left = j + 1;
    if (k2 <= j) right = j - 1;
  }
  return array2;
}
function swap(array2, i, j) {
  const t = array2[i];
  array2[i] = array2[j];
  array2[j] = t;
}
function quantile$1(values, p, valueof) {
  values = Float64Array.from(numbers(values));
  if (!(n = values.length) || isNaN(p = +p)) return;
  if (p <= 0 || n < 2) return min$2(values);
  if (p >= 1) return max$2(values);
  var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = max$2(quickselect(values, i0).subarray(0, i0 + 1)), value1 = min$2(values.subarray(i0 + 1));
  return value0 + (value1 - value0) * (i - i0);
}
function quantileSorted(values, p, valueof = number$2) {
  if (!(n = values.length) || isNaN(p = +p)) return;
  if (p <= 0 || n < 2) return +valueof(values[0], 0, values);
  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
  var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = +valueof(values[i0], i0, values), value1 = +valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
}
function range$3(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
  var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range3 = new Array(n);
  while (++i < n) {
    range3[i] = start + i * step;
  }
  return range3;
}
function initRange(domain, range3) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range3).domain(domain);
      break;
  }
  return this;
}
function initInterpolator(domain, interpolator) {
  switch (arguments.length) {
    case 0:
      break;
    case 1: {
      if (typeof domain === "function") this.interpolator(domain);
      else this.range(domain);
      break;
    }
    default: {
      this.domain(domain);
      if (typeof interpolator === "function") this.interpolator(interpolator);
      else this.range(interpolator);
      break;
    }
  }
  return this;
}
const implicit = Symbol("implicit");
function ordinal() {
  var index = new InternMap(), domain = [], range3 = [], unknown = implicit;
  function scale(d) {
    let i = index.get(d);
    if (i === void 0) {
      if (unknown !== implicit) return unknown;
      index.set(d, i = domain.push(d) - 1);
    }
    return range3[i % range3.length];
  }
  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [], index = new InternMap();
    for (const value of _) {
      if (index.has(value)) continue;
      index.set(value, domain.push(value) - 1);
    }
    return scale;
  };
  scale.range = function(_) {
    return arguments.length ? (range3 = Array.from(_), scale) : range3.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return ordinal(domain, range3).unknown(unknown);
  };
  initRange.apply(scale, arguments);
  return scale;
}
function band() {
  var scale = ordinal().unknown(void 0), domain = scale.domain, ordinalRange = scale.range, r0 = 0, r1 = 1, step, bandwidth, round2 = false, paddingInner = 0, paddingOuter = 0, align = 0.5;
  delete scale.unknown;
  function rescale() {
    var n = domain().length, reverse3 = r1 < r0, start = reverse3 ? r1 : r0, stop = reverse3 ? r0 : r1;
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round2) step = Math.floor(step);
    start += (stop - start - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round2) start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = range$3(n).map(function(i) {
      return start + step * i;
    });
    return ordinalRange(reverse3 ? values.reverse() : values);
  }
  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };
  scale.range = function(_) {
    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };
  scale.rangeRound = function(_) {
    return [r0, r1] = _, r0 = +r0, r1 = +r1, round2 = true, rescale();
  };
  scale.bandwidth = function() {
    return bandwidth;
  };
  scale.step = function() {
    return step;
  };
  scale.round = function(_) {
    return arguments.length ? (round2 = !!_, rescale()) : round2;
  };
  scale.padding = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
  };
  scale.paddingInner = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
  };
  scale.paddingOuter = function(_) {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
  };
  scale.align = function(_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };
  scale.copy = function() {
    return band(domain(), [r0, r1]).round(round2).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
  };
  return initRange.apply(rescale(), arguments);
}
function pointish(scale) {
  var copy2 = scale.copy;
  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;
  scale.copy = function() {
    return pointish(copy2());
  };
  return scale;
}
function point() {
  return pointish(band.apply(null, arguments).paddingInner(1));
}
function define(constructor, factory2, prototype2) {
  constructor.prototype = factory2.prototype = prototype2;
  prototype2.constructor = constructor;
}
function extend(parent, definition) {
  var prototype2 = Object.create(parent.prototype);
  for (var key in definition) prototype2[key] = definition[key];
  return prototype2;
}
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format2) {
  var m, l;
  format2 = (format2 + "").trim().toLowerCase();
  return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r2, g, b, a2) {
  if (a2 <= 0) r2 = g = b = NaN;
  return new Rgb(r2, g, b, a2);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb$1(r2, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r2) : new Rgb(r2, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r2, g, b, opacity) {
  this.r = +r2;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define(Rgb, rgb$1, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a2 = clampa(this.opacity);
  return `${a2 === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a2 === 1 ? ")" : `, ${a2})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s2, l, a2) {
  if (a2 <= 0) h = s2 = l = NaN;
  else if (l <= 0 || l >= 1) h = s2 = NaN;
  else if (s2 <= 0) h = NaN;
  return new Hsl(h, s2, l, a2);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r2 = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r2, g, b), max2 = Math.max(r2, g, b), h = NaN, s2 = max2 - min2, l = (max2 + min2) / 2;
  if (s2) {
    if (r2 === max2) h = (g - b) / s2 + (g < b) * 6;
    else if (g === max2) h = (b - r2) / s2 + 2;
    else h = (r2 - g) / s2 + 4;
    s2 /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s2 = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s2, l, o.opacity);
}
function hsl(h, s2, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s2, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s2, l, opacity) {
  this.h = +h;
  this.s = +s2;
  this.l = +l;
  this.opacity = +opacity;
}
define(Hsl, hsl, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s2 = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s2, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a2 = clampa(this.opacity);
    return `${a2 === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a2 === 1 ? ")" : `, ${a2})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
const constant = (x2) => () => x2;
function linear$1(a2, d) {
  return function(t) {
    return a2 + t * d;
  };
}
function exponential(a2, b, y2) {
  return a2 = Math.pow(a2, y2), b = Math.pow(b, y2) - a2, y2 = 1 / y2, function(t) {
    return Math.pow(a2 + t * b, y2);
  };
}
function gamma(y2) {
  return (y2 = +y2) === 1 ? nogamma : function(a2, b) {
    return b - a2 ? exponential(a2, b, y2) : constant(isNaN(a2) ? b : a2);
  };
}
function nogamma(a2, b) {
  var d = b - a2;
  return d ? linear$1(a2, d) : constant(isNaN(a2) ? b : a2);
}
const rgb = function rgbGamma(y2) {
  var color2 = gamma(y2);
  function rgb2(start, end) {
    var r2 = color2((start = rgb$1(start)).r, (end = rgb$1(end)).r), g = color2(start.g, end.g), b = color2(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r2(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
}(1);
function numberArray(a2, b) {
  if (!b) b = [];
  var n = a2 ? Math.min(b.length, a2.length) : 0, c2 = b.slice(), i;
  return function(t) {
    for (i = 0; i < n; ++i) c2[i] = a2[i] * (1 - t) + b[i] * t;
    return c2;
  };
}
function isNumberArray(x2) {
  return ArrayBuffer.isView(x2) && !(x2 instanceof DataView);
}
function genericArray(a2, b) {
  var nb = b ? b.length : 0, na = a2 ? Math.min(nb, a2.length) : 0, x2 = new Array(na), c2 = new Array(nb), i;
  for (i = 0; i < na; ++i) x2[i] = interpolate(a2[i], b[i]);
  for (; i < nb; ++i) c2[i] = b[i];
  return function(t) {
    for (i = 0; i < na; ++i) c2[i] = x2[i](t);
    return c2;
  };
}
function date$1(a2, b) {
  var d = /* @__PURE__ */ new Date();
  return a2 = +a2, b = +b, function(t) {
    return d.setTime(a2 * (1 - t) + b * t), d;
  };
}
function interpolateNumber$1(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return a2 * (1 - t) + b * t;
  };
}
function object(a2, b) {
  var i = {}, c2 = {}, k2;
  if (a2 === null || typeof a2 !== "object") a2 = {};
  if (b === null || typeof b !== "object") b = {};
  for (k2 in b) {
    if (k2 in a2) {
      i[k2] = interpolate(a2[k2], b[k2]);
    } else {
      c2[k2] = b[k2];
    }
  }
  return function(t) {
    for (k2 in i) c2[k2] = i[k2](t);
    return c2;
  };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function string(a2, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s2 = [], q = [];
  a2 = a2 + "", b = b + "";
  while ((am = reA.exec(a2)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s2[i]) s2[i] += bs;
      else s2[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s2[i]) s2[i] += bm;
      else s2[++i] = bm;
    } else {
      s2[++i] = null;
      q.push({ i, x: interpolateNumber$1(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s2[i]) s2[i] += bs;
    else s2[++i] = bs;
  }
  return s2.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2) s2[(o = q[i2]).i] = o.x(t);
    return s2.join("");
  });
}
function interpolate(a2, b) {
  var t = typeof b, c2;
  return b == null || t === "boolean" ? constant(b) : (t === "number" ? interpolateNumber$1 : t === "string" ? (c2 = color(b)) ? (b = c2, rgb) : string : b instanceof color ? rgb : b instanceof Date ? date$1 : isNumberArray(b) ? numberArray : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object : interpolateNumber$1)(a2, b);
}
function interpolateRound(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return Math.round(a2 * (1 - t) + b * t);
  };
}
function piecewise(interpolate$1, values) {
  if (values === void 0) values = interpolate$1, interpolate$1 = interpolate;
  var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
  while (i < n) I[i] = interpolate$1(v, v = values[++i]);
  return function(t) {
    var i2 = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
    return I[i2](t - i2);
  };
}
function constants(x2) {
  return function() {
    return x2;
  };
}
function number$1(x2) {
  return +x2;
}
var unit = [0, 1];
function identity$6(x2) {
  return x2;
}
function normalize(a2, b) {
  return (b -= a2 = +a2) ? function(x2) {
    return (x2 - a2) / b;
  } : constants(isNaN(b) ? NaN : 0.5);
}
function clamper(a2, b) {
  var t;
  if (a2 > b) t = a2, a2 = b, b = t;
  return function(x2) {
    return Math.max(a2, Math.min(b, x2));
  };
}
function bimap(domain, range3, interpolate2) {
  var d0 = domain[0], d1 = domain[1], r0 = range3[0], r1 = range3[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate2(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate2(r0, r1);
  return function(x2) {
    return r0(d0(x2));
  };
}
function polymap(domain, range3, interpolate2) {
  var j = Math.min(domain.length, range3.length) - 1, d = new Array(j), r2 = new Array(j), i = -1;
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range3 = range3.slice().reverse();
  }
  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r2[i] = interpolate2(range3[i], range3[i + 1]);
  }
  return function(x2) {
    var i2 = bisectRight(domain, x2, 1, j) - 1;
    return r2[i2](d[i2](x2));
  };
}
function copy$1(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer$2() {
  var domain = unit, range3 = unit, interpolate$1 = interpolate, transform, untransform, unknown, clamp = identity$6, piecewise2, output, input;
  function rescale() {
    var n = Math.min(domain.length, range3.length);
    if (clamp !== identity$6) clamp = clamper(domain[0], domain[n - 1]);
    piecewise2 = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown : (output || (output = piecewise2(domain.map(transform), range3, interpolate$1)))(transform(clamp(x2)));
  }
  scale.invert = function(y2) {
    return clamp(untransform((input || (input = piecewise2(range3, domain.map(transform), interpolateNumber$1)))(y2)));
  };
  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range3 = Array.from(_), rescale()) : range3.slice();
  };
  scale.rangeRound = function(_) {
    return range3 = Array.from(_), interpolate$1 = interpolateRound, rescale();
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity$6, rescale()) : clamp !== identity$6;
  };
  scale.interpolate = function(_) {
    return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer$2()(identity$6, identity$6);
}
function formatDecimal(x2) {
  return Math.abs(x2 = Math.round(x2)) >= 1e21 ? x2.toLocaleString("en").replace(/,/g, "") : x2.toString(10);
}
function formatDecimalParts(x2, p) {
  if ((i = (x2 = p ? x2.toExponential(p - 1) : x2.toExponential()).indexOf("e")) < 0) return null;
  var i, coefficient = x2.slice(0, i);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x2.slice(i + 1)
  ];
}
function exponent(x2) {
  return x2 = formatDecimalParts(Math.abs(x2)), x2 ? x2[1] : NaN;
}
function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }
    return t.reverse().join(thousands);
  };
}
function formatNumerals(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function formatTrim(s2) {
  out: for (var n = s2.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s2[i]) {
      case ".":
        i0 = i1 = i;
        break;
      case "0":
        if (i0 === 0) i0 = i;
        i1 = i;
        break;
      default:
        if (!+s2[i]) break out;
        if (i0 > 0) i0 = 0;
        break;
    }
  }
  return i0 > 0 ? s2.slice(0, i0) + s2.slice(i1 + 1) : s2;
}
var prefixExponent;
function formatPrefixAuto(x2, p) {
  var d = formatDecimalParts(x2, p);
  if (!d) return x2 + "";
  var coefficient = d[0], exponent2 = d[1], i = exponent2 - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent2 / 3))) * 3) + 1, n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x2, Math.max(0, p + i - 1))[0];
}
function formatRounded(x2, p) {
  var d = formatDecimalParts(x2, p);
  if (!d) return x2 + "";
  var coefficient = d[0], exponent2 = d[1];
  return exponent2 < 0 ? "0." + new Array(-exponent2).join("0") + coefficient : coefficient.length > exponent2 + 1 ? coefficient.slice(0, exponent2 + 1) + "." + coefficient.slice(exponent2 + 1) : coefficient + new Array(exponent2 - coefficient.length + 2).join("0");
}
const formatTypes = {
  "%": (x2, p) => (x2 * 100).toFixed(p),
  "b": (x2) => Math.round(x2).toString(2),
  "c": (x2) => x2 + "",
  "d": formatDecimal,
  "e": (x2, p) => x2.toExponential(p),
  "f": (x2, p) => x2.toFixed(p),
  "g": (x2, p) => x2.toPrecision(p),
  "o": (x2) => Math.round(x2).toString(8),
  "p": (x2, p) => formatRounded(x2 * 100, p),
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": (x2) => Math.round(x2).toString(16).toUpperCase(),
  "x": (x2) => Math.round(x2).toString(16)
};
function identity$5(x2) {
  return x2;
}
var map$3 = Array.prototype.map, prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function formatLocale$1(locale2) {
  var group = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity$5 : formatGroup(map$3.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity$5 : formatNumerals(map$3.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "−" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign2 = specifier.sign, symbol = specifier.symbol, zero2 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim2 = specifier.trim, type = specifier.type;
    if (type === "n") comma = true, type = "g";
    else if (!formatTypes[type]) precision === void 0 && (precision = 12), trim2 = true, type = "g";
    if (zero2 || fill === "0" && align === "=") zero2 = true, fill = "0", align = "=";
    var prefix2 = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
    var formatType = formatTypes[type], maybeSuffix = /[defgprs%]/.test(type);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix2, valueSuffix = suffix, i, n, c2;
      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim2) value = formatTrim(value);
        if (valueNegative && +value === 0 && sign2 !== "+") valueNegative = false;
        valuePrefix = (valueNegative ? sign2 === "(" ? sign2 : minus : sign2 === "-" || sign2 === "(" ? "" : sign2) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign2 === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c2 = value.charCodeAt(i), 48 > c2 || c2 > 57) {
              valueSuffix = (c2 === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero2) value = group(value, Infinity);
      var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
      if (comma && zero2) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3, k2 = Math.pow(10, -e), prefix2 = prefixes[8 + e / 3];
    return function(value2) {
      return f(k2 * value2) + prefix2;
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}
var locale$1;
var format;
var formatPrefix;
defaultLocale$1({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale$1(definition) {
  locale$1 = formatLocale$1(definition);
  format = locale$1.format;
  formatPrefix = locale$1.formatPrefix;
  return locale$1;
}
function precisionFixed(step) {
  return Math.max(0, -exponent(Math.abs(step)));
}
function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
}
function precisionRound(step, max2) {
  step = Math.abs(step), max2 = Math.abs(max2) - step;
  return Math.max(0, exponent(max2) - exponent(step)) + 1;
}
function tickFormat(start, stop, count, specifier) {
  var step = tickStep(start, stop, count), precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}
function linearish(scale) {
  var domain = scale.domain;
  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };
  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };
  scale.nice = function(count) {
    if (count == null) count = 10;
    var d = domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;
    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    while (maxIter-- > 0) {
      step = tickIncrement(start, stop, count);
      if (step === prestep) {
        d[i0] = start;
        d[i1] = stop;
        return domain(d);
      } else if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }
    return scale;
  };
  return scale;
}
function linear() {
  var scale = continuous();
  scale.copy = function() {
    return copy$1(scale, linear());
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}
function identity$4(domain) {
  var unknown;
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown : x2;
  }
  scale.invert = scale;
  scale.domain = scale.range = function(_) {
    return arguments.length ? (domain = Array.from(_, number$1), scale) : domain.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return identity$4(domain).unknown(unknown);
  };
  domain = arguments.length ? Array.from(domain, number$1) : [0, 1];
  return linearish(scale);
}
function nice(domain, interval) {
  domain = domain.slice();
  var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], t;
  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }
  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
}
function transformLog(x2) {
  return Math.log(x2);
}
function transformExp(x2) {
  return Math.exp(x2);
}
function transformLogn(x2) {
  return -Math.log(-x2);
}
function transformExpn(x2) {
  return -Math.exp(-x2);
}
function pow10(x2) {
  return isFinite(x2) ? +("1e" + x2) : x2 < 0 ? 0 : x2;
}
function powp(base) {
  return base === 10 ? pow10 : base === Math.E ? Math.exp : (x2) => Math.pow(base, x2);
}
function logp(base) {
  return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x2) => Math.log(x2) / base);
}
function reflect(f) {
  return (x2, k2) => -f(-x2, k2);
}
function loggish(transform) {
  const scale = transform(transformLog, transformExp);
  const domain = scale.domain;
  let base = 10;
  let logs;
  let pows;
  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog, transformExp);
    }
    return scale;
  }
  scale.base = function(_) {
    return arguments.length ? (base = +_, rescale()) : base;
  };
  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };
  scale.ticks = (count) => {
    const d = domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r2 = v < u;
    if (r2) [u, v] = [v, u];
    let i = logs(u);
    let j = logs(v);
    let k2;
    let t;
    const n = count == null ? 10 : +count;
    let z = [];
    if (!(base % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j);
      if (u > 0) for (; i <= j; ++i) {
        for (k2 = 1; k2 < base; ++k2) {
          t = i < 0 ? k2 / pows(-i) : k2 * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      else for (; i <= j; ++i) {
        for (k2 = base - 1; k2 >= 1; --k2) {
          t = i > 0 ? k2 / pows(-i) : k2 * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      if (z.length * 2 < n) z = ticks(u, v, n);
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(pows);
    }
    return r2 ? z.reverse() : z;
  };
  scale.tickFormat = (count, specifier) => {
    if (count == null) count = 10;
    if (specifier == null) specifier = base === 10 ? "s" : ",";
    if (typeof specifier !== "function") {
      if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null) specifier.trim = true;
      specifier = format(specifier);
    }
    if (count === Infinity) return specifier;
    const k2 = Math.max(1, base * count / scale.ticks().length);
    return (d) => {
      let i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5) i *= base;
      return i <= k2 ? specifier(d) : "";
    };
  };
  scale.nice = () => {
    return domain(nice(domain(), {
      floor: (x2) => pows(Math.floor(logs(x2))),
      ceil: (x2) => pows(Math.ceil(logs(x2)))
    }));
  };
  return scale;
}
function log() {
  const scale = loggish(transformer$2()).domain([1, 10]);
  scale.copy = () => copy$1(scale, log()).base(scale.base());
  initRange.apply(scale, arguments);
  return scale;
}
function transformSymlog(c2) {
  return function(x2) {
    return Math.sign(x2) * Math.log1p(Math.abs(x2 / c2));
  };
}
function transformSymexp(c2) {
  return function(x2) {
    return Math.sign(x2) * Math.expm1(Math.abs(x2)) * c2;
  };
}
function symlogish(transform) {
  var c2 = 1, scale = transform(transformSymlog(c2), transformSymexp(c2));
  scale.constant = function(_) {
    return arguments.length ? transform(transformSymlog(c2 = +_), transformSymexp(c2)) : c2;
  };
  return linearish(scale);
}
function symlog() {
  var scale = symlogish(transformer$2());
  scale.copy = function() {
    return copy$1(scale, symlog()).constant(scale.constant());
  };
  return initRange.apply(scale, arguments);
}
function transformPow(exponent2) {
  return function(x2) {
    return x2 < 0 ? -Math.pow(-x2, exponent2) : Math.pow(x2, exponent2);
  };
}
function transformSqrt(x2) {
  return x2 < 0 ? -Math.sqrt(-x2) : Math.sqrt(x2);
}
function transformSquare(x2) {
  return x2 < 0 ? -x2 * x2 : x2 * x2;
}
function powish(transform) {
  var scale = transform(identity$6, identity$6), exponent2 = 1;
  function rescale() {
    return exponent2 === 1 ? transform(identity$6, identity$6) : exponent2 === 0.5 ? transform(transformSqrt, transformSquare) : transform(transformPow(exponent2), transformPow(1 / exponent2));
  }
  scale.exponent = function(_) {
    return arguments.length ? (exponent2 = +_, rescale()) : exponent2;
  };
  return linearish(scale);
}
function pow() {
  var scale = powish(transformer$2());
  scale.copy = function() {
    return copy$1(scale, pow()).exponent(scale.exponent());
  };
  initRange.apply(scale, arguments);
  return scale;
}
function sqrt() {
  return pow.apply(null, arguments).exponent(0.5);
}
function square(x2) {
  return Math.sign(x2) * x2 * x2;
}
function unsquare(x2) {
  return Math.sign(x2) * Math.sqrt(Math.abs(x2));
}
function radial() {
  var squared = continuous(), range3 = [0, 1], round2 = false, unknown;
  function scale(x2) {
    var y2 = unsquare(squared(x2));
    return isNaN(y2) ? unknown : round2 ? Math.round(y2) : y2;
  }
  scale.invert = function(y2) {
    return squared.invert(square(y2));
  };
  scale.domain = function(_) {
    return arguments.length ? (squared.domain(_), scale) : squared.domain();
  };
  scale.range = function(_) {
    return arguments.length ? (squared.range((range3 = Array.from(_, number$1)).map(square)), scale) : range3.slice();
  };
  scale.rangeRound = function(_) {
    return scale.range(_).round(true);
  };
  scale.round = function(_) {
    return arguments.length ? (round2 = !!_, scale) : round2;
  };
  scale.clamp = function(_) {
    return arguments.length ? (squared.clamp(_), scale) : squared.clamp();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return radial(squared.domain(), range3).round(round2).clamp(squared.clamp()).unknown(unknown);
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}
function quantile() {
  var domain = [], range3 = [], thresholds = [], unknown;
  function rescale() {
    var i = 0, n = Math.max(1, range3.length);
    thresholds = new Array(n - 1);
    while (++i < n) thresholds[i - 1] = quantileSorted(domain, i / n);
    return scale;
  }
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown : range3[bisectRight(thresholds, x2)];
  }
  scale.invertExtent = function(y2) {
    var i = range3.indexOf(y2);
    return i < 0 ? [NaN, NaN] : [
      i > 0 ? thresholds[i - 1] : domain[0],
      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
    ];
  };
  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [];
    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
    domain.sort(ascending);
    return rescale();
  };
  scale.range = function(_) {
    return arguments.length ? (range3 = Array.from(_), rescale()) : range3.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.quantiles = function() {
    return thresholds.slice();
  };
  scale.copy = function() {
    return quantile().domain(domain).range(range3).unknown(unknown);
  };
  return initRange.apply(scale, arguments);
}
function quantize() {
  var x0 = 0, x1 = 1, n = 1, domain = [0.5], range3 = [0, 1], unknown;
  function scale(x2) {
    return x2 != null && x2 <= x2 ? range3[bisectRight(domain, x2, 0, n)] : unknown;
  }
  function rescale() {
    var i = -1;
    domain = new Array(n);
    while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
    return scale;
  }
  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1];
  };
  scale.range = function(_) {
    return arguments.length ? (n = (range3 = Array.from(_)).length - 1, rescale()) : range3.slice();
  };
  scale.invertExtent = function(y2) {
    var i = range3.indexOf(y2);
    return i < 0 ? [NaN, NaN] : i < 1 ? [x0, domain[0]] : i >= n ? [domain[n - 1], x1] : [domain[i - 1], domain[i]];
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : scale;
  };
  scale.thresholds = function() {
    return domain.slice();
  };
  scale.copy = function() {
    return quantize().domain([x0, x1]).range(range3).unknown(unknown);
  };
  return initRange.apply(linearish(scale), arguments);
}
function threshold() {
  var domain = [0.5], range3 = [0, 1], unknown, n = 1;
  function scale(x2) {
    return x2 != null && x2 <= x2 ? range3[bisectRight(domain, x2, 0, n)] : unknown;
  }
  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range3.length - 1), scale) : domain.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range3 = Array.from(_), n = Math.min(domain.length, range3.length - 1), scale) : range3.slice();
  };
  scale.invertExtent = function(y2) {
    var i = range3.indexOf(y2);
    return [domain[i - 1], domain[i]];
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return threshold().domain(domain).range(range3).unknown(unknown);
  };
  return initRange.apply(scale, arguments);
}
const t0 = /* @__PURE__ */ new Date(), t1 = /* @__PURE__ */ new Date();
function timeInterval(floori, offseti, count, field) {
  function interval(date2) {
    return floori(date2 = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+date2)), date2;
  }
  interval.floor = (date2) => {
    return floori(date2 = /* @__PURE__ */ new Date(+date2)), date2;
  };
  interval.ceil = (date2) => {
    return floori(date2 = new Date(date2 - 1)), offseti(date2, 1), floori(date2), date2;
  };
  interval.round = (date2) => {
    const d0 = interval(date2), d1 = interval.ceil(date2);
    return date2 - d0 < d1 - date2 ? d0 : d1;
  };
  interval.offset = (date2, step) => {
    return offseti(date2 = /* @__PURE__ */ new Date(+date2), step == null ? 1 : Math.floor(step)), date2;
  };
  interval.range = (start, stop, step) => {
    const range3 = [];
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range3;
    let previous;
    do
      range3.push(previous = /* @__PURE__ */ new Date(+start)), offseti(start, step), floori(start);
    while (previous < start && start < stop);
    return range3;
  };
  interval.filter = (test2) => {
    return timeInterval((date2) => {
      if (date2 >= date2) while (floori(date2), !test2(date2)) date2.setTime(date2 - 1);
    }, (date2, step) => {
      if (date2 >= date2) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date2, -1), !test2(date2)) {
          }
        }
        else while (--step >= 0) {
          while (offseti(date2, 1), !test2(date2)) {
          }
        }
      }
    });
  };
  if (count) {
    interval.count = (start, end) => {
      t0.setTime(+start), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };
    interval.every = (step) => {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? (d) => field(d) % step === 0 : (d) => interval.count(0, d) % step === 0);
    };
  }
  return interval;
}
const millisecond = timeInterval(() => {
}, (date2, step) => {
  date2.setTime(+date2 + step);
}, (start, end) => {
  return end - start;
});
millisecond.every = (k2) => {
  k2 = Math.floor(k2);
  if (!isFinite(k2) || !(k2 > 0)) return null;
  if (!(k2 > 1)) return millisecond;
  return timeInterval((date2) => {
    date2.setTime(Math.floor(date2 / k2) * k2);
  }, (date2, step) => {
    date2.setTime(+date2 + step * k2);
  }, (start, end) => {
    return (end - start) / k2;
  });
};
millisecond.range;
const durationSecond = 1e3;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;
const second = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds());
}, (date2, step) => {
  date2.setTime(+date2 + step * durationSecond);
}, (start, end) => {
  return (end - start) / durationSecond;
}, (date2) => {
  return date2.getUTCSeconds();
});
second.range;
const timeMinute = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, (date2) => {
  return date2.getMinutes();
});
timeMinute.range;
const utcMinute = timeInterval((date2) => {
  date2.setUTCSeconds(0, 0);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, (date2) => {
  return date2.getUTCMinutes();
});
utcMinute.range;
const timeHour = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond - date2.getMinutes() * durationMinute);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, (date2) => {
  return date2.getHours();
});
timeHour.range;
const utcHour = timeInterval((date2) => {
  date2.setUTCMinutes(0, 0, 0);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, (date2) => {
  return date2.getUTCHours();
});
utcHour.range;
const timeDay = timeInterval(
  (date2) => date2.setHours(0, 0, 0, 0),
  (date2, step) => date2.setDate(date2.getDate() + step),
  (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
  (date2) => date2.getDate() - 1
);
timeDay.range;
const utcDay = timeInterval((date2) => {
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCDate(date2.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, (date2) => {
  return date2.getUTCDate() - 1;
});
utcDay.range;
const unixDay = timeInterval((date2) => {
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCDate(date2.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, (date2) => {
  return Math.floor(date2 / durationDay);
});
unixDay.range;
function timeWeekday(i) {
  return timeInterval((date2) => {
    date2.setDate(date2.getDate() - (date2.getDay() + 7 - i) % 7);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setDate(date2.getDate() + step * 7);
  }, (start, end) => {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
const timeSunday = timeWeekday(0);
const timeMonday = timeWeekday(1);
const timeTuesday = timeWeekday(2);
const timeWednesday = timeWeekday(3);
const timeThursday = timeWeekday(4);
const timeFriday = timeWeekday(5);
const timeSaturday = timeWeekday(6);
timeSunday.range;
timeMonday.range;
timeTuesday.range;
timeWednesday.range;
timeThursday.range;
timeFriday.range;
timeSaturday.range;
function utcWeekday(i) {
  return timeInterval((date2) => {
    date2.setUTCDate(date2.getUTCDate() - (date2.getUTCDay() + 7 - i) % 7);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCDate(date2.getUTCDate() + step * 7);
  }, (start, end) => {
    return (end - start) / durationWeek;
  });
}
const utcSunday = utcWeekday(0);
const utcMonday = utcWeekday(1);
const utcTuesday = utcWeekday(2);
const utcWednesday = utcWeekday(3);
const utcThursday = utcWeekday(4);
const utcFriday = utcWeekday(5);
const utcSaturday = utcWeekday(6);
utcSunday.range;
utcMonday.range;
utcTuesday.range;
utcWednesday.range;
utcThursday.range;
utcFriday.range;
utcSaturday.range;
const timeMonth = timeInterval((date2) => {
  date2.setDate(1);
  date2.setHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setMonth(date2.getMonth() + step);
}, (start, end) => {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, (date2) => {
  return date2.getMonth();
});
timeMonth.range;
const utcMonth = timeInterval((date2) => {
  date2.setUTCDate(1);
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCMonth(date2.getUTCMonth() + step);
}, (start, end) => {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, (date2) => {
  return date2.getUTCMonth();
});
utcMonth.range;
const timeYear = timeInterval((date2) => {
  date2.setMonth(0, 1);
  date2.setHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setFullYear(date2.getFullYear() + step);
}, (start, end) => {
  return end.getFullYear() - start.getFullYear();
}, (date2) => {
  return date2.getFullYear();
});
timeYear.every = (k2) => {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : timeInterval((date2) => {
    date2.setFullYear(Math.floor(date2.getFullYear() / k2) * k2);
    date2.setMonth(0, 1);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setFullYear(date2.getFullYear() + step * k2);
  });
};
timeYear.range;
const utcYear = timeInterval((date2) => {
  date2.setUTCMonth(0, 1);
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCFullYear(date2.getUTCFullYear() + step);
}, (start, end) => {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, (date2) => {
  return date2.getUTCFullYear();
});
utcYear.every = (k2) => {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : timeInterval((date2) => {
    date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / k2) * k2);
    date2.setUTCMonth(0, 1);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCFullYear(date2.getUTCFullYear() + step * k2);
  });
};
utcYear.range;
function ticker(year, month, week, day, hour, minute) {
  const tickIntervals = [
    [second, 1, durationSecond],
    [second, 5, 5 * durationSecond],
    [second, 15, 15 * durationSecond],
    [second, 30, 30 * durationSecond],
    [minute, 1, durationMinute],
    [minute, 5, 5 * durationMinute],
    [minute, 15, 15 * durationMinute],
    [minute, 30, 30 * durationMinute],
    [hour, 1, durationHour],
    [hour, 3, 3 * durationHour],
    [hour, 6, 6 * durationHour],
    [hour, 12, 12 * durationHour],
    [day, 1, durationDay],
    [day, 2, 2 * durationDay],
    [week, 1, durationWeek],
    [month, 1, durationMonth],
    [month, 3, 3 * durationMonth],
    [year, 1, durationYear]
  ];
  function ticks2(start, stop, count) {
    const reverse3 = stop < start;
    if (reverse3) [start, stop] = [stop, start];
    const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
    const ticks3 = interval ? interval.range(start, +stop + 1) : [];
    return reverse3 ? ticks3.reverse() : ticks3;
  }
  function tickInterval(start, stop, count) {
    const target = Math.abs(stop - start) / count;
    const i = bisector(([, , step2]) => step2).right(tickIntervals, target);
    if (i === tickIntervals.length) return year.every(tickStep(start / durationYear, stop / durationYear, count));
    if (i === 0) return millisecond.every(Math.max(tickStep(start, stop, count), 1));
    const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
    return t.every(step);
  }
  return [ticks2, tickInterval];
}
const [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcSunday, unixDay, utcHour, utcMinute);
const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);
function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date2 = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date2.setFullYear(d.y);
    return date2;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date2 = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date2.setUTCFullYear(d.y);
    return date2;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
function newDate(y2, m, d) {
  return { y: y2, m, d, H: 0, M: 0, S: 0, L: 0 };
}
function formatLocale(locale2) {
  var locale_dateTime = locale2.dateTime, locale_date = locale2.date, locale_time = locale2.time, locale_periods = locale2.periods, locale_weekdays = locale2.days, locale_shortWeekdays = locale2.shortDays, locale_months = locale2.months, locale_shortMonths = locale2.shortMonths;
  var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };
  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };
  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);
  function newFormat(specifier, formats2) {
    return function(date2) {
      var string2 = [], i = -1, j = 0, n = specifier.length, c2, pad2, format2;
      if (!(date2 instanceof Date)) date2 = /* @__PURE__ */ new Date(+date2);
      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string2.push(specifier.slice(j, i));
          if ((pad2 = pads[c2 = specifier.charAt(++i)]) != null) c2 = specifier.charAt(++i);
          else pad2 = c2 === "e" ? " " : "0";
          if (format2 = formats2[c2]) c2 = format2(date2, pad2);
          string2.push(c2);
          j = i + 1;
        }
      }
      string2.push(specifier.slice(j, i));
      return string2.join("");
    };
  }
  function newParse(specifier, Z) {
    return function(string2) {
      var d = newDate(1900, void 0, 1), i = parseSpecifier(d, specifier, string2 += "", 0), week, day;
      if (i != string2.length) return null;
      if ("Q" in d) return new Date(d.Q);
      if ("s" in d) return new Date(d.s * 1e3 + ("L" in d ? d.L : 0));
      if (Z && !("Z" in d)) d.Z = 0;
      if ("p" in d) d.H = d.H % 12 + d.p * 12;
      if (d.m === void 0) d.m = "q" in d ? d.q : 0;
      if ("V" in d) {
        if (d.V < 1 || d.V > 53) return null;
        if (!("w" in d)) d.w = 1;
        if ("Z" in d) {
          week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
          week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay.offset(week, (d.V - 1) * 7);
          d.y = week.getUTCFullYear();
          d.m = week.getUTCMonth();
          d.d = week.getUTCDate() + (d.w + 6) % 7;
        } else {
          week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
          week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday(week);
          week = timeDay.offset(week, (d.V - 1) * 7);
          d.y = week.getFullYear();
          d.m = week.getMonth();
          d.d = week.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
        day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
      }
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }
      return localDate(d);
    };
  }
  function parseSpecifier(d, specifier, string2, j) {
    var i = 0, n = specifier.length, m = string2.length, c2, parse;
    while (i < n) {
      if (j >= m) return -1;
      c2 = specifier.charCodeAt(i++);
      if (c2 === 37) {
        c2 = specifier.charAt(i++);
        parse = parses[c2 in pads ? specifier.charAt(i++) : c2];
        if (!parse || (j = parse(d, string2, j)) < 0) return -1;
      } else if (c2 != string2.charCodeAt(j++)) {
        return -1;
      }
    }
    return j;
  }
  function parsePeriod(d, string2, i) {
    var n = periodRe.exec(string2.slice(i));
    return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortWeekday(d, string2, i) {
    var n = shortWeekdayRe.exec(string2.slice(i));
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseWeekday(d, string2, i) {
    var n = weekdayRe.exec(string2.slice(i));
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortMonth(d, string2, i) {
    var n = shortMonthRe.exec(string2.slice(i));
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseMonth(d, string2, i) {
    var n = monthRe.exec(string2.slice(i));
    return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseLocaleDateTime(d, string2, i) {
    return parseSpecifier(d, locale_dateTime, string2, i);
  }
  function parseLocaleDate(d, string2, i) {
    return parseSpecifier(d, locale_date, string2, i);
  }
  function parseLocaleTime(d, string2, i) {
    return parseSpecifier(d, locale_time, string2, i);
  }
  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }
  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }
  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }
  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }
  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }
  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }
  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }
  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }
  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }
  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }
  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }
  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() {
        return specifier;
      };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() {
        return specifier;
      };
      return p;
    }
  };
}
var pads = { "-": "", "_": " ", "0": "0" }, numberRe = /^\s*\d+/, percentRe = /^%/, requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad(value, fill, width) {
  var sign2 = value < 0 ? "-" : "", string2 = (sign2 ? -value : value) + "", length = string2.length;
  return sign2 + (length < width ? new Array(width - length + 1).join(fill) + string2 : string2);
}
function requote(s2) {
  return s2.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}
function parseWeekdayNumberSunday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}
function parseWeekdayNumberMonday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberSunday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberISO(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberMonday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}
function parseFullYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}
function parseYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3), i + n[0].length) : -1;
}
function parseZone(d, string2, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string2.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}
function parseQuarter(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}
function parseMonthNumber(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}
function parseDayOfMonth(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}
function parseDayOfYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}
function parseHour24(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}
function parseMinutes(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}
function parseSeconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}
function parseMilliseconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}
function parseMicroseconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1e3), i + n[0].length) : -1;
}
function parseLiteralPercent(d, string2, i) {
  var n = percentRe.exec(string2.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}
function parseUnixTimestamp(d, string2, i) {
  var n = numberRe.exec(string2.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}
function parseUnixTimestampSeconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}
function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}
function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}
function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}
function formatDayOfYear(d, p) {
  return pad(1 + timeDay.count(timeYear(d), d), p, 3);
}
function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}
function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}
function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}
function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}
function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}
function formatWeekdayNumberMonday(d) {
  var day = d.getDay();
  return day === 0 ? 7 : day;
}
function formatWeekNumberSunday(d, p) {
  return pad(timeSunday.count(timeYear(d) - 1, d), p, 2);
}
function dISO(d) {
  var day = d.getDay();
  return day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
}
function formatWeekNumberISO(d, p) {
  d = dISO(d);
  return pad(timeThursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
}
function formatWeekdayNumberSunday(d) {
  return d.getDay();
}
function formatWeekNumberMonday(d, p) {
  return pad(timeMonday.count(timeYear(d) - 1, d), p, 2);
}
function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}
function formatYearISO(d, p) {
  d = dISO(d);
  return pad(d.getFullYear() % 100, p, 2);
}
function formatFullYear(d, p) {
  return pad(d.getFullYear() % 1e4, p, 4);
}
function formatFullYearISO(d, p) {
  var day = d.getDay();
  d = day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
  return pad(d.getFullYear() % 1e4, p, 4);
}
function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
}
function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}
function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}
function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}
function formatUTCDayOfYear(d, p) {
  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
}
function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}
function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}
function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}
function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}
function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}
function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d, p) {
  return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
}
function UTCdISO(d) {
  var day = d.getUTCDay();
  return day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
}
function formatUTCWeekNumberISO(d, p) {
  d = UTCdISO(d);
  return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
}
function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}
function formatUTCWeekNumberMonday(d, p) {
  return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
}
function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCYearISO(d, p) {
  d = UTCdISO(d);
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCFullYearISO(d, p) {
  var day = d.getUTCDay();
  d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
  return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d) {
  return +d;
}
function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1e3);
}
var locale;
var timeFormat;
var utcFormat;
defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale(definition) {
  locale = formatLocale(definition);
  timeFormat = locale.format;
  locale.parse;
  utcFormat = locale.utcFormat;
  locale.utcParse;
  return locale;
}
function date(t) {
  return new Date(t);
}
function number(t) {
  return t instanceof Date ? +t : +/* @__PURE__ */ new Date(+t);
}
function calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format2) {
  var scale = continuous(), invert = scale.invert, domain = scale.domain;
  var formatMillisecond = format2(".%L"), formatSecond = format2(":%S"), formatMinute = format2("%I:%M"), formatHour = format2("%I %p"), formatDay = format2("%a %d"), formatWeek = format2("%b %d"), formatMonth = format2("%B"), formatYear2 = format2("%Y");
  function tickFormat2(date2) {
    return (second2(date2) < date2 ? formatMillisecond : minute(date2) < date2 ? formatSecond : hour(date2) < date2 ? formatMinute : day(date2) < date2 ? formatHour : month(date2) < date2 ? week(date2) < date2 ? formatDay : formatWeek : year(date2) < date2 ? formatMonth : formatYear2)(date2);
  }
  scale.invert = function(y2) {
    return new Date(invert(y2));
  };
  scale.domain = function(_) {
    return arguments.length ? domain(Array.from(_, number)) : domain().map(date);
  };
  scale.ticks = function(interval) {
    var d = domain();
    return ticks2(d[0], d[d.length - 1], interval == null ? 10 : interval);
  };
  scale.tickFormat = function(count, specifier) {
    return specifier == null ? tickFormat2 : format2(specifier);
  };
  scale.nice = function(interval) {
    var d = domain();
    if (!interval || typeof interval.range !== "function") interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
    return interval ? domain(nice(d, interval)) : scale;
  };
  scale.copy = function() {
    return copy$1(scale, calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format2));
  };
  return scale;
}
function time() {
  return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second, timeFormat).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
function utcTime() {
  return initRange.apply(calendar(utcTicks, utcTickInterval, utcYear, utcMonth, utcSunday, utcDay, utcHour, utcMinute, second, utcFormat).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
function transformer$1() {
  var x0 = 0, x1 = 1, t02, t12, k10, transform, interpolator = identity$6, clamp = false, unknown;
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown : interpolator(k10 === 0 ? 0.5 : (x2 = (transform(x2) - t02) * k10, clamp ? Math.max(0, Math.min(1, x2)) : x2));
  }
  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, t02 = transform(x0 = +x0), t12 = transform(x1 = +x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02), scale) : [x0, x1];
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };
  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };
  function range3(interpolate2) {
    return function(_) {
      var r0, r1;
      return arguments.length ? ([r0, r1] = _, interpolator = interpolate2(r0, r1), scale) : [interpolator(0), interpolator(1)];
    };
  }
  scale.range = range3(interpolate);
  scale.rangeRound = range3(interpolateRound);
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t) {
    transform = t, t02 = t(x0), t12 = t(x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02);
    return scale;
  };
}
function copy(source, target) {
  return target.domain(source.domain()).interpolator(source.interpolator()).clamp(source.clamp()).unknown(source.unknown());
}
function sequential() {
  var scale = linearish(transformer$1()(identity$6));
  scale.copy = function() {
    return copy(scale, sequential());
  };
  return initInterpolator.apply(scale, arguments);
}
function sequentialLog() {
  var scale = loggish(transformer$1()).domain([1, 10]);
  scale.copy = function() {
    return copy(scale, sequentialLog()).base(scale.base());
  };
  return initInterpolator.apply(scale, arguments);
}
function sequentialSymlog() {
  var scale = symlogish(transformer$1());
  scale.copy = function() {
    return copy(scale, sequentialSymlog()).constant(scale.constant());
  };
  return initInterpolator.apply(scale, arguments);
}
function sequentialPow() {
  var scale = powish(transformer$1());
  scale.copy = function() {
    return copy(scale, sequentialPow()).exponent(scale.exponent());
  };
  return initInterpolator.apply(scale, arguments);
}
function sequentialSqrt() {
  return sequentialPow.apply(null, arguments).exponent(0.5);
}
function sequentialQuantile() {
  var domain = [], interpolator = identity$6;
  function scale(x2) {
    if (x2 != null && !isNaN(x2 = +x2)) return interpolator((bisectRight(domain, x2, 1) - 1) / (domain.length - 1));
  }
  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [];
    for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
    domain.sort(ascending);
    return scale;
  };
  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };
  scale.range = function() {
    return domain.map((d, i) => interpolator(i / (domain.length - 1)));
  };
  scale.quantiles = function(n) {
    return Array.from({ length: n + 1 }, (_, i) => quantile$1(domain, i / n));
  };
  scale.copy = function() {
    return sequentialQuantile(interpolator).domain(domain);
  };
  return initInterpolator.apply(scale, arguments);
}
function transformer() {
  var x0 = 0, x1 = 0.5, x2 = 1, s2 = 1, t02, t12, t2, k10, k21, interpolator = identity$6, transform, clamp = false, unknown;
  function scale(x3) {
    return isNaN(x3 = +x3) ? unknown : (x3 = 0.5 + ((x3 = +transform(x3)) - t12) * (s2 * x3 < s2 * t12 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x3)) : x3));
  }
  scale.domain = function(_) {
    return arguments.length ? ([x0, x1, x2] = _, t02 = transform(x0 = +x0), t12 = transform(x1 = +x1), t2 = transform(x2 = +x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t2 ? 0 : 0.5 / (t2 - t12), s2 = t12 < t02 ? -1 : 1, scale) : [x0, x1, x2];
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };
  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };
  function range3(interpolate2) {
    return function(_) {
      var r0, r1, r2;
      return arguments.length ? ([r0, r1, r2] = _, interpolator = piecewise(interpolate2, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)];
    };
  }
  scale.range = range3(interpolate);
  scale.rangeRound = range3(interpolateRound);
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t) {
    transform = t, t02 = t(x0), t12 = t(x1), t2 = t(x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t2 ? 0 : 0.5 / (t2 - t12), s2 = t12 < t02 ? -1 : 1;
    return scale;
  };
}
function diverging() {
  var scale = linearish(transformer()(identity$6));
  scale.copy = function() {
    return copy(scale, diverging());
  };
  return initInterpolator.apply(scale, arguments);
}
function divergingLog() {
  var scale = loggish(transformer()).domain([0.1, 1, 10]);
  scale.copy = function() {
    return copy(scale, divergingLog()).base(scale.base());
  };
  return initInterpolator.apply(scale, arguments);
}
function divergingSymlog() {
  var scale = symlogish(transformer());
  scale.copy = function() {
    return copy(scale, divergingSymlog()).constant(scale.constant());
  };
  return initInterpolator.apply(scale, arguments);
}
function divergingPow() {
  var scale = powish(transformer());
  scale.copy = function() {
    return copy(scale, divergingPow()).exponent(scale.exponent());
  };
  return initInterpolator.apply(scale, arguments);
}
function divergingSqrt() {
  return divergingPow.apply(null, arguments).exponent(0.5);
}
const d3Scales = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  scaleBand: band,
  scaleDiverging: diverging,
  scaleDivergingLog: divergingLog,
  scaleDivergingPow: divergingPow,
  scaleDivergingSqrt: divergingSqrt,
  scaleDivergingSymlog: divergingSymlog,
  scaleIdentity: identity$4,
  scaleImplicit: implicit,
  scaleLinear: linear,
  scaleLog: log,
  scaleOrdinal: ordinal,
  scalePoint: point,
  scalePow: pow,
  scaleQuantile: quantile,
  scaleQuantize: quantize,
  scaleRadial: radial,
  scaleSequential: sequential,
  scaleSequentialLog: sequentialLog,
  scaleSequentialPow: sequentialPow,
  scaleSequentialQuantile: sequentialQuantile,
  scaleSequentialSqrt: sequentialSqrt,
  scaleSequentialSymlog: sequentialSymlog,
  scaleSqrt: sqrt,
  scaleSymlog: symlog,
  scaleThreshold: threshold,
  scaleTime: time,
  scaleUtc: utcTime,
  tickFormat
}, Symbol.toStringTag, { value: "Module" }));
var isSymbol = isSymbol_1;
function baseExtremum$4(array2, iteratee, comparator) {
  var index = -1, length = array2.length;
  while (++index < length) {
    var value = array2[index], current = iteratee(value);
    if (current != null && (computed === void 0 ? current === current && !isSymbol(current) : comparator(current, computed))) {
      var computed = current, result = value;
    }
  }
  return result;
}
var _baseExtremum = baseExtremum$4;
function baseGt$2(value, other) {
  return value > other;
}
var _baseGt = baseGt$2;
var baseExtremum$3 = _baseExtremum, baseGt$1 = _baseGt, identity$3 = identity_1;
function max(array2) {
  return array2 && array2.length ? baseExtremum$3(array2, identity$3, baseGt$1) : void 0;
}
var max_1 = max;
const max$1 = /* @__PURE__ */ getDefaultExportFromCjs(max_1);
function baseLt$2(value, other) {
  return value < other;
}
var _baseLt = baseLt$2;
var baseExtremum$2 = _baseExtremum, baseLt$1 = _baseLt, identity$2 = identity_1;
function min(array2) {
  return array2 && array2.length ? baseExtremum$2(array2, identity$2, baseLt$1) : void 0;
}
var min_1 = min;
const min$1 = /* @__PURE__ */ getDefaultExportFromCjs(min_1);
var arrayMap = _arrayMap, baseIteratee$7 = _baseIteratee, baseMap = _baseMap, isArray$2 = isArray_1;
function map$2(collection, iteratee) {
  var func = isArray$2(collection) ? arrayMap : baseMap;
  return func(collection, baseIteratee$7(iteratee));
}
var map_1 = map$2;
var baseFlatten = _baseFlatten, map$1 = map_1;
function flatMap(collection, iteratee) {
  return baseFlatten(map$1(collection, iteratee), 1);
}
var flatMap_1 = flatMap;
const flatMap$1 = /* @__PURE__ */ getDefaultExportFromCjs(flatMap_1);
var baseIsEqual = _baseIsEqual;
function isEqual(value, other) {
  return baseIsEqual(value, other);
}
var isEqual_1 = isEqual;
const isEqual$1 = /* @__PURE__ */ getDefaultExportFromCjs(isEqual_1);
var MAX_DIGITS = 1e9, defaults = {
  // These values must be integers within the stated ranges (inclusive).
  // Most of these values can be changed during run-time using `Decimal.config`.
  // The maximum number of significant digits of the result of a calculation or base conversion.
  // E.g. `Decimal.config({ precision: 20 });`
  precision: 20,
  // 1 to MAX_DIGITS
  // The rounding mode used by default by `toInteger`, `toDecimalPlaces`, `toExponential`,
  // `toFixed`, `toPrecision` and `toSignificantDigits`.
  //
  // ROUND_UP         0 Away from zero.
  // ROUND_DOWN       1 Towards zero.
  // ROUND_CEIL       2 Towards +Infinity.
  // ROUND_FLOOR      3 Towards -Infinity.
  // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
  // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
  // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
  // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
  // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
  //
  // E.g.
  // `Decimal.rounding = 4;`
  // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
  rounding: 4,
  // 0 to 8
  // The exponent value at and beneath which `toString` returns exponential notation.
  // JavaScript numbers: -7
  toExpNeg: -7,
  // 0 to -MAX_E
  // The exponent value at and above which `toString` returns exponential notation.
  // JavaScript numbers: 21
  toExpPos: 21,
  // 0 to MAX_E
  // The natural logarithm of 10.
  // 115 digits
  LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"
}, Decimal, external = true, decimalError = "[DecimalError] ", invalidArgument = decimalError + "Invalid argument: ", exponentOutOfRange = decimalError + "Exponent out of range: ", mathfloor = Math.floor, mathpow = Math.pow, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, ONE, BASE = 1e7, LOG_BASE = 7, MAX_SAFE_INTEGER = 9007199254740991, MAX_E = mathfloor(MAX_SAFE_INTEGER / LOG_BASE), P = {};
P.absoluteValue = P.abs = function() {
  var x2 = new this.constructor(this);
  if (x2.s) x2.s = 1;
  return x2;
};
P.comparedTo = P.cmp = function(y2) {
  var i, j, xdL, ydL, x2 = this;
  y2 = new x2.constructor(y2);
  if (x2.s !== y2.s) return x2.s || -y2.s;
  if (x2.e !== y2.e) return x2.e > y2.e ^ x2.s < 0 ? 1 : -1;
  xdL = x2.d.length;
  ydL = y2.d.length;
  for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
    if (x2.d[i] !== y2.d[i]) return x2.d[i] > y2.d[i] ^ x2.s < 0 ? 1 : -1;
  }
  return xdL === ydL ? 0 : xdL > ydL ^ x2.s < 0 ? 1 : -1;
};
P.decimalPlaces = P.dp = function() {
  var x2 = this, w = x2.d.length - 1, dp = (w - x2.e) * LOG_BASE;
  w = x2.d[w];
  if (w) for (; w % 10 == 0; w /= 10) dp--;
  return dp < 0 ? 0 : dp;
};
P.dividedBy = P.div = function(y2) {
  return divide(this, new this.constructor(y2));
};
P.dividedToIntegerBy = P.idiv = function(y2) {
  var x2 = this, Ctor = x2.constructor;
  return round(divide(x2, new Ctor(y2), 0, 1), Ctor.precision);
};
P.equals = P.eq = function(y2) {
  return !this.cmp(y2);
};
P.exponent = function() {
  return getBase10Exponent(this);
};
P.greaterThan = P.gt = function(y2) {
  return this.cmp(y2) > 0;
};
P.greaterThanOrEqualTo = P.gte = function(y2) {
  return this.cmp(y2) >= 0;
};
P.isInteger = P.isint = function() {
  return this.e > this.d.length - 2;
};
P.isNegative = P.isneg = function() {
  return this.s < 0;
};
P.isPositive = P.ispos = function() {
  return this.s > 0;
};
P.isZero = function() {
  return this.s === 0;
};
P.lessThan = P.lt = function(y2) {
  return this.cmp(y2) < 0;
};
P.lessThanOrEqualTo = P.lte = function(y2) {
  return this.cmp(y2) < 1;
};
P.logarithm = P.log = function(base) {
  var r2, x2 = this, Ctor = x2.constructor, pr = Ctor.precision, wpr = pr + 5;
  if (base === void 0) {
    base = new Ctor(10);
  } else {
    base = new Ctor(base);
    if (base.s < 1 || base.eq(ONE)) throw Error(decimalError + "NaN");
  }
  if (x2.s < 1) throw Error(decimalError + (x2.s ? "NaN" : "-Infinity"));
  if (x2.eq(ONE)) return new Ctor(0);
  external = false;
  r2 = divide(ln(x2, wpr), ln(base, wpr), wpr);
  external = true;
  return round(r2, pr);
};
P.minus = P.sub = function(y2) {
  var x2 = this;
  y2 = new x2.constructor(y2);
  return x2.s == y2.s ? subtract(x2, y2) : add(x2, (y2.s = -y2.s, y2));
};
P.modulo = P.mod = function(y2) {
  var q, x2 = this, Ctor = x2.constructor, pr = Ctor.precision;
  y2 = new Ctor(y2);
  if (!y2.s) throw Error(decimalError + "NaN");
  if (!x2.s) return round(new Ctor(x2), pr);
  external = false;
  q = divide(x2, y2, 0, 1).times(y2);
  external = true;
  return x2.minus(q);
};
P.naturalExponential = P.exp = function() {
  return exp(this);
};
P.naturalLogarithm = P.ln = function() {
  return ln(this);
};
P.negated = P.neg = function() {
  var x2 = new this.constructor(this);
  x2.s = -x2.s || 0;
  return x2;
};
P.plus = P.add = function(y2) {
  var x2 = this;
  y2 = new x2.constructor(y2);
  return x2.s == y2.s ? add(x2, y2) : subtract(x2, (y2.s = -y2.s, y2));
};
P.precision = P.sd = function(z) {
  var e, sd, w, x2 = this;
  if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);
  e = getBase10Exponent(x2) + 1;
  w = x2.d.length - 1;
  sd = w * LOG_BASE + 1;
  w = x2.d[w];
  if (w) {
    for (; w % 10 == 0; w /= 10) sd--;
    for (w = x2.d[0]; w >= 10; w /= 10) sd++;
  }
  return z && e > sd ? e : sd;
};
P.squareRoot = P.sqrt = function() {
  var e, n, pr, r2, s2, t, wpr, x2 = this, Ctor = x2.constructor;
  if (x2.s < 1) {
    if (!x2.s) return new Ctor(0);
    throw Error(decimalError + "NaN");
  }
  e = getBase10Exponent(x2);
  external = false;
  s2 = Math.sqrt(+x2);
  if (s2 == 0 || s2 == 1 / 0) {
    n = digitsToString(x2.d);
    if ((n.length + e) % 2 == 0) n += "0";
    s2 = Math.sqrt(n);
    e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
    if (s2 == 1 / 0) {
      n = "5e" + e;
    } else {
      n = s2.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e;
    }
    r2 = new Ctor(n);
  } else {
    r2 = new Ctor(s2.toString());
  }
  pr = Ctor.precision;
  s2 = wpr = pr + 3;
  for (; ; ) {
    t = r2;
    r2 = t.plus(divide(x2, t, wpr + 2)).times(0.5);
    if (digitsToString(t.d).slice(0, wpr) === (n = digitsToString(r2.d)).slice(0, wpr)) {
      n = n.slice(wpr - 3, wpr + 1);
      if (s2 == wpr && n == "4999") {
        round(t, pr + 1, 0);
        if (t.times(t).eq(x2)) {
          r2 = t;
          break;
        }
      } else if (n != "9999") {
        break;
      }
      wpr += 4;
    }
  }
  external = true;
  return round(r2, pr);
};
P.times = P.mul = function(y2) {
  var carry, e, i, k2, r2, rL, t, xdL, ydL, x2 = this, Ctor = x2.constructor, xd = x2.d, yd = (y2 = new Ctor(y2)).d;
  if (!x2.s || !y2.s) return new Ctor(0);
  y2.s *= x2.s;
  e = x2.e + y2.e;
  xdL = xd.length;
  ydL = yd.length;
  if (xdL < ydL) {
    r2 = xd;
    xd = yd;
    yd = r2;
    rL = xdL;
    xdL = ydL;
    ydL = rL;
  }
  r2 = [];
  rL = xdL + ydL;
  for (i = rL; i--; ) r2.push(0);
  for (i = ydL; --i >= 0; ) {
    carry = 0;
    for (k2 = xdL + i; k2 > i; ) {
      t = r2[k2] + yd[i] * xd[k2 - i - 1] + carry;
      r2[k2--] = t % BASE | 0;
      carry = t / BASE | 0;
    }
    r2[k2] = (r2[k2] + carry) % BASE | 0;
  }
  for (; !r2[--rL]; ) r2.pop();
  if (carry) ++e;
  else r2.shift();
  y2.d = r2;
  y2.e = e;
  return external ? round(y2, Ctor.precision) : y2;
};
P.toDecimalPlaces = P.todp = function(dp, rm) {
  var x2 = this, Ctor = x2.constructor;
  x2 = new Ctor(x2);
  if (dp === void 0) return x2;
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm === void 0) rm = Ctor.rounding;
  else checkInt32(rm, 0, 8);
  return round(x2, dp + getBase10Exponent(x2) + 1, rm);
};
P.toExponential = function(dp, rm) {
  var str, x2 = this, Ctor = x2.constructor;
  if (dp === void 0) {
    str = toString$1(x2, true);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    x2 = round(new Ctor(x2), dp + 1, rm);
    str = toString$1(x2, true, dp + 1);
  }
  return str;
};
P.toFixed = function(dp, rm) {
  var str, y2, x2 = this, Ctor = x2.constructor;
  if (dp === void 0) return toString$1(x2);
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm === void 0) rm = Ctor.rounding;
  else checkInt32(rm, 0, 8);
  y2 = round(new Ctor(x2), dp + getBase10Exponent(x2) + 1, rm);
  str = toString$1(y2.abs(), false, dp + getBase10Exponent(y2) + 1);
  return x2.isneg() && !x2.isZero() ? "-" + str : str;
};
P.toInteger = P.toint = function() {
  var x2 = this, Ctor = x2.constructor;
  return round(new Ctor(x2), getBase10Exponent(x2) + 1, Ctor.rounding);
};
P.toNumber = function() {
  return +this;
};
P.toPower = P.pow = function(y2) {
  var e, k2, pr, r2, sign2, yIsInt, x2 = this, Ctor = x2.constructor, guard = 12, yn = +(y2 = new Ctor(y2));
  if (!y2.s) return new Ctor(ONE);
  x2 = new Ctor(x2);
  if (!x2.s) {
    if (y2.s < 1) throw Error(decimalError + "Infinity");
    return x2;
  }
  if (x2.eq(ONE)) return x2;
  pr = Ctor.precision;
  if (y2.eq(ONE)) return round(x2, pr);
  e = y2.e;
  k2 = y2.d.length - 1;
  yIsInt = e >= k2;
  sign2 = x2.s;
  if (!yIsInt) {
    if (sign2 < 0) throw Error(decimalError + "NaN");
  } else if ((k2 = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
    r2 = new Ctor(ONE);
    e = Math.ceil(pr / LOG_BASE + 4);
    external = false;
    for (; ; ) {
      if (k2 % 2) {
        r2 = r2.times(x2);
        truncate(r2.d, e);
      }
      k2 = mathfloor(k2 / 2);
      if (k2 === 0) break;
      x2 = x2.times(x2);
      truncate(x2.d, e);
    }
    external = true;
    return y2.s < 0 ? new Ctor(ONE).div(r2) : round(r2, pr);
  }
  sign2 = sign2 < 0 && y2.d[Math.max(e, k2)] & 1 ? -1 : 1;
  x2.s = 1;
  external = false;
  r2 = y2.times(ln(x2, pr + guard));
  external = true;
  r2 = exp(r2);
  r2.s = sign2;
  return r2;
};
P.toPrecision = function(sd, rm) {
  var e, str, x2 = this, Ctor = x2.constructor;
  if (sd === void 0) {
    e = getBase10Exponent(x2);
    str = toString$1(x2, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    x2 = round(new Ctor(x2), sd, rm);
    e = getBase10Exponent(x2);
    str = toString$1(x2, sd <= e || e <= Ctor.toExpNeg, sd);
  }
  return str;
};
P.toSignificantDigits = P.tosd = function(sd, rm) {
  var x2 = this, Ctor = x2.constructor;
  if (sd === void 0) {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
  }
  return round(new Ctor(x2), sd, rm);
};
P.toString = P.valueOf = P.val = P.toJSON = P[Symbol.for("nodejs.util.inspect.custom")] = function() {
  var x2 = this, e = getBase10Exponent(x2), Ctor = x2.constructor;
  return toString$1(x2, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
};
function add(x2, y2) {
  var carry, d, e, i, k2, len, xd, yd, Ctor = x2.constructor, pr = Ctor.precision;
  if (!x2.s || !y2.s) {
    if (!y2.s) y2 = new Ctor(x2);
    return external ? round(y2, pr) : y2;
  }
  xd = x2.d;
  yd = y2.d;
  k2 = x2.e;
  e = y2.e;
  xd = xd.slice();
  i = k2 - e;
  if (i) {
    if (i < 0) {
      d = xd;
      i = -i;
      len = yd.length;
    } else {
      d = yd;
      e = k2;
      len = xd.length;
    }
    k2 = Math.ceil(pr / LOG_BASE);
    len = k2 > len ? k2 + 1 : len + 1;
    if (i > len) {
      i = len;
      d.length = 1;
    }
    d.reverse();
    for (; i--; ) d.push(0);
    d.reverse();
  }
  len = xd.length;
  i = yd.length;
  if (len - i < 0) {
    i = len;
    d = yd;
    yd = xd;
    xd = d;
  }
  for (carry = 0; i; ) {
    carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
    xd[i] %= BASE;
  }
  if (carry) {
    xd.unshift(carry);
    ++e;
  }
  for (len = xd.length; xd[--len] == 0; ) xd.pop();
  y2.d = xd;
  y2.e = e;
  return external ? round(y2, pr) : y2;
}
function checkInt32(i, min2, max2) {
  if (i !== ~~i || i < min2 || i > max2) {
    throw Error(invalidArgument + i);
  }
}
function digitsToString(d) {
  var i, k2, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
  if (indexOfLastWord > 0) {
    str += w;
    for (i = 1; i < indexOfLastWord; i++) {
      ws = d[i] + "";
      k2 = LOG_BASE - ws.length;
      if (k2) str += getZeroString(k2);
      str += ws;
    }
    w = d[i];
    ws = w + "";
    k2 = LOG_BASE - ws.length;
    if (k2) str += getZeroString(k2);
  } else if (w === 0) {
    return "0";
  }
  for (; w % 10 === 0; ) w /= 10;
  return str + w;
}
var divide = /* @__PURE__ */ function() {
  function multiplyInteger(x2, k2) {
    var temp, carry = 0, i = x2.length;
    for (x2 = x2.slice(); i--; ) {
      temp = x2[i] * k2 + carry;
      x2[i] = temp % BASE | 0;
      carry = temp / BASE | 0;
    }
    if (carry) x2.unshift(carry);
    return x2;
  }
  function compare(a2, b, aL, bL) {
    var i, r2;
    if (aL != bL) {
      r2 = aL > bL ? 1 : -1;
    } else {
      for (i = r2 = 0; i < aL; i++) {
        if (a2[i] != b[i]) {
          r2 = a2[i] > b[i] ? 1 : -1;
          break;
        }
      }
    }
    return r2;
  }
  function subtract2(a2, b, aL) {
    var i = 0;
    for (; aL--; ) {
      a2[aL] -= i;
      i = a2[aL] < b[aL] ? 1 : 0;
      a2[aL] = i * BASE + a2[aL] - b[aL];
    }
    for (; !a2[0] && a2.length > 1; ) a2.shift();
  }
  return function(x2, y2, pr, dp) {
    var cmp, e, i, k2, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x2.constructor, sign2 = x2.s == y2.s ? 1 : -1, xd = x2.d, yd = y2.d;
    if (!x2.s) return new Ctor(x2);
    if (!y2.s) throw Error(decimalError + "Division by zero");
    e = x2.e - y2.e;
    yL = yd.length;
    xL = xd.length;
    q = new Ctor(sign2);
    qd = q.d = [];
    for (i = 0; yd[i] == (xd[i] || 0); ) ++i;
    if (yd[i] > (xd[i] || 0)) --e;
    if (pr == null) {
      sd = pr = Ctor.precision;
    } else if (dp) {
      sd = pr + (getBase10Exponent(x2) - getBase10Exponent(y2)) + 1;
    } else {
      sd = pr;
    }
    if (sd < 0) return new Ctor(0);
    sd = sd / LOG_BASE + 2 | 0;
    i = 0;
    if (yL == 1) {
      k2 = 0;
      yd = yd[0];
      sd++;
      for (; (i < xL || k2) && sd--; i++) {
        t = k2 * BASE + (xd[i] || 0);
        qd[i] = t / yd | 0;
        k2 = t % yd | 0;
      }
    } else {
      k2 = BASE / (yd[0] + 1) | 0;
      if (k2 > 1) {
        yd = multiplyInteger(yd, k2);
        xd = multiplyInteger(xd, k2);
        yL = yd.length;
        xL = xd.length;
      }
      xi = yL;
      rem = xd.slice(0, yL);
      remL = rem.length;
      for (; remL < yL; ) rem[remL++] = 0;
      yz = yd.slice();
      yz.unshift(0);
      yd0 = yd[0];
      if (yd[1] >= BASE / 2) ++yd0;
      do {
        k2 = 0;
        cmp = compare(yd, rem, yL, remL);
        if (cmp < 0) {
          rem0 = rem[0];
          if (yL != remL) rem0 = rem0 * BASE + (rem[1] || 0);
          k2 = rem0 / yd0 | 0;
          if (k2 > 1) {
            if (k2 >= BASE) k2 = BASE - 1;
            prod = multiplyInteger(yd, k2);
            prodL = prod.length;
            remL = rem.length;
            cmp = compare(prod, rem, prodL, remL);
            if (cmp == 1) {
              k2--;
              subtract2(prod, yL < prodL ? yz : yd, prodL);
            }
          } else {
            if (k2 == 0) cmp = k2 = 1;
            prod = yd.slice();
          }
          prodL = prod.length;
          if (prodL < remL) prod.unshift(0);
          subtract2(rem, prod, remL);
          if (cmp == -1) {
            remL = rem.length;
            cmp = compare(yd, rem, yL, remL);
            if (cmp < 1) {
              k2++;
              subtract2(rem, yL < remL ? yz : yd, remL);
            }
          }
          remL = rem.length;
        } else if (cmp === 0) {
          k2++;
          rem = [0];
        }
        qd[i++] = k2;
        if (cmp && rem[0]) {
          rem[remL++] = xd[xi] || 0;
        } else {
          rem = [xd[xi]];
          remL = 1;
        }
      } while ((xi++ < xL || rem[0] !== void 0) && sd--);
    }
    if (!qd[0]) qd.shift();
    q.e = e;
    return round(q, dp ? pr + getBase10Exponent(q) + 1 : pr);
  };
}();
function exp(x2, sd) {
  var denominator, guard, pow2, sum, t, wpr, i = 0, k2 = 0, Ctor = x2.constructor, pr = Ctor.precision;
  if (getBase10Exponent(x2) > 16) throw Error(exponentOutOfRange + getBase10Exponent(x2));
  if (!x2.s) return new Ctor(ONE);
  {
    external = false;
    wpr = pr;
  }
  t = new Ctor(0.03125);
  while (x2.abs().gte(0.1)) {
    x2 = x2.times(t);
    k2 += 5;
  }
  guard = Math.log(mathpow(2, k2)) / Math.LN10 * 2 + 5 | 0;
  wpr += guard;
  denominator = pow2 = sum = new Ctor(ONE);
  Ctor.precision = wpr;
  for (; ; ) {
    pow2 = round(pow2.times(x2), wpr);
    denominator = denominator.times(++i);
    t = sum.plus(divide(pow2, denominator, wpr));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      while (k2--) sum = round(sum.times(sum), wpr);
      Ctor.precision = pr;
      return sd == null ? (external = true, round(sum, pr)) : sum;
    }
    sum = t;
  }
}
function getBase10Exponent(x2) {
  var e = x2.e * LOG_BASE, w = x2.d[0];
  for (; w >= 10; w /= 10) e++;
  return e;
}
function getLn10(Ctor, sd, pr) {
  if (sd > Ctor.LN10.sd()) {
    external = true;
    if (pr) Ctor.precision = pr;
    throw Error(decimalError + "LN10 precision limit exceeded");
  }
  return round(new Ctor(Ctor.LN10), sd);
}
function getZeroString(k2) {
  var zs = "";
  for (; k2--; ) zs += "0";
  return zs;
}
function ln(y2, sd) {
  var c2, c0, denominator, e, numerator, sum, t, wpr, x2, n = 1, guard = 10, x3 = y2, xd = x3.d, Ctor = x3.constructor, pr = Ctor.precision;
  if (x3.s < 1) throw Error(decimalError + (x3.s ? "NaN" : "-Infinity"));
  if (x3.eq(ONE)) return new Ctor(0);
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  if (x3.eq(10)) {
    if (sd == null) external = true;
    return getLn10(Ctor, wpr);
  }
  wpr += guard;
  Ctor.precision = wpr;
  c2 = digitsToString(xd);
  c0 = c2.charAt(0);
  e = getBase10Exponent(x3);
  if (Math.abs(e) < 15e14) {
    while (c0 < 7 && c0 != 1 || c0 == 1 && c2.charAt(1) > 3) {
      x3 = x3.times(y2);
      c2 = digitsToString(x3.d);
      c0 = c2.charAt(0);
      n++;
    }
    e = getBase10Exponent(x3);
    if (c0 > 1) {
      x3 = new Ctor("0." + c2);
      e++;
    } else {
      x3 = new Ctor(c0 + "." + c2.slice(1));
    }
  } else {
    t = getLn10(Ctor, wpr + 2, pr).times(e + "");
    x3 = ln(new Ctor(c0 + "." + c2.slice(1)), wpr - guard).plus(t);
    Ctor.precision = pr;
    return sd == null ? (external = true, round(x3, pr)) : x3;
  }
  sum = numerator = x3 = divide(x3.minus(ONE), x3.plus(ONE), wpr);
  x2 = round(x3.times(x3), wpr);
  denominator = 3;
  for (; ; ) {
    numerator = round(numerator.times(x2), wpr);
    t = sum.plus(divide(numerator, new Ctor(denominator), wpr));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      sum = sum.times(2);
      if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
      sum = divide(sum, new Ctor(n), wpr);
      Ctor.precision = pr;
      return sd == null ? (external = true, round(sum, pr)) : sum;
    }
    sum = t;
    denominator += 2;
  }
}
function parseDecimal(x2, str) {
  var e, i, len;
  if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
  if ((i = str.search(/e/i)) > 0) {
    if (e < 0) e = i;
    e += +str.slice(i + 1);
    str = str.substring(0, i);
  } else if (e < 0) {
    e = str.length;
  }
  for (i = 0; str.charCodeAt(i) === 48; ) ++i;
  for (len = str.length; str.charCodeAt(len - 1) === 48; ) --len;
  str = str.slice(i, len);
  if (str) {
    len -= i;
    e = e - i - 1;
    x2.e = mathfloor(e / LOG_BASE);
    x2.d = [];
    i = (e + 1) % LOG_BASE;
    if (e < 0) i += LOG_BASE;
    if (i < len) {
      if (i) x2.d.push(+str.slice(0, i));
      for (len -= LOG_BASE; i < len; ) x2.d.push(+str.slice(i, i += LOG_BASE));
      str = str.slice(i);
      i = LOG_BASE - str.length;
    } else {
      i -= len;
    }
    for (; i--; ) str += "0";
    x2.d.push(+str);
    if (external && (x2.e > MAX_E || x2.e < -MAX_E)) throw Error(exponentOutOfRange + e);
  } else {
    x2.s = 0;
    x2.e = 0;
    x2.d = [0];
  }
  return x2;
}
function round(x2, sd, rm) {
  var i, j, k2, n, rd, doRound, w, xdi, xd = x2.d;
  for (n = 1, k2 = xd[0]; k2 >= 10; k2 /= 10) n++;
  i = sd - n;
  if (i < 0) {
    i += LOG_BASE;
    j = sd;
    w = xd[xdi = 0];
  } else {
    xdi = Math.ceil((i + 1) / LOG_BASE);
    k2 = xd.length;
    if (xdi >= k2) return x2;
    w = k2 = xd[xdi];
    for (n = 1; k2 >= 10; k2 /= 10) n++;
    i %= LOG_BASE;
    j = i - LOG_BASE + n;
  }
  if (rm !== void 0) {
    k2 = mathpow(10, n - j - 1);
    rd = w / k2 % 10 | 0;
    doRound = sd < 0 || xd[xdi + 1] !== void 0 || w % k2;
    doRound = rm < 4 ? (rd || doRound) && (rm == 0 || rm == (x2.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || doRound || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
    (i > 0 ? j > 0 ? w / mathpow(10, n - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x2.s < 0 ? 8 : 7));
  }
  if (sd < 1 || !xd[0]) {
    if (doRound) {
      k2 = getBase10Exponent(x2);
      xd.length = 1;
      sd = sd - k2 - 1;
      xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
      x2.e = mathfloor(-sd / LOG_BASE) || 0;
    } else {
      xd.length = 1;
      xd[0] = x2.e = x2.s = 0;
    }
    return x2;
  }
  if (i == 0) {
    xd.length = xdi;
    k2 = 1;
    xdi--;
  } else {
    xd.length = xdi + 1;
    k2 = mathpow(10, LOG_BASE - i);
    xd[xdi] = j > 0 ? (w / mathpow(10, n - j) % mathpow(10, j) | 0) * k2 : 0;
  }
  if (doRound) {
    for (; ; ) {
      if (xdi == 0) {
        if ((xd[0] += k2) == BASE) {
          xd[0] = 1;
          ++x2.e;
        }
        break;
      } else {
        xd[xdi] += k2;
        if (xd[xdi] != BASE) break;
        xd[xdi--] = 0;
        k2 = 1;
      }
    }
  }
  for (i = xd.length; xd[--i] === 0; ) xd.pop();
  if (external && (x2.e > MAX_E || x2.e < -MAX_E)) {
    throw Error(exponentOutOfRange + getBase10Exponent(x2));
  }
  return x2;
}
function subtract(x2, y2) {
  var d, e, i, j, k2, len, xd, xe, xLTy, yd, Ctor = x2.constructor, pr = Ctor.precision;
  if (!x2.s || !y2.s) {
    if (y2.s) y2.s = -y2.s;
    else y2 = new Ctor(x2);
    return external ? round(y2, pr) : y2;
  }
  xd = x2.d;
  yd = y2.d;
  e = y2.e;
  xe = x2.e;
  xd = xd.slice();
  k2 = xe - e;
  if (k2) {
    xLTy = k2 < 0;
    if (xLTy) {
      d = xd;
      k2 = -k2;
      len = yd.length;
    } else {
      d = yd;
      e = xe;
      len = xd.length;
    }
    i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
    if (k2 > i) {
      k2 = i;
      d.length = 1;
    }
    d.reverse();
    for (i = k2; i--; ) d.push(0);
    d.reverse();
  } else {
    i = xd.length;
    len = yd.length;
    xLTy = i < len;
    if (xLTy) len = i;
    for (i = 0; i < len; i++) {
      if (xd[i] != yd[i]) {
        xLTy = xd[i] < yd[i];
        break;
      }
    }
    k2 = 0;
  }
  if (xLTy) {
    d = xd;
    xd = yd;
    yd = d;
    y2.s = -y2.s;
  }
  len = xd.length;
  for (i = yd.length - len; i > 0; --i) xd[len++] = 0;
  for (i = yd.length; i > k2; ) {
    if (xd[--i] < yd[i]) {
      for (j = i; j && xd[--j] === 0; ) xd[j] = BASE - 1;
      --xd[j];
      xd[i] += BASE;
    }
    xd[i] -= yd[i];
  }
  for (; xd[--len] === 0; ) xd.pop();
  for (; xd[0] === 0; xd.shift()) --e;
  if (!xd[0]) return new Ctor(0);
  y2.d = xd;
  y2.e = e;
  return external ? round(y2, pr) : y2;
}
function toString$1(x2, isExp, sd) {
  var k2, e = getBase10Exponent(x2), str = digitsToString(x2.d), len = str.length;
  if (isExp) {
    if (sd && (k2 = sd - len) > 0) {
      str = str.charAt(0) + "." + str.slice(1) + getZeroString(k2);
    } else if (len > 1) {
      str = str.charAt(0) + "." + str.slice(1);
    }
    str = str + (e < 0 ? "e" : "e+") + e;
  } else if (e < 0) {
    str = "0." + getZeroString(-e - 1) + str;
    if (sd && (k2 = sd - len) > 0) str += getZeroString(k2);
  } else if (e >= len) {
    str += getZeroString(e + 1 - len);
    if (sd && (k2 = sd - e - 1) > 0) str = str + "." + getZeroString(k2);
  } else {
    if ((k2 = e + 1) < len) str = str.slice(0, k2) + "." + str.slice(k2);
    if (sd && (k2 = sd - len) > 0) {
      if (e + 1 === len) str += ".";
      str += getZeroString(k2);
    }
  }
  return x2.s < 0 ? "-" + str : str;
}
function truncate(arr, len) {
  if (arr.length > len) {
    arr.length = len;
    return true;
  }
}
function clone(obj) {
  var i, p, ps;
  function Decimal2(value) {
    var x2 = this;
    if (!(x2 instanceof Decimal2)) return new Decimal2(value);
    x2.constructor = Decimal2;
    if (value instanceof Decimal2) {
      x2.s = value.s;
      x2.e = value.e;
      x2.d = (value = value.d) ? value.slice() : value;
      return;
    }
    if (typeof value === "number") {
      if (value * 0 !== 0) {
        throw Error(invalidArgument + value);
      }
      if (value > 0) {
        x2.s = 1;
      } else if (value < 0) {
        value = -value;
        x2.s = -1;
      } else {
        x2.s = 0;
        x2.e = 0;
        x2.d = [0];
        return;
      }
      if (value === ~~value && value < 1e7) {
        x2.e = 0;
        x2.d = [value];
        return;
      }
      return parseDecimal(x2, value.toString());
    } else if (typeof value !== "string") {
      throw Error(invalidArgument + value);
    }
    if (value.charCodeAt(0) === 45) {
      value = value.slice(1);
      x2.s = -1;
    } else {
      x2.s = 1;
    }
    if (isDecimal.test(value)) parseDecimal(x2, value);
    else throw Error(invalidArgument + value);
  }
  Decimal2.prototype = P;
  Decimal2.ROUND_UP = 0;
  Decimal2.ROUND_DOWN = 1;
  Decimal2.ROUND_CEIL = 2;
  Decimal2.ROUND_FLOOR = 3;
  Decimal2.ROUND_HALF_UP = 4;
  Decimal2.ROUND_HALF_DOWN = 5;
  Decimal2.ROUND_HALF_EVEN = 6;
  Decimal2.ROUND_HALF_CEIL = 7;
  Decimal2.ROUND_HALF_FLOOR = 8;
  Decimal2.clone = clone;
  Decimal2.config = Decimal2.set = config;
  if (obj === void 0) obj = {};
  if (obj) {
    ps = ["precision", "rounding", "toExpNeg", "toExpPos", "LN10"];
    for (i = 0; i < ps.length; ) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
  }
  Decimal2.config(obj);
  return Decimal2;
}
function config(obj) {
  if (!obj || typeof obj !== "object") {
    throw Error(decimalError + "Object expected");
  }
  var i, p, v, ps = [
    "precision",
    1,
    MAX_DIGITS,
    "rounding",
    0,
    8,
    "toExpNeg",
    -1 / 0,
    0,
    "toExpPos",
    0,
    1 / 0
  ];
  for (i = 0; i < ps.length; i += 3) {
    if ((v = obj[p = ps[i]]) !== void 0) {
      if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
      else throw Error(invalidArgument + p + ": " + v);
    }
  }
  if ((v = obj[p = "LN10"]) !== void 0) {
    if (v == Math.LN10) this[p] = new this(v);
    else throw Error(invalidArgument + p + ": " + v);
  }
  return this;
}
var Decimal = clone(defaults);
ONE = new Decimal(1);
const Decimal$1 = Decimal;
function _toConsumableArray$4(arr) {
  return _arrayWithoutHoles$4(arr) || _iterableToArray$5(arr) || _unsupportedIterableToArray$5(arr) || _nonIterableSpread$4();
}
function _nonIterableSpread$4() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$5(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray$5(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$5(o, minLen);
}
function _iterableToArray$5(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}
function _arrayWithoutHoles$4(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray$5(arr);
}
function _arrayLikeToArray$5(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
var identity$1 = function identity(i) {
  return i;
};
var PLACE_HOLDER = {};
var isPlaceHolder = function isPlaceHolder2(val) {
  return val === PLACE_HOLDER;
};
var curry0 = function curry02(fn) {
  return function _curried() {
    if (arguments.length === 0 || arguments.length === 1 && isPlaceHolder(arguments.length <= 0 ? void 0 : arguments[0])) {
      return _curried;
    }
    return fn.apply(void 0, arguments);
  };
};
var curryN = function curryN2(n, fn) {
  if (n === 1) {
    return fn;
  }
  return curry0(function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var argsLength = args.filter(function(arg) {
      return arg !== PLACE_HOLDER;
    }).length;
    if (argsLength >= n) {
      return fn.apply(void 0, args);
    }
    return curryN2(n - argsLength, curry0(function() {
      for (var _len2 = arguments.length, restArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        restArgs[_key2] = arguments[_key2];
      }
      var newArgs = args.map(function(arg) {
        return isPlaceHolder(arg) ? restArgs.shift() : arg;
      });
      return fn.apply(void 0, _toConsumableArray$4(newArgs).concat(restArgs));
    }));
  });
};
var curry = function curry2(fn) {
  return curryN(fn.length, fn);
};
var range$2 = function range(begin, end) {
  var arr = [];
  for (var i = begin; i < end; ++i) {
    arr[i - begin] = i;
  }
  return arr;
};
var map = curry(function(fn, arr) {
  if (Array.isArray(arr)) {
    return arr.map(fn);
  }
  return Object.keys(arr).map(function(key) {
    return arr[key];
  }).map(fn);
});
var compose = function compose2() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }
  if (!args.length) {
    return identity$1;
  }
  var fns = args.reverse();
  var firstFn = fns[0];
  var tailsFn = fns.slice(1);
  return function() {
    return tailsFn.reduce(function(res, fn) {
      return fn(res);
    }, firstFn.apply(void 0, arguments));
  };
};
var reverse = function reverse2(arr) {
  if (Array.isArray(arr)) {
    return arr.reverse();
  }
  return arr.split("").reverse.join("");
};
var memoize = function memoize2(fn) {
  var lastArgs = null;
  var lastResult = null;
  return function() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    if (lastArgs && args.every(function(val, i) {
      return val === lastArgs[i];
    })) {
      return lastResult;
    }
    lastArgs = args;
    lastResult = fn.apply(void 0, args);
    return lastResult;
  };
};
function getDigitCount(value) {
  var result;
  if (value === 0) {
    result = 1;
  } else {
    result = Math.floor(new Decimal$1(value).abs().log(10).toNumber()) + 1;
  }
  return result;
}
function rangeStep(start, end, step) {
  var num = new Decimal$1(start);
  var i = 0;
  var result = [];
  while (num.lt(end) && i < 1e5) {
    result.push(num.toNumber());
    num = num.add(step);
    i++;
  }
  return result;
}
var interpolateNumber = curry(function(a2, b, t) {
  var newA = +a2;
  var newB = +b;
  return newA + t * (newB - newA);
});
var uninterpolateNumber = curry(function(a2, b, x2) {
  var diff = b - +a2;
  diff = diff || Infinity;
  return (x2 - a2) / diff;
});
var uninterpolateTruncation = curry(function(a2, b, x2) {
  var diff = b - +a2;
  diff = diff || Infinity;
  return Math.max(0, Math.min(1, (x2 - a2) / diff));
});
const Arithmetic = {
  rangeStep,
  getDigitCount,
  interpolateNumber,
  uninterpolateNumber,
  uninterpolateTruncation
};
function _toConsumableArray$3(arr) {
  return _arrayWithoutHoles$3(arr) || _iterableToArray$4(arr) || _unsupportedIterableToArray$4(arr) || _nonIterableSpread$3();
}
function _nonIterableSpread$3() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArray$4(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}
function _arrayWithoutHoles$3(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray$4(arr);
}
function _slicedToArray$2(arr, i) {
  return _arrayWithHoles$3(arr) || _iterableToArrayLimit$2(arr, i) || _unsupportedIterableToArray$4(arr, i) || _nonIterableRest$3();
}
function _nonIterableRest$3() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$4(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray$4(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$4(o, minLen);
}
function _arrayLikeToArray$4(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
function _iterableToArrayLimit$2(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = void 0;
  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
function _arrayWithHoles$3(arr) {
  if (Array.isArray(arr)) return arr;
}
function getValidInterval(_ref) {
  var _ref2 = _slicedToArray$2(_ref, 2), min2 = _ref2[0], max2 = _ref2[1];
  var validMin = min2, validMax = max2;
  if (min2 > max2) {
    validMin = max2;
    validMax = min2;
  }
  return [validMin, validMax];
}
function getFormatStep(roughStep, allowDecimals, correctionFactor) {
  if (roughStep.lte(0)) {
    return new Decimal$1(0);
  }
  var digitCount = Arithmetic.getDigitCount(roughStep.toNumber());
  var digitCountValue = new Decimal$1(10).pow(digitCount);
  var stepRatio = roughStep.div(digitCountValue);
  var stepRatioScale = digitCount !== 1 ? 0.05 : 0.1;
  var amendStepRatio = new Decimal$1(Math.ceil(stepRatio.div(stepRatioScale).toNumber())).add(correctionFactor).mul(stepRatioScale);
  var formatStep = amendStepRatio.mul(digitCountValue);
  return allowDecimals ? formatStep : new Decimal$1(Math.ceil(formatStep));
}
function getTickOfSingleValue(value, tickCount, allowDecimals) {
  var step = 1;
  var middle = new Decimal$1(value);
  if (!middle.isint() && allowDecimals) {
    var absVal = Math.abs(value);
    if (absVal < 1) {
      step = new Decimal$1(10).pow(Arithmetic.getDigitCount(value) - 1);
      middle = new Decimal$1(Math.floor(middle.div(step).toNumber())).mul(step);
    } else if (absVal > 1) {
      middle = new Decimal$1(Math.floor(value));
    }
  } else if (value === 0) {
    middle = new Decimal$1(Math.floor((tickCount - 1) / 2));
  } else if (!allowDecimals) {
    middle = new Decimal$1(Math.floor(value));
  }
  var middleIndex = Math.floor((tickCount - 1) / 2);
  var fn = compose(map(function(n) {
    return middle.add(new Decimal$1(n - middleIndex).mul(step)).toNumber();
  }), range$2);
  return fn(0, tickCount);
}
function calculateStep(min2, max2, tickCount, allowDecimals) {
  var correctionFactor = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
  if (!Number.isFinite((max2 - min2) / (tickCount - 1))) {
    return {
      step: new Decimal$1(0),
      tickMin: new Decimal$1(0),
      tickMax: new Decimal$1(0)
    };
  }
  var step = getFormatStep(new Decimal$1(max2).sub(min2).div(tickCount - 1), allowDecimals, correctionFactor);
  var middle;
  if (min2 <= 0 && max2 >= 0) {
    middle = new Decimal$1(0);
  } else {
    middle = new Decimal$1(min2).add(max2).div(2);
    middle = middle.sub(new Decimal$1(middle).mod(step));
  }
  var belowCount = Math.ceil(middle.sub(min2).div(step).toNumber());
  var upCount = Math.ceil(new Decimal$1(max2).sub(middle).div(step).toNumber());
  var scaleCount = belowCount + upCount + 1;
  if (scaleCount > tickCount) {
    return calculateStep(min2, max2, tickCount, allowDecimals, correctionFactor + 1);
  }
  if (scaleCount < tickCount) {
    upCount = max2 > 0 ? upCount + (tickCount - scaleCount) : upCount;
    belowCount = max2 > 0 ? belowCount : belowCount + (tickCount - scaleCount);
  }
  return {
    step,
    tickMin: middle.sub(new Decimal$1(belowCount).mul(step)),
    tickMax: middle.add(new Decimal$1(upCount).mul(step))
  };
}
function getNiceTickValuesFn(_ref3) {
  var _ref4 = _slicedToArray$2(_ref3, 2), min2 = _ref4[0], max2 = _ref4[1];
  var tickCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6;
  var allowDecimals = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
  var count = Math.max(tickCount, 2);
  var _getValidInterval = getValidInterval([min2, max2]), _getValidInterval2 = _slicedToArray$2(_getValidInterval, 2), cormin = _getValidInterval2[0], cormax = _getValidInterval2[1];
  if (cormin === -Infinity || cormax === Infinity) {
    var _values = cormax === Infinity ? [cormin].concat(_toConsumableArray$3(range$2(0, tickCount - 1).map(function() {
      return Infinity;
    }))) : [].concat(_toConsumableArray$3(range$2(0, tickCount - 1).map(function() {
      return -Infinity;
    })), [cormax]);
    return min2 > max2 ? reverse(_values) : _values;
  }
  if (cormin === cormax) {
    return getTickOfSingleValue(cormin, tickCount, allowDecimals);
  }
  var _calculateStep = calculateStep(cormin, cormax, count, allowDecimals), step = _calculateStep.step, tickMin = _calculateStep.tickMin, tickMax = _calculateStep.tickMax;
  var values = Arithmetic.rangeStep(tickMin, tickMax.add(new Decimal$1(0.1).mul(step)), step);
  return min2 > max2 ? reverse(values) : values;
}
function getTickValuesFixedDomainFn(_ref7, tickCount) {
  var _ref8 = _slicedToArray$2(_ref7, 2), min2 = _ref8[0], max2 = _ref8[1];
  var allowDecimals = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
  var _getValidInterval5 = getValidInterval([min2, max2]), _getValidInterval6 = _slicedToArray$2(_getValidInterval5, 2), cormin = _getValidInterval6[0], cormax = _getValidInterval6[1];
  if (cormin === -Infinity || cormax === Infinity) {
    return [min2, max2];
  }
  if (cormin === cormax) {
    return [cormin];
  }
  var count = Math.max(tickCount, 2);
  var step = getFormatStep(new Decimal$1(cormax).sub(cormin).div(count - 1), allowDecimals, 0);
  var values = [].concat(_toConsumableArray$3(Arithmetic.rangeStep(new Decimal$1(cormin), new Decimal$1(cormax).sub(new Decimal$1(0.99).mul(step)), step)), [cormax]);
  return min2 > max2 ? reverse(values) : values;
}
var getNiceTickValues = memoize(getNiceTickValuesFn);
var getTickValuesFixedDomain = memoize(getTickValuesFixedDomainFn);
var prefix = "Invariant failed";
function invariant(condition, message) {
  {
    throw new Error(prefix);
  }
}
function last(array2) {
  var length = array2 == null ? 0 : array2.length;
  return length ? array2[length - 1] : void 0;
}
var last_1 = last;
const last$1 = /* @__PURE__ */ getDefaultExportFromCjs(last_1);
var propTypes = { exports: {} };
var ReactPropTypesSecret$1 = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
var ReactPropTypesSecret_1 = ReactPropTypesSecret$1;
var ReactPropTypesSecret = ReactPropTypesSecret_1;
function emptyFunction() {
}
function emptyFunctionWithReset() {
}
emptyFunctionWithReset.resetWarningCache = emptyFunction;
var factoryWithThrowingShims = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      return;
    }
    var err = new Error(
      "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
    );
    err.name = "Invariant Violation";
    throw err;
  }
  shim.isRequired = shim;
  function getShim() {
    return shim;
  }
  var ReactPropTypes = {
    array: shim,
    bigint: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,
    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,
    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};
{
  propTypes.exports = factoryWithThrowingShims();
}
var propTypesExports = propTypes.exports;
const PropTypes = /* @__PURE__ */ getDefaultExportFromCjs(propTypesExports);
const { getOwnPropertyNames, getOwnPropertySymbols } = Object;
const { hasOwnProperty: hasOwnProperty$1 } = Object.prototype;
function combineComparators(comparatorA, comparatorB) {
  return function isEqual2(a2, b, state) {
    return comparatorA(a2, b, state) && comparatorB(a2, b, state);
  };
}
function createIsCircular(areItemsEqual) {
  return function isCircular(a2, b, state) {
    if (!a2 || !b || typeof a2 !== "object" || typeof b !== "object") {
      return areItemsEqual(a2, b, state);
    }
    const { cache } = state;
    const cachedA = cache.get(a2);
    const cachedB = cache.get(b);
    if (cachedA && cachedB) {
      return cachedA === b && cachedB === a2;
    }
    cache.set(a2, b);
    cache.set(b, a2);
    const result = areItemsEqual(a2, b, state);
    cache.delete(a2);
    cache.delete(b);
    return result;
  };
}
function getShortTag(value) {
  return value != null ? value[Symbol.toStringTag] : void 0;
}
function getStrictProperties(object2) {
  return getOwnPropertyNames(object2).concat(getOwnPropertySymbols(object2));
}
const hasOwn = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.hasOwn || ((object2, property2) => hasOwnProperty$1.call(object2, property2))
);
function sameValueZeroEqual(a2, b) {
  return a2 === b || !a2 && !b && a2 !== a2 && b !== b;
}
const PREACT_VNODE = "__v";
const PREACT_OWNER = "__o";
const REACT_OWNER = "_owner";
const { getOwnPropertyDescriptor, keys: keys$1 } = Object;
function areArrayBuffersEqual(a2, b) {
  return a2.byteLength === b.byteLength && areTypedArraysEqual(new Uint8Array(a2), new Uint8Array(b));
}
function areArraysEqual(a2, b, state) {
  let index = a2.length;
  if (b.length !== index) {
    return false;
  }
  while (index-- > 0) {
    if (!state.equals(a2[index], b[index], index, index, a2, b, state)) {
      return false;
    }
  }
  return true;
}
function areDataViewsEqual(a2, b) {
  return a2.byteLength === b.byteLength && areTypedArraysEqual(new Uint8Array(a2.buffer, a2.byteOffset, a2.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength));
}
function areDatesEqual(a2, b) {
  return sameValueZeroEqual(a2.getTime(), b.getTime());
}
function areErrorsEqual(a2, b) {
  return a2.name === b.name && a2.message === b.message && a2.cause === b.cause && a2.stack === b.stack;
}
function areFunctionsEqual(a2, b) {
  return a2 === b;
}
function areMapsEqual(a2, b, state) {
  const size = a2.size;
  if (size !== b.size) {
    return false;
  }
  if (!size) {
    return true;
  }
  const matchedIndices = new Array(size);
  const aIterable = a2.entries();
  let aResult;
  let bResult;
  let index = 0;
  while (aResult = aIterable.next()) {
    if (aResult.done) {
      break;
    }
    const bIterable = b.entries();
    let hasMatch = false;
    let matchIndex = 0;
    while (bResult = bIterable.next()) {
      if (bResult.done) {
        break;
      }
      if (matchedIndices[matchIndex]) {
        matchIndex++;
        continue;
      }
      const aEntry = aResult.value;
      const bEntry = bResult.value;
      if (state.equals(aEntry[0], bEntry[0], index, matchIndex, a2, b, state) && state.equals(aEntry[1], bEntry[1], aEntry[0], bEntry[0], a2, b, state)) {
        hasMatch = matchedIndices[matchIndex] = true;
        break;
      }
      matchIndex++;
    }
    if (!hasMatch) {
      return false;
    }
    index++;
  }
  return true;
}
const areNumbersEqual = sameValueZeroEqual;
function areObjectsEqual(a2, b, state) {
  const properties = keys$1(a2);
  let index = properties.length;
  if (keys$1(b).length !== index) {
    return false;
  }
  while (index-- > 0) {
    if (!isPropertyEqual(a2, b, state, properties[index])) {
      return false;
    }
  }
  return true;
}
function areObjectsEqualStrict(a2, b, state) {
  const properties = getStrictProperties(a2);
  let index = properties.length;
  if (getStrictProperties(b).length !== index) {
    return false;
  }
  let property2;
  let descriptorA;
  let descriptorB;
  while (index-- > 0) {
    property2 = properties[index];
    if (!isPropertyEqual(a2, b, state, property2)) {
      return false;
    }
    descriptorA = getOwnPropertyDescriptor(a2, property2);
    descriptorB = getOwnPropertyDescriptor(b, property2);
    if ((descriptorA || descriptorB) && (!descriptorA || !descriptorB || descriptorA.configurable !== descriptorB.configurable || descriptorA.enumerable !== descriptorB.enumerable || descriptorA.writable !== descriptorB.writable)) {
      return false;
    }
  }
  return true;
}
function arePrimitiveWrappersEqual(a2, b) {
  return sameValueZeroEqual(a2.valueOf(), b.valueOf());
}
function areRegExpsEqual(a2, b) {
  return a2.source === b.source && a2.flags === b.flags;
}
function areSetsEqual(a2, b, state) {
  const size = a2.size;
  if (size !== b.size) {
    return false;
  }
  if (!size) {
    return true;
  }
  const matchedIndices = new Array(size);
  const aIterable = a2.values();
  let aResult;
  let bResult;
  while (aResult = aIterable.next()) {
    if (aResult.done) {
      break;
    }
    const bIterable = b.values();
    let hasMatch = false;
    let matchIndex = 0;
    while (bResult = bIterable.next()) {
      if (bResult.done) {
        break;
      }
      if (!matchedIndices[matchIndex] && state.equals(aResult.value, bResult.value, aResult.value, bResult.value, a2, b, state)) {
        hasMatch = matchedIndices[matchIndex] = true;
        break;
      }
      matchIndex++;
    }
    if (!hasMatch) {
      return false;
    }
  }
  return true;
}
function areTypedArraysEqual(a2, b) {
  let index = a2.byteLength;
  if (b.byteLength !== index || a2.byteOffset !== b.byteOffset) {
    return false;
  }
  while (index-- > 0) {
    if (a2[index] !== b[index]) {
      return false;
    }
  }
  return true;
}
function areUrlsEqual(a2, b) {
  return a2.hostname === b.hostname && a2.pathname === b.pathname && a2.protocol === b.protocol && a2.port === b.port && a2.hash === b.hash && a2.username === b.username && a2.password === b.password;
}
function isPropertyEqual(a2, b, state, property2) {
  if ((property2 === REACT_OWNER || property2 === PREACT_OWNER || property2 === PREACT_VNODE) && (a2.$$typeof || b.$$typeof)) {
    return true;
  }
  return hasOwn(b, property2) && state.equals(a2[property2], b[property2], property2, property2, a2, b, state);
}
const ARRAY_BUFFER_TAG = "[object ArrayBuffer]";
const ARGUMENTS_TAG = "[object Arguments]";
const BOOLEAN_TAG = "[object Boolean]";
const DATA_VIEW_TAG = "[object DataView]";
const DATE_TAG = "[object Date]";
const ERROR_TAG = "[object Error]";
const MAP_TAG = "[object Map]";
const NUMBER_TAG = "[object Number]";
const OBJECT_TAG = "[object Object]";
const REG_EXP_TAG = "[object RegExp]";
const SET_TAG = "[object Set]";
const STRING_TAG = "[object String]";
const TYPED_ARRAY_TAGS = {
  "[object Int8Array]": true,
  "[object Uint8Array]": true,
  "[object Uint8ClampedArray]": true,
  "[object Int16Array]": true,
  "[object Uint16Array]": true,
  "[object Int32Array]": true,
  "[object Uint32Array]": true,
  "[object Float16Array]": true,
  "[object Float32Array]": true,
  "[object Float64Array]": true,
  "[object BigInt64Array]": true,
  "[object BigUint64Array]": true
};
const URL_TAG = "[object URL]";
const toString2 = Object.prototype.toString;
function createEqualityComparator({ areArrayBuffersEqual: areArrayBuffersEqual2, areArraysEqual: areArraysEqual2, areDataViewsEqual: areDataViewsEqual2, areDatesEqual: areDatesEqual2, areErrorsEqual: areErrorsEqual2, areFunctionsEqual: areFunctionsEqual2, areMapsEqual: areMapsEqual2, areNumbersEqual: areNumbersEqual2, areObjectsEqual: areObjectsEqual2, arePrimitiveWrappersEqual: arePrimitiveWrappersEqual2, areRegExpsEqual: areRegExpsEqual2, areSetsEqual: areSetsEqual2, areTypedArraysEqual: areTypedArraysEqual2, areUrlsEqual: areUrlsEqual2, unknownTagComparators }) {
  return function comparator(a2, b, state) {
    if (a2 === b) {
      return true;
    }
    if (a2 == null || b == null) {
      return false;
    }
    const type = typeof a2;
    if (type !== typeof b) {
      return false;
    }
    if (type !== "object") {
      if (type === "number") {
        return areNumbersEqual2(a2, b, state);
      }
      if (type === "function") {
        return areFunctionsEqual2(a2, b, state);
      }
      return false;
    }
    const constructor = a2.constructor;
    if (constructor !== b.constructor) {
      return false;
    }
    if (constructor === Object) {
      return areObjectsEqual2(a2, b, state);
    }
    if (Array.isArray(a2)) {
      return areArraysEqual2(a2, b, state);
    }
    if (constructor === Date) {
      return areDatesEqual2(a2, b, state);
    }
    if (constructor === RegExp) {
      return areRegExpsEqual2(a2, b, state);
    }
    if (constructor === Map) {
      return areMapsEqual2(a2, b, state);
    }
    if (constructor === Set) {
      return areSetsEqual2(a2, b, state);
    }
    const tag = toString2.call(a2);
    if (tag === DATE_TAG) {
      return areDatesEqual2(a2, b, state);
    }
    if (tag === REG_EXP_TAG) {
      return areRegExpsEqual2(a2, b, state);
    }
    if (tag === MAP_TAG) {
      return areMapsEqual2(a2, b, state);
    }
    if (tag === SET_TAG) {
      return areSetsEqual2(a2, b, state);
    }
    if (tag === OBJECT_TAG) {
      return typeof a2.then !== "function" && typeof b.then !== "function" && areObjectsEqual2(a2, b, state);
    }
    if (tag === URL_TAG) {
      return areUrlsEqual2(a2, b, state);
    }
    if (tag === ERROR_TAG) {
      return areErrorsEqual2(a2, b, state);
    }
    if (tag === ARGUMENTS_TAG) {
      return areObjectsEqual2(a2, b, state);
    }
    if (TYPED_ARRAY_TAGS[tag]) {
      return areTypedArraysEqual2(a2, b, state);
    }
    if (tag === ARRAY_BUFFER_TAG) {
      return areArrayBuffersEqual2(a2, b, state);
    }
    if (tag === DATA_VIEW_TAG) {
      return areDataViewsEqual2(a2, b, state);
    }
    if (tag === BOOLEAN_TAG || tag === NUMBER_TAG || tag === STRING_TAG) {
      return arePrimitiveWrappersEqual2(a2, b, state);
    }
    if (unknownTagComparators) {
      let unknownTagComparator = unknownTagComparators[tag];
      if (!unknownTagComparator) {
        const shortTag = getShortTag(a2);
        if (shortTag) {
          unknownTagComparator = unknownTagComparators[shortTag];
        }
      }
      if (unknownTagComparator) {
        return unknownTagComparator(a2, b, state);
      }
    }
    return false;
  };
}
function createEqualityComparatorConfig({ circular, createCustomConfig, strict }) {
  let config2 = {
    areArrayBuffersEqual,
    areArraysEqual: strict ? areObjectsEqualStrict : areArraysEqual,
    areDataViewsEqual,
    areDatesEqual,
    areErrorsEqual,
    areFunctionsEqual,
    areMapsEqual: strict ? combineComparators(areMapsEqual, areObjectsEqualStrict) : areMapsEqual,
    areNumbersEqual,
    areObjectsEqual: strict ? areObjectsEqualStrict : areObjectsEqual,
    arePrimitiveWrappersEqual,
    areRegExpsEqual,
    areSetsEqual: strict ? combineComparators(areSetsEqual, areObjectsEqualStrict) : areSetsEqual,
    areTypedArraysEqual: strict ? combineComparators(areTypedArraysEqual, areObjectsEqualStrict) : areTypedArraysEqual,
    areUrlsEqual,
    unknownTagComparators: void 0
  };
  if (createCustomConfig) {
    config2 = Object.assign({}, config2, createCustomConfig(config2));
  }
  if (circular) {
    const areArraysEqual2 = createIsCircular(config2.areArraysEqual);
    const areMapsEqual2 = createIsCircular(config2.areMapsEqual);
    const areObjectsEqual2 = createIsCircular(config2.areObjectsEqual);
    const areSetsEqual2 = createIsCircular(config2.areSetsEqual);
    config2 = Object.assign({}, config2, {
      areArraysEqual: areArraysEqual2,
      areMapsEqual: areMapsEqual2,
      areObjectsEqual: areObjectsEqual2,
      areSetsEqual: areSetsEqual2
    });
  }
  return config2;
}
function createInternalEqualityComparator(compare) {
  return function(a2, b, _indexOrKeyA, _indexOrKeyB, _parentA, _parentB, state) {
    return compare(a2, b, state);
  };
}
function createIsEqual({ circular, comparator, createState, equals, strict }) {
  if (createState) {
    return function isEqual2(a2, b) {
      const { cache = circular ? /* @__PURE__ */ new WeakMap() : void 0, meta } = createState();
      return comparator(a2, b, {
        cache,
        equals,
        meta,
        strict
      });
    };
  }
  if (circular) {
    return function isEqual2(a2, b) {
      return comparator(a2, b, {
        cache: /* @__PURE__ */ new WeakMap(),
        equals,
        meta: void 0,
        strict
      });
    };
  }
  const state = {
    cache: void 0,
    equals,
    meta: void 0,
    strict
  };
  return function isEqual2(a2, b) {
    return comparator(a2, b, state);
  };
}
const deepEqual = createCustomEqual();
createCustomEqual({ strict: true });
createCustomEqual({ circular: true });
createCustomEqual({
  circular: true,
  strict: true
});
createCustomEqual({
  createInternalComparator: () => sameValueZeroEqual
});
createCustomEqual({
  strict: true,
  createInternalComparator: () => sameValueZeroEqual
});
createCustomEqual({
  circular: true,
  createInternalComparator: () => sameValueZeroEqual
});
createCustomEqual({
  circular: true,
  createInternalComparator: () => sameValueZeroEqual,
  strict: true
});
function createCustomEqual(options = {}) {
  const { circular = false, createInternalComparator: createCustomInternalComparator, createState, strict = false } = options;
  const config2 = createEqualityComparatorConfig(options);
  const comparator = createEqualityComparator(config2);
  const equals = createCustomInternalComparator ? createCustomInternalComparator(comparator) : createInternalEqualityComparator(comparator);
  return createIsEqual({ circular, comparator, createState, equals, strict });
}
function safeRequestAnimationFrame(callback) {
  if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(callback);
}
function setRafTimeout(callback) {
  var timeout = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var currTime = -1;
  var shouldUpdate = function shouldUpdate2(now2) {
    if (currTime < 0) {
      currTime = now2;
    }
    if (now2 - currTime > timeout) {
      callback(now2);
      currTime = -1;
    } else {
      safeRequestAnimationFrame(shouldUpdate2);
    }
  };
  requestAnimationFrame(shouldUpdate);
}
function _typeof$3(o) {
  "@babel/helpers - typeof";
  return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$3(o);
}
function _toArray(arr) {
  return _arrayWithHoles$2(arr) || _iterableToArray$3(arr) || _unsupportedIterableToArray$3(arr) || _nonIterableRest$2();
}
function _nonIterableRest$2() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$3(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray$3(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen);
}
function _arrayLikeToArray$3(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _iterableToArray$3(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithHoles$2(arr) {
  if (Array.isArray(arr)) return arr;
}
function createAnimateManager() {
  var currStyle = {};
  var handleChange = function handleChange2() {
    return null;
  };
  var shouldStop = false;
  var setStyle = function setStyle2(_style) {
    if (shouldStop) {
      return;
    }
    if (Array.isArray(_style)) {
      if (!_style.length) {
        return;
      }
      var styles = _style;
      var _styles = _toArray(styles), curr = _styles[0], restStyles = _styles.slice(1);
      if (typeof curr === "number") {
        setRafTimeout(setStyle2.bind(null, restStyles), curr);
        return;
      }
      setStyle2(curr);
      setRafTimeout(setStyle2.bind(null, restStyles));
      return;
    }
    if (_typeof$3(_style) === "object") {
      currStyle = _style;
      handleChange(currStyle);
    }
    if (typeof _style === "function") {
      _style();
    }
  };
  return {
    stop: function stop() {
      shouldStop = true;
    },
    start: function start(style) {
      shouldStop = false;
      setStyle(style);
    },
    subscribe: function subscribe(_handleChange) {
      handleChange = _handleChange;
      return function() {
        handleChange = function handleChange2() {
          return null;
        };
      };
    }
  };
}
function _typeof$2(o) {
  "@babel/helpers - typeof";
  return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$2(o);
}
function ownKeys$2(e, r2) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r2 && (o = o.filter(function(r22) {
      return Object.getOwnPropertyDescriptor(e, r22).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread$2(e) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var t = null != arguments[r2] ? arguments[r2] : {};
    r2 % 2 ? ownKeys$2(Object(t), true).forEach(function(r22) {
      _defineProperty$2(e, r22, t[r22]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function(r22) {
      Object.defineProperty(e, r22, Object.getOwnPropertyDescriptor(t, r22));
    });
  }
  return e;
}
function _defineProperty$2(obj, key, value) {
  key = _toPropertyKey$2(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$2(arg) {
  var key = _toPrimitive$2(arg, "string");
  return _typeof$2(key) === "symbol" ? key : String(key);
}
function _toPrimitive$2(input, hint) {
  if (_typeof$2(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint);
    if (_typeof$2(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
var getIntersectionKeys = function getIntersectionKeys2(preObj, nextObj) {
  return [Object.keys(preObj), Object.keys(nextObj)].reduce(function(a2, b) {
    return a2.filter(function(c2) {
      return b.includes(c2);
    });
  });
};
var identity2 = function identity22(param) {
  return param;
};
var getDashCase = function getDashCase2(name) {
  return name.replace(/([A-Z])/g, function(v) {
    return "-".concat(v.toLowerCase());
  });
};
var mapObject = function mapObject2(fn, obj) {
  return Object.keys(obj).reduce(function(res, key) {
    return _objectSpread$2(_objectSpread$2({}, res), {}, _defineProperty$2({}, key, fn(key, obj[key])));
  }, {});
};
var getTransitionVal = function getTransitionVal2(props, duration, easing) {
  return props.map(function(prop) {
    return "".concat(getDashCase(prop), " ").concat(duration, "ms ").concat(easing);
  }).join(",");
};
function _slicedToArray$1(arr, i) {
  return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _unsupportedIterableToArray$2(arr, i) || _nonIterableRest$1();
}
function _nonIterableRest$1() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArrayLimit$1(r2, l) {
  var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
  if (null != t) {
    var e, n, i, u, a2 = [], f = true, o = false;
    try {
      if (i = (t = t.call(r2)).next, 0 === l) ;
      else for (; !(f = (e = i.call(t)).done) && (a2.push(e.value), a2.length !== l); f = true) ;
    } catch (r3) {
      o = true, n = r3;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a2;
  }
}
function _arrayWithHoles$1(arr) {
  if (Array.isArray(arr)) return arr;
}
function _toConsumableArray$2(arr) {
  return _arrayWithoutHoles$2(arr) || _iterableToArray$2(arr) || _unsupportedIterableToArray$2(arr) || _nonIterableSpread$2();
}
function _nonIterableSpread$2() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$2(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray$2(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen);
}
function _iterableToArray$2(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithoutHoles$2(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray$2(arr);
}
function _arrayLikeToArray$2(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
var ACCURACY = 1e-4;
var cubicBezierFactor = function cubicBezierFactor2(c1, c2) {
  return [0, 3 * c1, 3 * c2 - 6 * c1, 3 * c1 - 3 * c2 + 1];
};
var multyTime = function multyTime2(params, t) {
  return params.map(function(param, i) {
    return param * Math.pow(t, i);
  }).reduce(function(pre, curr) {
    return pre + curr;
  });
};
var cubicBezier = function cubicBezier2(c1, c2) {
  return function(t) {
    var params = cubicBezierFactor(c1, c2);
    return multyTime(params, t);
  };
};
var derivativeCubicBezier = function derivativeCubicBezier2(c1, c2) {
  return function(t) {
    var params = cubicBezierFactor(c1, c2);
    var newParams = [].concat(_toConsumableArray$2(params.map(function(param, i) {
      return param * i;
    }).slice(1)), [0]);
    return multyTime(newParams, t);
  };
};
var configBezier = function configBezier2() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  var x1 = args[0], y1 = args[1], x2 = args[2], y2 = args[3];
  if (args.length === 1) {
    switch (args[0]) {
      case "linear":
        x1 = 0;
        y1 = 0;
        x2 = 1;
        y2 = 1;
        break;
      case "ease":
        x1 = 0.25;
        y1 = 0.1;
        x2 = 0.25;
        y2 = 1;
        break;
      case "ease-in":
        x1 = 0.42;
        y1 = 0;
        x2 = 1;
        y2 = 1;
        break;
      case "ease-out":
        x1 = 0.42;
        y1 = 0;
        x2 = 0.58;
        y2 = 1;
        break;
      case "ease-in-out":
        x1 = 0;
        y1 = 0;
        x2 = 0.58;
        y2 = 1;
        break;
      default: {
        var easing = args[0].split("(");
        if (easing[0] === "cubic-bezier" && easing[1].split(")")[0].split(",").length === 4) {
          var _easing$1$split$0$spl = easing[1].split(")")[0].split(",").map(function(x3) {
            return parseFloat(x3);
          });
          var _easing$1$split$0$spl2 = _slicedToArray$1(_easing$1$split$0$spl, 4);
          x1 = _easing$1$split$0$spl2[0];
          y1 = _easing$1$split$0$spl2[1];
          x2 = _easing$1$split$0$spl2[2];
          y2 = _easing$1$split$0$spl2[3];
        }
      }
    }
  }
  var curveX = cubicBezier(x1, x2);
  var curveY = cubicBezier(y1, y2);
  var derCurveX = derivativeCubicBezier(x1, x2);
  var rangeValue = function rangeValue2(value) {
    if (value > 1) {
      return 1;
    }
    if (value < 0) {
      return 0;
    }
    return value;
  };
  var bezier = function bezier2(_t) {
    var t = _t > 1 ? 1 : _t;
    var x3 = t;
    for (var i = 0; i < 8; ++i) {
      var evalT = curveX(x3) - t;
      var derVal = derCurveX(x3);
      if (Math.abs(evalT - t) < ACCURACY || derVal < ACCURACY) {
        return curveY(x3);
      }
      x3 = rangeValue(x3 - evalT / derVal);
    }
    return curveY(x3);
  };
  bezier.isStepper = false;
  return bezier;
};
var configSpring = function configSpring2() {
  var config2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var _config$stiff = config2.stiff, stiff = _config$stiff === void 0 ? 100 : _config$stiff, _config$damping = config2.damping, damping = _config$damping === void 0 ? 8 : _config$damping, _config$dt = config2.dt, dt = _config$dt === void 0 ? 17 : _config$dt;
  var stepper = function stepper2(currX, destX, currV) {
    var FSpring = -(currX - destX) * stiff;
    var FDamping = currV * damping;
    var newV = currV + (FSpring - FDamping) * dt / 1e3;
    var newX = currV * dt / 1e3 + currX;
    if (Math.abs(newX - destX) < ACCURACY && Math.abs(newV) < ACCURACY) {
      return [destX, 0];
    }
    return [newX, newV];
  };
  stepper.isStepper = true;
  stepper.dt = dt;
  return stepper;
};
var configEasing = function configEasing2() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }
  var easing = args[0];
  if (typeof easing === "string") {
    switch (easing) {
      case "ease":
      case "ease-in-out":
      case "ease-out":
      case "ease-in":
      case "linear":
        return configBezier(easing);
      case "spring":
        return configSpring();
      default:
        if (easing.split("(")[0] === "cubic-bezier") {
          return configBezier(easing);
        }
    }
  }
  if (typeof easing === "function") {
    return easing;
  }
  return null;
};
function _typeof$1(o) {
  "@babel/helpers - typeof";
  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$1(o);
}
function _toConsumableArray$1(arr) {
  return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _unsupportedIterableToArray$1(arr) || _nonIterableSpread$1();
}
function _nonIterableSpread$1() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArray$1(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithoutHoles$1(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray$1(arr);
}
function ownKeys$1(e, r2) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r2 && (o = o.filter(function(r3) {
      return Object.getOwnPropertyDescriptor(e, r3).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread$1(e) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var t = null != arguments[r2] ? arguments[r2] : {};
    r2 % 2 ? ownKeys$1(Object(t), true).forEach(function(r3) {
      _defineProperty$1(e, r3, t[r3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r3) {
      Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
    });
  }
  return e;
}
function _defineProperty$1(obj, key, value) {
  key = _toPropertyKey$1(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$1(arg) {
  var key = _toPrimitive$1(arg, "string");
  return _typeof$1(key) === "symbol" ? key : String(key);
}
function _toPrimitive$1(input, hint) {
  if (_typeof$1(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint);
    if (_typeof$1(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray$1(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray$1(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen);
}
function _arrayLikeToArray$1(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _iterableToArrayLimit(r2, l) {
  var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
  if (null != t) {
    var e, n, i, u, a2 = [], f = true, o = false;
    try {
      if (i = (t = t.call(r2)).next, 0 === l) ;
      else for (; !(f = (e = i.call(t)).done) && (a2.push(e.value), a2.length !== l); f = true) ;
    } catch (r3) {
      o = true, n = r3;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a2;
  }
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
var alpha = function alpha2(begin, end, k2) {
  return begin + (end - begin) * k2;
};
var needContinue = function needContinue2(_ref) {
  var from = _ref.from, to = _ref.to;
  return from !== to;
};
var calStepperVals = function calStepperVals2(easing, preVals, steps) {
  var nextStepVals = mapObject(function(key, val) {
    if (needContinue(val)) {
      var _easing = easing(val.from, val.to, val.velocity), _easing2 = _slicedToArray(_easing, 2), newX = _easing2[0], newV = _easing2[1];
      return _objectSpread$1(_objectSpread$1({}, val), {}, {
        from: newX,
        velocity: newV
      });
    }
    return val;
  }, preVals);
  if (steps < 1) {
    return mapObject(function(key, val) {
      if (needContinue(val)) {
        return _objectSpread$1(_objectSpread$1({}, val), {}, {
          velocity: alpha(val.velocity, nextStepVals[key].velocity, steps),
          from: alpha(val.from, nextStepVals[key].from, steps)
        });
      }
      return val;
    }, preVals);
  }
  return calStepperVals2(easing, nextStepVals, steps - 1);
};
const configUpdate = function(from, to, easing, duration, render) {
  var interKeys = getIntersectionKeys(from, to);
  var timingStyle = interKeys.reduce(function(res, key) {
    return _objectSpread$1(_objectSpread$1({}, res), {}, _defineProperty$1({}, key, [from[key], to[key]]));
  }, {});
  var stepperStyle = interKeys.reduce(function(res, key) {
    return _objectSpread$1(_objectSpread$1({}, res), {}, _defineProperty$1({}, key, {
      from: from[key],
      velocity: 0,
      to: to[key]
    }));
  }, {});
  var cafId = -1;
  var preTime;
  var beginTime;
  var update = function update2() {
    return null;
  };
  var getCurrStyle = function getCurrStyle2() {
    return mapObject(function(key, val) {
      return val.from;
    }, stepperStyle);
  };
  var shouldStopAnimation = function shouldStopAnimation2() {
    return !Object.values(stepperStyle).filter(needContinue).length;
  };
  var stepperUpdate = function stepperUpdate2(now2) {
    if (!preTime) {
      preTime = now2;
    }
    var deltaTime = now2 - preTime;
    var steps = deltaTime / easing.dt;
    stepperStyle = calStepperVals(easing, stepperStyle, steps);
    render(_objectSpread$1(_objectSpread$1(_objectSpread$1({}, from), to), getCurrStyle()));
    preTime = now2;
    if (!shouldStopAnimation()) {
      cafId = requestAnimationFrame(update);
    }
  };
  var timingUpdate = function timingUpdate2(now2) {
    if (!beginTime) {
      beginTime = now2;
    }
    var t = (now2 - beginTime) / duration;
    var currStyle = mapObject(function(key, val) {
      return alpha.apply(void 0, _toConsumableArray$1(val).concat([easing(t)]));
    }, timingStyle);
    render(_objectSpread$1(_objectSpread$1(_objectSpread$1({}, from), to), currStyle));
    if (t < 1) {
      cafId = requestAnimationFrame(update);
    } else {
      var finalStyle = mapObject(function(key, val) {
        return alpha.apply(void 0, _toConsumableArray$1(val).concat([easing(1)]));
      }, timingStyle);
      render(_objectSpread$1(_objectSpread$1(_objectSpread$1({}, from), to), finalStyle));
    }
  };
  update = easing.isStepper ? stepperUpdate : timingUpdate;
  return function() {
    requestAnimationFrame(update);
    return function() {
      cancelAnimationFrame(cafId);
    };
  };
};
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
var _excluded = ["children", "begin", "duration", "attributeName", "easing", "isActive", "steps", "from", "to", "canBegin", "onAnimationEnd", "shouldReAnimate", "onAnimationReStart"];
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function ownKeys(e, r2) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r2 && (o = o.filter(function(r3) {
      return Object.getOwnPropertyDescriptor(e, r3).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var t = null != arguments[r2] ? arguments[r2] : {};
    r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
      _defineProperty(e, r3, t[r3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
      Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
    });
  }
  return e;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}
function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== void 0) {
    var res = prim.call(input, hint);
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf(o, p);
}
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _possibleConstructorReturn(self2, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self2);
}
function _assertThisInitialized(self2) {
  if (self2 === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self2;
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf(o);
}
var Animate = /* @__PURE__ */ function(_PureComponent) {
  _inherits(Animate2, _PureComponent);
  var _super = _createSuper(Animate2);
  function Animate2(props, context) {
    var _this;
    _classCallCheck(this, Animate2);
    _this = _super.call(this, props, context);
    var _this$props = _this.props, isActive = _this$props.isActive, attributeName = _this$props.attributeName, from = _this$props.from, to = _this$props.to, steps = _this$props.steps, children = _this$props.children, duration = _this$props.duration;
    _this.handleStyleChange = _this.handleStyleChange.bind(_assertThisInitialized(_this));
    _this.changeStyle = _this.changeStyle.bind(_assertThisInitialized(_this));
    if (!isActive || duration <= 0) {
      _this.state = {
        style: {}
      };
      if (typeof children === "function") {
        _this.state = {
          style: to
        };
      }
      return _possibleConstructorReturn(_this);
    }
    if (steps && steps.length) {
      _this.state = {
        style: steps[0].style
      };
    } else if (from) {
      if (typeof children === "function") {
        _this.state = {
          style: from
        };
        return _possibleConstructorReturn(_this);
      }
      _this.state = {
        style: attributeName ? _defineProperty({}, attributeName, from) : from
      };
    } else {
      _this.state = {
        style: {}
      };
    }
    return _this;
  }
  _createClass(Animate2, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props2 = this.props, isActive = _this$props2.isActive, canBegin = _this$props2.canBegin;
      this.mounted = true;
      if (!isActive || !canBegin) {
        return;
      }
      this.runAnimation(this.props);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this$props3 = this.props, isActive = _this$props3.isActive, canBegin = _this$props3.canBegin, attributeName = _this$props3.attributeName, shouldReAnimate = _this$props3.shouldReAnimate, to = _this$props3.to, currentFrom = _this$props3.from;
      var style = this.state.style;
      if (!canBegin) {
        return;
      }
      if (!isActive) {
        var newState = {
          style: attributeName ? _defineProperty({}, attributeName, to) : to
        };
        if (this.state && style) {
          if (attributeName && style[attributeName] !== to || !attributeName && style !== to) {
            this.setState(newState);
          }
        }
        return;
      }
      if (deepEqual(prevProps.to, to) && prevProps.canBegin && prevProps.isActive) {
        return;
      }
      var isTriggered = !prevProps.canBegin || !prevProps.isActive;
      if (this.manager) {
        this.manager.stop();
      }
      if (this.stopJSAnimation) {
        this.stopJSAnimation();
      }
      var from = isTriggered || shouldReAnimate ? currentFrom : prevProps.to;
      if (this.state && style) {
        var _newState = {
          style: attributeName ? _defineProperty({}, attributeName, from) : from
        };
        if (attributeName && style[attributeName] !== from || !attributeName && style !== from) {
          this.setState(_newState);
        }
      }
      this.runAnimation(_objectSpread(_objectSpread({}, this.props), {}, {
        from,
        begin: 0
      }));
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.mounted = false;
      var onAnimationEnd2 = this.props.onAnimationEnd;
      if (this.unSubscribe) {
        this.unSubscribe();
      }
      if (this.manager) {
        this.manager.stop();
        this.manager = null;
      }
      if (this.stopJSAnimation) {
        this.stopJSAnimation();
      }
      if (onAnimationEnd2) {
        onAnimationEnd2();
      }
    }
  }, {
    key: "handleStyleChange",
    value: function handleStyleChange(style) {
      this.changeStyle(style);
    }
  }, {
    key: "changeStyle",
    value: function changeStyle(style) {
      if (this.mounted) {
        this.setState({
          style
        });
      }
    }
  }, {
    key: "runJSAnimation",
    value: function runJSAnimation(props) {
      var _this2 = this;
      var from = props.from, to = props.to, duration = props.duration, easing = props.easing, begin = props.begin, onAnimationEnd2 = props.onAnimationEnd, onAnimationStart2 = props.onAnimationStart;
      var startAnimation = configUpdate(from, to, configEasing(easing), duration, this.changeStyle);
      var finalStartAnimation = function finalStartAnimation2() {
        _this2.stopJSAnimation = startAnimation();
      };
      this.manager.start([onAnimationStart2, begin, finalStartAnimation, duration, onAnimationEnd2]);
    }
  }, {
    key: "runStepAnimation",
    value: function runStepAnimation(props) {
      var _this3 = this;
      var steps = props.steps, begin = props.begin, onAnimationStart2 = props.onAnimationStart;
      var _steps$ = steps[0], initialStyle = _steps$.style, _steps$$duration = _steps$.duration, initialTime = _steps$$duration === void 0 ? 0 : _steps$$duration;
      var addStyle = function addStyle2(sequence, nextItem, index) {
        if (index === 0) {
          return sequence;
        }
        var duration = nextItem.duration, _nextItem$easing = nextItem.easing, easing = _nextItem$easing === void 0 ? "ease" : _nextItem$easing, style = nextItem.style, nextProperties = nextItem.properties, onAnimationEnd2 = nextItem.onAnimationEnd;
        var preItem = index > 0 ? steps[index - 1] : nextItem;
        var properties = nextProperties || Object.keys(style);
        if (typeof easing === "function" || easing === "spring") {
          return [].concat(_toConsumableArray(sequence), [_this3.runJSAnimation.bind(_this3, {
            from: preItem.style,
            to: style,
            duration,
            easing
          }), duration]);
        }
        var transition = getTransitionVal(properties, duration, easing);
        var newStyle = _objectSpread(_objectSpread(_objectSpread({}, preItem.style), style), {}, {
          transition
        });
        return [].concat(_toConsumableArray(sequence), [newStyle, duration, onAnimationEnd2]).filter(identity2);
      };
      return this.manager.start([onAnimationStart2].concat(_toConsumableArray(steps.reduce(addStyle, [initialStyle, Math.max(initialTime, begin)])), [props.onAnimationEnd]));
    }
  }, {
    key: "runAnimation",
    value: function runAnimation(props) {
      if (!this.manager) {
        this.manager = createAnimateManager();
      }
      var begin = props.begin, duration = props.duration, attributeName = props.attributeName, propsTo = props.to, easing = props.easing, onAnimationStart2 = props.onAnimationStart, onAnimationEnd2 = props.onAnimationEnd, steps = props.steps, children = props.children;
      var manager = this.manager;
      this.unSubscribe = manager.subscribe(this.handleStyleChange);
      if (typeof easing === "function" || typeof children === "function" || easing === "spring") {
        this.runJSAnimation(props);
        return;
      }
      if (steps.length > 1) {
        this.runStepAnimation(props);
        return;
      }
      var to = attributeName ? _defineProperty({}, attributeName, propsTo) : propsTo;
      var transition = getTransitionVal(Object.keys(to), duration, easing);
      manager.start([onAnimationStart2, begin, _objectSpread(_objectSpread({}, to), {}, {
        transition
      }), duration, onAnimationEnd2]);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props4 = this.props, children = _this$props4.children;
      _this$props4.begin;
      var duration = _this$props4.duration;
      _this$props4.attributeName;
      _this$props4.easing;
      var isActive = _this$props4.isActive;
      _this$props4.steps;
      _this$props4.from;
      _this$props4.to;
      _this$props4.canBegin;
      _this$props4.onAnimationEnd;
      _this$props4.shouldReAnimate;
      _this$props4.onAnimationReStart;
      var others = _objectWithoutProperties(_this$props4, _excluded);
      var count = reactExports.Children.count(children);
      var stateStyle = this.state.style;
      if (typeof children === "function") {
        return children(stateStyle);
      }
      if (!isActive || count === 0 || duration <= 0) {
        return children;
      }
      var cloneContainer = function cloneContainer2(container) {
        var _container$props = container.props, _container$props$styl = _container$props.style, style = _container$props$styl === void 0 ? {} : _container$props$styl, className = _container$props.className;
        var res = /* @__PURE__ */ reactExports.cloneElement(container, _objectSpread(_objectSpread({}, others), {}, {
          style: _objectSpread(_objectSpread({}, style), stateStyle),
          className
        }));
        return res;
      };
      if (count === 1) {
        return cloneContainer(reactExports.Children.only(children));
      }
      return /* @__PURE__ */ React.createElement("div", null, reactExports.Children.map(children, function(child) {
        return cloneContainer(child);
      }));
    }
  }]);
  return Animate2;
}(reactExports.PureComponent);
Animate.displayName = "Animate";
Animate.defaultProps = {
  begin: 0,
  duration: 1e3,
  from: "",
  to: "",
  attributeName: "",
  easing: "ease",
  isActive: true,
  canBegin: true,
  steps: [],
  onAnimationEnd: function onAnimationEnd() {
  },
  onAnimationStart: function onAnimationStart() {
  }
};
Animate.propTypes = {
  from: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  to: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  attributeName: PropTypes.string,
  // animation duration
  duration: PropTypes.number,
  begin: PropTypes.number,
  easing: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  steps: PropTypes.arrayOf(PropTypes.shape({
    duration: PropTypes.number.isRequired,
    style: PropTypes.object.isRequired,
    easing: PropTypes.oneOfType([PropTypes.oneOf(["ease", "ease-in", "ease-out", "ease-in-out", "linear"]), PropTypes.func]),
    // transition css properties(dash case), optional
    properties: PropTypes.arrayOf("string"),
    onAnimationEnd: PropTypes.func
  })),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  isActive: PropTypes.bool,
  canBegin: PropTypes.bool,
  onAnimationEnd: PropTypes.func,
  // decide if it should reanimate with initial from style when props change
  shouldReAnimate: PropTypes.bool,
  onAnimationStart: PropTypes.func,
  onAnimationReStart: PropTypes.func
};
var baseExtremum$1 = _baseExtremum, baseGt = _baseGt, baseIteratee$6 = _baseIteratee;
function maxBy(array2, iteratee) {
  return array2 && array2.length ? baseExtremum$1(array2, baseIteratee$6(iteratee), baseGt) : void 0;
}
var maxBy_1 = maxBy;
const maxBy$1 = /* @__PURE__ */ getDefaultExportFromCjs(maxBy_1);
var baseExtremum = _baseExtremum, baseIteratee$5 = _baseIteratee, baseLt = _baseLt;
function minBy(array2, iteratee) {
  return array2 && array2.length ? baseExtremum(array2, baseIteratee$5(iteratee), baseLt) : void 0;
}
var minBy_1 = minBy;
const minBy$1 = /* @__PURE__ */ getDefaultExportFromCjs(minBy_1);
var overArg = _overArg;
var getPrototype$1 = overArg(Object.getPrototypeOf, Object);
var _getPrototype = getPrototype$1;
var baseGetTag$1 = _baseGetTag, getPrototype = _getPrototype, isObjectLike$1 = isObjectLike_1;
var objectTag = "[object Object]";
var funcProto = Function.prototype, objectProto = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function isPlainObject(value) {
  if (!isObjectLike$1(value) || baseGetTag$1(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
var isPlainObject_1 = isPlainObject;
const isPlainObject$1 = /* @__PURE__ */ getDefaultExportFromCjs(isPlainObject_1);
var baseGetTag = _baseGetTag, isObjectLike = isObjectLike_1;
var boolTag = "[object Boolean]";
function isBoolean(value) {
  return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
}
var isBoolean_1 = isBoolean;
const isBoolean$1 = /* @__PURE__ */ getDefaultExportFromCjs(isBoolean_1);
var nativeCeil = Math.ceil, nativeMax$1 = Math.max;
function baseRange$1(start, end, step, fromRight) {
  var index = -1, length = nativeMax$1(nativeCeil((end - start) / (step || 1)), 0), result = Array(length);
  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}
var _baseRange = baseRange$1;
var toNumber = toNumber_1;
var INFINITY = 1 / 0, MAX_INTEGER = 17976931348623157e292;
function toFinite$2(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign2 = value < 0 ? -1 : 1;
    return sign2 * MAX_INTEGER;
  }
  return value === value ? value : 0;
}
var toFinite_1 = toFinite$2;
var baseRange = _baseRange, isIterateeCall$2 = _isIterateeCall, toFinite$1 = toFinite_1;
function createRange$1(fromRight) {
  return function(start, end, step) {
    if (step && typeof step != "number" && isIterateeCall$2(start, end, step)) {
      end = step = void 0;
    }
    start = toFinite$1(start);
    if (end === void 0) {
      end = start;
      start = 0;
    } else {
      end = toFinite$1(end);
    }
    step = step === void 0 ? start < end ? 1 : -1 : toFinite$1(step);
    return baseRange(start, end, step, fromRight);
  };
}
var _createRange = createRange$1;
var createRange = _createRange;
var range2 = createRange();
var range_1 = range2;
const range$1 = /* @__PURE__ */ getDefaultExportFromCjs(range_1);
var baseEach$1 = _baseEach;
function baseSome$1(collection, predicate) {
  var result;
  baseEach$1(collection, function(value, index, collection2) {
    result = predicate(value, index, collection2);
    return !result;
  });
  return !!result;
}
var _baseSome = baseSome$1;
var arraySome = _arraySome, baseIteratee$4 = _baseIteratee, baseSome = _baseSome, isArray$1 = isArray_1, isIterateeCall$1 = _isIterateeCall;
function some(collection, predicate, guard) {
  var func = isArray$1(collection) ? arraySome : baseSome;
  if (guard && isIterateeCall$1(collection, predicate, guard)) {
    predicate = void 0;
  }
  return func(collection, baseIteratee$4(predicate));
}
var some_1 = some;
const some$1 = /* @__PURE__ */ getDefaultExportFromCjs(some_1);
var defineProperty = _defineProperty$3;
function baseAssignValue$1(object2, key, value) {
  if (key == "__proto__" && defineProperty) {
    defineProperty(object2, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object2[key] = value;
  }
}
var _baseAssignValue = baseAssignValue$1;
var baseAssignValue = _baseAssignValue, baseForOwn = _baseForOwn, baseIteratee$3 = _baseIteratee;
function mapValues(object2, iteratee) {
  var result = {};
  iteratee = baseIteratee$3(iteratee);
  baseForOwn(object2, function(value, key, object3) {
    baseAssignValue(result, key, iteratee(value, key, object3));
  });
  return result;
}
var mapValues_1 = mapValues;
const mapValues$1 = /* @__PURE__ */ getDefaultExportFromCjs(mapValues_1);
function arrayEvery$1(array2, predicate) {
  var index = -1, length = array2 == null ? 0 : array2.length;
  while (++index < length) {
    if (!predicate(array2[index], index, array2)) {
      return false;
    }
  }
  return true;
}
var _arrayEvery = arrayEvery$1;
var baseEach = _baseEach;
function baseEvery$1(collection, predicate) {
  var result = true;
  baseEach(collection, function(value, index, collection2) {
    result = !!predicate(value, index, collection2);
    return result;
  });
  return result;
}
var _baseEvery = baseEvery$1;
var arrayEvery = _arrayEvery, baseEvery = _baseEvery, baseIteratee$2 = _baseIteratee, isArray = isArray_1, isIterateeCall = _isIterateeCall;
function every(collection, predicate, guard) {
  var func = isArray(collection) ? arrayEvery : baseEvery;
  if (guard && isIterateeCall(collection, predicate, guard)) {
    predicate = void 0;
  }
  return func(collection, baseIteratee$2(predicate));
}
var every_1 = every;
const every$1 = /* @__PURE__ */ getDefaultExportFromCjs(every_1);
var baseIteratee$1 = _baseIteratee, isArrayLike = isArrayLike_1, keys = keys_1;
function createFind$1(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!isArrayLike(collection)) {
      var iteratee = baseIteratee$1(predicate);
      collection = keys(collection);
      predicate = function(key) {
        return iteratee(iterable[key], key, iterable);
      };
    }
    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : void 0;
  };
}
var _createFind = createFind$1;
var toFinite = toFinite_1;
function toInteger$1(value) {
  var result = toFinite(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
var toInteger_1 = toInteger$1;
var baseFindIndex = _baseFindIndex, baseIteratee = _baseIteratee, toInteger = toInteger_1;
var nativeMax = Math.max;
function findIndex$1(array2, predicate, fromIndex) {
  var length = array2 == null ? 0 : array2.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax(length + index, 0);
  }
  return baseFindIndex(array2, baseIteratee(predicate), index);
}
var findIndex_1 = findIndex$1;
var createFind = _createFind, findIndex = findIndex_1;
var find = createFind(findIndex);
var find_1 = find;
const find$1 = /* @__PURE__ */ getDefaultExportFromCjs(find_1);
var eventemitter3 = { exports: {} };
(function(module) {
  var has = Object.prototype.hasOwnProperty, prefix2 = "~";
  function Events() {
  }
  if (Object.create) {
    Events.prototype = /* @__PURE__ */ Object.create(null);
    if (!new Events().__proto__) prefix2 = false;
  }
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== "function") {
      throw new TypeError("The listener must be a function");
    }
    var listener = new EE(fn, context || emitter, once), evt = prefix2 ? prefix2 + event : event;
    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();
    else delete emitter._events[evt];
  }
  function EventEmitter2() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  EventEmitter2.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0) return names;
    for (name in events = this._events) {
      if (has.call(events, name)) names.push(prefix2 ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
  };
  EventEmitter2.prototype.listeners = function listeners(event) {
    var evt = prefix2 ? prefix2 + event : event, handlers = this._events[evt];
    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];
    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }
    return ee;
  };
  EventEmitter2.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix2 ? prefix2 + event : event, listeners = this._events[evt];
    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };
  EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix2 ? prefix2 + event : event;
    if (!this._events[evt]) return false;
    var listeners = this._events[evt], len = arguments.length, args, i;
    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }
      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length, j;
      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;
          default:
            if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
              args[j - 1] = arguments[j];
            }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }
    return true;
  };
  EventEmitter2.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  EventEmitter2.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix2 ? prefix2 + event : event;
    if (!this._events[evt]) return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
      else clearEvent(this, evt);
    }
    return this;
  };
  EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix2 ? prefix2 + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  };
  EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
  EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
  EventEmitter2.prefixed = prefix2;
  EventEmitter2.EventEmitter = EventEmitter2;
  {
    module.exports = EventEmitter2;
  }
})(eventemitter3);
var eventemitter3Exports = eventemitter3.exports;
const EventEmitter = /* @__PURE__ */ getDefaultExportFromCjs(eventemitter3Exports);
export {
  Animate as $,
  max$1 as A,
  getTickValuesFixedDomain as B,
  shapeStack as C,
  stackOrderNone as D,
  stackOffsetWiggle as E,
  stackOffsetSilhouette as F,
  stackOffsetNone as G,
  stackOffsetExpand as H,
  flatMap$1 as I,
  isEqual$1 as J,
  last$1 as K,
  shapeArea as L,
  shapeLine as M,
  stepBefore as N,
  stepAfter as O,
  curveStep as P,
  curveNatural as Q,
  monotoneY as R,
  Symbol$3 as S,
  monotoneX as T,
  curveLinear as U,
  curveLinearClosed as V,
  bumpY as W,
  bumpX as X,
  curveBasis as Y,
  curveBasisOpen as Z,
  curveBasisClosed as _,
  isNumber$2 as a,
  maxBy$1 as a0,
  minBy$1 as a1,
  isPlainObject$1 as a2,
  isBoolean$1 as a3,
  range$1 as a4,
  every$1 as a5,
  mapValues$1 as a6,
  memoize$3 as a7,
  find$1 as a8,
  some$1 as a9,
  EventEmitter as aa,
  schedulerExports as ab,
  invariant$1 as ac,
  joinPaths as ad,
  getResolveToMatches as ae,
  resolveTo as af,
  Action as ag,
  parsePath as ah,
  stripBasename as ai,
  matchRoutes as aj,
  isRouteErrorResponse as ak,
  createPath as al,
  createBrowserHistory as am,
  axios as an,
  isNan as b,
  isNil$1 as c,
  isObject$8 as d,
  isFunction$3 as e,
  clsx as f,
  get$2 as g,
  symbolTriangle as h,
  isString$1 as i,
  symbolStar as j,
  symbolSquare as k,
  symbolDiamond as l,
  symbolCross as m,
  symbolCircle as n,
  uniqBy$1 as o,
  sortBy$1 as p,
  invariant as q,
  band as r,
  symbolWye as s,
  throttle$1 as t,
  upperFirst$1 as u,
  linear as v,
  point as w,
  d3Scales as x,
  getNiceTickValues as y,
  min$1 as z
};
