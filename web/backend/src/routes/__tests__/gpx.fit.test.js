import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { inferSourceFormat, isRouteParseError, looksLikeFitFile, mapFitCoursePoint, parseFIT } from '../gpx.js';

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

  test('recognizes common FIT mime types during source format inference', () => {
    expect(inferSourceFormat('route.fit', 'application/vnd.ant.fit')).toBe('fit');
    expect(inferSourceFormat('route.fit', 'application/fit')).toBe('fit');
    expect(inferSourceFormat('route.fit', 'application/x-fit')).toBe('fit');
    expect(inferSourceFormat('route.fit', 'application/x-garmin-fit')).toBe('fit');
  });

  test('recognizes FIT files from binary signature even without extension metadata', () => {
    const fixturePath = path.join(__dirname, '..', '__fixtures__', 'sample-course.fit');
    const fitBuffer = fs.readFileSync(fixturePath);

    expect(inferSourceFormat('route', '')).toBe('gpx');
    expect(looksLikeFitFile(fitBuffer)).toBe(true);
    expect(looksLikeFitFile(Buffer.from('<gpx></gpx>', 'utf8'))).toBe(false);
  });

  test('maps Garmin support and climb course points to intuitive waypoint types', () => {
    expect(mapFitCoursePoint(29, null)).toEqual({ type: 'rest', label: 'Rest Area' });
    expect(mapFitCoursePoint(28, 'Aid Station 1')).toEqual({ type: 'rest', label: 'Aid Station 1' });
    expect(mapFitCoursePoint(10, null)).toEqual({ type: 'steep', label: 'Easy Climb' });
    expect(mapFitCoursePoint(14, null)).toEqual({ type: 'steep', label: 'Epic Climb' });
    expect(mapFitCoursePoint(0, 'Water stop at mile 42')).toEqual({ type: 'water', label: 'Water stop at mile 42' });
  });

  test('classifies internal FIT parser failures as upload parse errors', () => {
    expect(isRouteParseError(new Error('FIT data references missing definition'))).toBe(true);
    expect(isRouteParseError(new Error('Truncated FIT data message'))).toBe(true);
    expect(isRouteParseError(new Error('Unexpected database failure'))).toBe(false);
  });
});
