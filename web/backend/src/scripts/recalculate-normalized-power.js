import { query } from '../db.js';

// Helper function to calculate normalized power from power array
function calculateNormalizedPower(powerData) {
  if (!powerData || powerData.length < 30) {
    return null;
  }
  
  // Calculate 30-second rolling average
  const rollingAvg = [];
  for (let i = 0; i < powerData.length; i++) {
    const start = Math.max(0, i - 29);
    const window = powerData.slice(start, i + 1);
    const avg = window.reduce((sum, p) => sum + (p || 0), 0) / window.length;
    rollingAvg.push(avg);
  }
  
  // Calculate 4th root of average of 4th power
  const sumFourthPower = rollingAvg.reduce((sum, p) => sum + Math.pow(p, 4), 0);
  const avgFourthPower = sumFourthPower / rollingAvg.length;
  const normalizedPower = Math.pow(avgFourthPower, 0.25);
  
  return normalizedPower;
}

async function recalculateNormalizedPower() {
  try {
    console.log('Fetching sessions with power data but missing normalized power...');
    
    // Get all sessions that have power data points but missing normalized_power
    const sessionsResult = await query(`
      SELECT DISTINCT s.id, s.name
      FROM sessions s
      INNER JOIN session_data_points sdp ON s.id = sdp.session_id
      WHERE sdp.power IS NOT NULL
        AND (s.normalized_power IS NULL OR s.max_heart_rate IS NULL OR s.max_cadence IS NULL)
      ORDER BY s.id
    `);
    
    console.log(`Found ${sessionsResult.rows.length} sessions to process`);
    
    let updated = 0;
    
    for (const session of sessionsResult.rows) {
      try {
        // Get power, heart rate, and cadence data for this session
        const dataResult = await query(`
          SELECT power, heart_rate, cadence
          FROM session_data_points
          WHERE session_id = $1
          ORDER BY timestamp
        `, [session.id]);
        
        const powerData = dataResult.rows
          .map(row => parseFloat(row.power))
          .filter(p => p && !isNaN(p));
        
        const heartRateData = dataResult.rows
          .map(row => parseInt(row.heart_rate))
          .filter(hr => hr && !isNaN(hr));
        
        const cadenceData = dataResult.rows
          .map(row => parseInt(row.cadence))
          .filter(c => c && !isNaN(c));
        
        // Calculate metrics
        const normalizedPower = calculateNormalizedPower(powerData);
        const maxHeartRate = heartRateData.length > 0 ? Math.max(...heartRateData) : null;
        const maxCadence = cadenceData.length > 0 ? Math.max(...cadenceData) : null;
        
        // Update session
        await query(`
          UPDATE sessions
          SET normalized_power = $1,
              max_heart_rate = $2,
              max_cadence = $3
          WHERE id = $4
        `, [normalizedPower, maxHeartRate, maxCadence, session.id]);
        
        console.log(`✓ Updated session ${session.id}: ${session.name}`);
        console.log(`  NP: ${normalizedPower ? Math.round(normalizedPower) : 'N/A'} W, Max HR: ${maxHeartRate || 'N/A'}, Max Cadence: ${maxCadence || 'N/A'}`);
        updated++;
      } catch (error) {
        console.error(`✗ Failed to update session ${session.id}:`, error.message);
      }
    }
    
    console.log(`\nCompleted! Updated ${updated} of ${sessionsResult.rows.length} sessions`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

recalculateNormalizedPower();
