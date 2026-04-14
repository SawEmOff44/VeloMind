import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const backendDir = path.resolve(frontendDir, '..', 'backend');
const cleanupScript = path.resolve(backendDir, 'src/scripts/cleanup-smoke-users.js');

const mode = process.argv[2] === 'basic' ? 'basic' : 'rich';
const baseURL = 'http://localhost:3000';
const apiBase = 'http://localhost:3001/api';
const backendHealthUrl = 'http://localhost:3001/health';
const password = 'VelomindSmoke123!';
const email = `smoketest-script-${Date.now()}@example.com`;
const artifactDir = process.env.SMOKE_ARTIFACT_DIR
  ? path.resolve(process.env.SMOKE_ARTIFACT_DIR)
  : fs.mkdtempSync(path.join(os.tmpdir(), 'velomind-smoke-'));

const consoleErrors = [];
const pageErrors = [];
const apiErrors = [];
const visited = [];

fs.mkdirSync(artifactDir, { recursive: true });

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function nodeCommand() {
  return process.execPath;
}

function appendLog(tail, chunk) {
  const lines = chunk.toString().split(/\r?\n/).filter(Boolean);
  tail.push(...lines);
  if (tail.length > 40) {
    tail.splice(0, tail.length - 40);
  }
}

function startProcess(label, command, args, cwd, extraEnv = {}) {
  const logTail = [];
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', (chunk) => appendLog(logTail, chunk));
  child.stderr.on('data', (chunk) => appendLog(logTail, chunk));

  return { label, child, logTail };
}

