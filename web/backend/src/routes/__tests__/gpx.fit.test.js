import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseFIT } from '../gpx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('FIT route parsing', () => {
  test('parses route points and course-point waypoints from fixture', () => {
    const fixturePath = path.join(__dirname, '..', '__fixtures__', 'sample-course.fit');
    const fitBuffer = fs.readFileSync(fixturePath);

    const parsed = parseFIT(fitBuffer);

    expect(parsed.pointCount).toBe(2);
    expect(parsed.points).toHaveLength(2);
    expect(parsed.totalDistance).toBeGreaterThan(100);
    expect(parsed.totalDistance).toBeLessThan(200);
    expect(parsed.totalElevationGain).toBe(5);

    expect(parsed.points[0].latitude).toBeCloseTo(37.7749, 4);
    expect(parsed.points[0].longitude).toBeCloseTo(-122.4194, 4);
    expect(parsed.points[1].latitude).toBeCloseTo(37.775, 4);
    expect(parsed.points[1].longitude).toBeCloseTo(-122.418, 4);

    expect(parsed.waypoints).toHaveLength(1);
    expect(parsed.waypoints[0].type).toBe('turn');
    expect(parsed.waypoints[0].label).toBe('Left turn');
    expect(parsed.waypoints[0].distanceFromStart).toBeCloseTo(120, 2);
  });
});
