import fetch from 'node-fetch';

const sessionId = 12; // FTP Test session
const apiUrl = 'https://velomind-backend.vercel.app'; // Your deployed backend
const token = process.env.AUTH_TOKEN; // You'll need to provide this

if (!token) {
  console.error('Please set AUTH_TOKEN environment variable');
  process.exit(1);
}

async function syncStreams() {
  try {
    console.log(`Syncing streams for session ${sessionId}...`);
    const response = await fetch(`${apiUrl}/api/strava/sync-streams/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Success! Synced', data.dataPoints, 'data points');
      console.log('Normalized Power:', data.normalizedPower, 'W');
    } else {
      console.error('❌ Failed:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

syncStreams();