async function stopProcess(proc) {
  if (!proc?.child || proc.child.exitCode !== null) return;

  proc.child.kill('SIGINT');
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      proc.child.kill('SIGKILL');
      resolve();
    }, 5000);

    proc.child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function waitForUrl(url, proc, timeoutMs = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (proc.child.exitCode !== null) {
      throw new Error(`${proc.label} exited before becoming ready:\n${proc.logTail.join('\n')}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // keep polling
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`${proc.label} did not become ready in time:\n${proc.logTail.join('\n')}`);
}

async function capture(page, name) {
  await page.screenshot({
    path: path.join(artifactDir, `${name}.png`),
    fullPage: true
  });
}

async function visitExpect(page, routePath, expectedText, screenshotName) {
  await page.goto(`${baseURL}${routePath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.getByText(expectedText, { exact: false }).first().waitFor({ timeout: 20000 });
  await capture(page, screenshotName);
  visited.push({
    path: routePath,
    expectedText,
    screenshot: path.join(artifactDir, `${screenshotName}.png`)
  });
}

function appApiError(url) {
  return url.startsWith(`${baseURL}/api/`) || url.startsWith(`${apiBase}/`);
}

function buildGpxBuffer(routeName, { latStart, lonStart, latStep, lonStep, elevationBase, elevationStep }) {
  const points = [];
  for (let i = 0; i < 80; i += 1) {
    const lat = latStart + (i * latStep);
    const lon = lonStart + (i * lonStep);
    const elevation = elevationBase + (i * elevationStep) + ((i % 6) * 0.8);
    points.push(
      `      <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"><ele>${elevation.toFixed(1)}</ele></trkpt>`
    );
  }

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VeloMind Smoke" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${routeName}</name>
    <trkseg>
${points.join('\n')}
    </trkseg>
  </trk>
</gpx>`);
}

async function cleanupSmokeUser(targetEmail) {
  const proc = spawn(nodeCommand(), [cleanupScript, targetEmail], {
    cwd: backendDir,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  proc.stdout.on('data', (chunk) => { output += chunk.toString(); });
  proc.stderr.on('data', (chunk) => { output += chunk.toString(); });

  await new Promise((resolve, reject) => {
    proc.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(output || 'cleanup failed'));
    });
  });
}

async function register(page) {
  await page.goto(`${baseURL}/register`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.getByRole('heading', { name: /create your account/i }).waitFor({ timeout: 15000 });

  await page.locator('#name').fill('Smoke Script');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);

  await Promise.all([
    page.waitForURL('**/dashboard', { timeout: 15000 }),
    page.getByRole('button', { name: /sign up/i }).click()
  ]);

  await page.getByText(/welcome back/i).first().waitFor({ timeout: 15000 });
  await capture(page, '01-dashboard');
  visited.push({
    path: '/dashboard',
    expectedText: 'Welcome back',
    screenshot: path.join(artifactDir, '01-dashboard.png')
  });
}

async function runBasicChecks(page) {
  await visitExpect(page, '/analytics', 'Analytics', '02-analytics');
  await visitExpect(page, '/routes', 'Routes', '03-routes');
  await visitExpect(page, '/sessions', 'Sessions', '04-sessions');
  await visitExpect(page, '/settings', 'Settings', '05-settings');
  await visitExpect(page, '/parameters', 'Rider Parameters', '06-parameters');

  await Promise.all([
    page.waitForURL('**/', { timeout: 15000 }),
    page.getByRole('button', { name: /logout/i }).click()
  ]);
  await page.getByText(/train smarter with/i).first().waitFor({ timeout: 15000 });
  await capture(page, '07-logged-out');
  visited.push({
    path: '/',
    expectedText: 'Train Smarter with',
    screenshot: path.join(artifactDir, '07-logged-out.png')
  });

  await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /sign in to your account/i }).waitFor({ timeout: 15000 });
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  await Promise.all([
    page.waitForURL('**/dashboard', { timeout: 15000 }),
    page.getByRole('button', { name: /^sign in$/i }).click()
  ]);

  await page.getByText(/welcome back/i).first().waitFor({ timeout: 15000 });
  await capture(page, '08-login-return');
  visited.push({
    path: '/dashboard',
    expectedText: 'Welcome back',
    screenshot: path.join(artifactDir, '08-login-return.png')
  });
}

async function runRichChecks(page) {
  const routeAFileName = `smoke-route-a-${Date.now()}.gpx`;
  const routeBFileName = `smoke-route-b-${Date.now()}.gpx`;
  const routeAName = routeAFileName.replace(/\.gpx$/, '');
  const routeBName = routeBFileName.replace(/\.gpx$/, '');
  const routeABuffer = buildGpxBuffer(routeAName, {
    latStart: 37.7749,
    lonStart: -122.4194,
    latStep: 0.00012,
    lonStep: 0.00018,
    elevationBase: 15,
    elevationStep: 0.9
  });
  const routeBBuffer = buildGpxBuffer(routeBName, {
    latStart: 37.7685,
    lonStart: -122.431,
    latStep: 0.0001,
    lonStep: 0.00015,
    elevationBase: 22,
    elevationStep: 0.6
  });

  await page.goto(`${baseURL}/routes`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /^routes$/i }).waitFor({ timeout: 15000 });

  await page.locator('#file-upload').setInputFiles({
    name: routeAFileName,
    mimeType: 'application/gpx+xml',
    buffer: routeABuffer
  });
  await page.getByText(routeAName, { exact: false }).waitFor({ timeout: 20000 });

  await page.locator('#file-upload').setInputFiles({
    name: routeBFileName,
    mimeType: 'application/gpx+xml',
    buffer: routeBBuffer
  });
  await page.getByText(routeBName, { exact: false }).waitFor({ timeout: 20000 });
  await capture(page, '09-routes-uploaded');
  visited.push({
    path: '/routes',
    expectedText: routeBName,
    screenshot: path.join(artifactDir, '09-routes-uploaded.png')
  });

  const seeded = await page.evaluate(async ({ routeAName, routeBName }) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const routesRes = await fetch('/api/gpx', { headers });
    const routesPayload = await routesRes.json();
    const routes = routesPayload.routes || [];

    const routeA = routes.find((route) => route.name === routeAName);
    const routeB = routes.find((route) => route.name === routeBName);
    if (!routeA || !routeB) {
      throw new Error('Uploaded routes were not found');
    }

    const routeDetailRes = await fetch(`/api/gpx/${routeA.id}`, { headers });
    const routeDetail = await routeDetailRes.json();
    const points = Array.isArray(routeDetail.points) ? routeDetail.points : [];
    if (points.length < 10) {
      throw new Error('Route detail did not include enough points');
    }

    const start = new Date('2026-04-14T15:00:00Z');
    const dataPoints = points.slice(0, 80).map((point, index, arr) => {
      const prev = arr[Math.max(0, index - 1)];
      const distance = Number(point.distance || 0);
      const prevDistance = Number(prev.distance || 0);
      const distanceDelta = Math.max(0, distance - prevDistance);
      const elevation = Number(point.elevation ?? point.altitude ?? 0);
      const prevElevation = Number(prev.elevation ?? prev.altitude ?? elevation);
      const grade = distanceDelta > 0 ? (elevation - prevElevation) / distanceDelta : 0;

      return {
        timestamp: new Date(start.getTime() + index * 5000).toISOString(),
        latitude: point.latitude,
        longitude: point.longitude,
        distance,
        altitude: elevation,
        speed: 8.5 + ((index % 6) * 0.25),
        cadence: 88 + (index % 5),
        heartRate: 145 + (index % 8),
        power: 215 + ((index % 7) * 6),
        grade,
        windSpeed: 1.5,
        windDirection: 180
      };
    });

    const totalDuration = (dataPoints.length - 1) * 5;
    const average = (key) => dataPoints.reduce((sum, point) => sum + point[key], 0) / dataPoints.length;
    const sessionPayload = {
      routeId: routeA.id,
      name: 'Browser Smoke Session',
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() + totalDuration * 1000).toISOString(),
      duration: totalDuration,
      distance: Number(dataPoints.at(-1)?.distance || routeA.total_distance || 0),
      averagePower: average('power'),
      normalizedPower: average('power') + 12,
      averageSpeed: average('speed'),
      averageCadence: average('cadence'),
      averageHeartRate: average('heartRate'),
      totalElevationGain: Number(routeA.total_elevation_gain || 0),
      tss: 68,
      intensityFactor: 0.87,
      dataPoints
    };

    const createSessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionPayload)
    });

    const createSessionPayload = await createSessionRes.json();
    if (!createSessionRes.ok) {
      throw new Error(createSessionPayload?.error || 'Failed to create session');
    }

    return {
      routeAId: routeA.id,
      routeBId: routeB.id,
      routeAName: routeA.name,
      routeBName: routeB.name,
      sessionId: createSessionPayload.session.id
    };
  }, { routeAName, routeBName });

  await page.goto(`${baseURL}/routes/${seeded.routeAId}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: seeded.routeAName }).waitFor({ timeout: 20000 });
  await page.getByText('Route Map', { exact: false }).waitFor({ timeout: 20000 });
  await page.getByText('Elevation Profile', { exact: false }).waitFor({ timeout: 20000 });
  await capture(page, '10-route-detail');
  visited.push({
    path: `/routes/${seeded.routeAId}`,
    expectedText: 'Route Map',
    screenshot: path.join(artifactDir, '10-route-detail.png')
  });

  await page.getByRole('button', { name: /reverse route|normal direction/i }).click();
  await page.getByText('Reversed Direction', { exact: false }).waitFor({ timeout: 15000 });
  await capture(page, '11-route-detail-reversed');
  visited.push({
    path: `/routes/${seeded.routeAId}`,
    expectedText: 'Reversed Direction',
    screenshot: path.join(artifactDir, '11-route-detail-reversed.png')
  });

  await page.goto(`${baseURL}/routes/compare?ids=${seeded.routeAId},${seeded.routeBId}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /route comparison/i }).waitFor({ timeout: 20000 });
  await page.getByText(/elevation profile comparison/i).waitFor({ timeout: 20000 });
  await capture(page, '12-route-comparison');
  visited.push({
    path: `/routes/compare?ids=${seeded.routeAId},${seeded.routeBId}`,
    expectedText: 'Elevation Profile Comparison',
    screenshot: path.join(artifactDir, '12-route-comparison.png')
  });

  await page.goto(`${baseURL}/sessions/${seeded.sessionId}`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Browser Smoke Session' }).waitFor({ timeout: 20000 });
  await page.getByText('Power Curve', { exact: false }).waitFor({ timeout: 20000 });
  await page.getByText('Elevation Profile', { exact: false }).waitFor({ timeout: 20000 });
  await capture(page, '13-session-detail');
  visited.push({
    path: `/sessions/${seeded.sessionId}`,
    expectedText: 'Power Curve',
    screenshot: path.join(artifactDir, '13-session-detail.png')
  });

  await page.goto(`${baseURL}/sessions`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /^sessions$/i }).waitFor({ timeout: 15000 });
  await page.getByRole('link', { name: 'Browser Smoke Session' }).first().waitFor({ timeout: 15000 });
  await capture(page, '14-sessions-list');
  visited.push({
    path: '/sessions',
    expectedText: 'Browser Smoke Session',
    screenshot: path.join(artifactDir, '14-sessions-list.png')
  });
}

async function main() {
  const backend = startProcess('backend', npmCommand(), ['start'], backendDir, {
    NODE_ENV: 'development',
    PORT: '3001'
  });
  const frontend = startProcess('frontend', npmCommand(), ['run', 'dev', '--', '--host', '127.0.0.1'], frontendDir, {
    VITE_API_BASE: apiBase
  });

  const browser = await chromium.launch({ headless: process.env.SMOKE_HEADFUL !== '1' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  page.on('response', async (response) => {
    if (response.status() < 400 || !appApiError(response.url())) return;
    let body = '';
    try {
      body = await response.text();
    } catch {
      body = '<unavailable>';
    }
    apiErrors.push({
      url: response.url(),
      status: response.status(),
      body
    });
  });

  let result;

  try {
    await waitForUrl(backendHealthUrl, backend, 30000);
    await waitForUrl(baseURL, frontend, 30000);

    await register(page);
    await runBasicChecks(page);

    if (mode === 'rich') {
      await runRichChecks(page);
    }

    result = {
      ok: consoleErrors.length === 0 && pageErrors.length === 0 && apiErrors.length === 0,
      mode,
      email,
      artifactDir,
      visited,
      consoleErrors,
      pageErrors,
      apiErrors
    };
  } catch (error) {
    await capture(page, 'failure').catch(() => {});
    result = {
      ok: false,
      mode,
      email,
      artifactDir,
      visited,
      consoleErrors,
      pageErrors,
      apiErrors,
      failure: error.message,
      screenshot: path.join(artifactDir, 'failure.png'),
      currentURL: page.url(),
      backendLogTail: backend.logTail,
      frontendLogTail: frontend.logTail
    };
  } finally {
    await browser.close().catch(() => {});
    await Promise.allSettled([
      stopProcess(frontend),
      stopProcess(backend),
      cleanupSmokeUser(email)
    ]);
  }

  fs.writeFileSync(
    path.join(artifactDir, 'result.json'),
    JSON.stringify(result, null, 2)
  );

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exitCode = 1;
  }
}

await main();
