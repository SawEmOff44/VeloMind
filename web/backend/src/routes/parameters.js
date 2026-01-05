import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's rider parameters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM rider_parameters
       WHERE user_id = $1
       ORDER BY is_active DESC, created_at DESC`,
      [req.user.id]
    );
    
    res.json({ parameters: result.rows });
  } catch (error) {
    console.error('Get parameters error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active parameters
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM rider_parameters
       WHERE user_id = $1 AND is_active = true
       ORDER BY updated_at DESC NULLS LAST, created_at DESC
       LIMIT 10`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      // Create default parameters
      const defaultResult = await query(
        `INSERT INTO rider_parameters (user_id, name, mass, cda, crr, drivetrain_loss, ftp, position, is_active)
         VALUES ($1, 'Default', 85.0, 0.32, 0.0045, 0.03, 250, 'hoods', true)
         RETURNING *`,
        [req.user.id]
      );
      return res.json({ parameters: defaultResult.rows[0] });
    }

    // If multiple profiles are marked active (possible from older versions), keep the newest
    // and deactivate the rest to prevent random selection.
    const active = result.rows[0];
    const extras = result.rows.slice(1);
    if (extras.length > 0) {
      const extraIds = extras.map((r) => r.id);
      await query(
        'UPDATE rider_parameters SET is_active = false WHERE user_id = $1 AND id = ANY($2::int[])',
        [req.user.id, extraIds]
      );
    }

    res.json({ parameters: active });
  } catch (error) {
    console.error('Get active parameters error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new parameters
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      mass,
      total_mass_kg,
      cda,
      frontal_area_m2,
      drag_coefficient,
      crr,
      rolling_resistance,
      drivetrainLoss,
      drivetrain_loss,
      ftp,
      position,
      isActive,
      is_active
    } = req.body;
    
    // Support both naming conventions
    const massValue = mass || total_mass_kg;
    const cdaValue = cda || (frontal_area_m2 && drag_coefficient ? frontal_area_m2 * drag_coefficient : null);
    const crrValue = crr || rolling_resistance;
    const drivetrainLossValue = drivetrainLoss || drivetrain_loss;
    const isActiveValue = isActive !== undefined ? isActive : is_active;
    const shouldBeActive = isActiveValue !== undefined ? !!isActiveValue : true;
    
    // If this is set as active, deactivate others
    if (shouldBeActive) {
      await query(
        'UPDATE rider_parameters SET is_active = false WHERE user_id = $1',
        [req.user.id]
      );
    }
    
    const result = await query(
      `INSERT INTO rider_parameters (
        user_id, name, mass, cda, crr, drivetrain_loss, ftp, position, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [req.user.id, name, massValue, cdaValue, crrValue, drivetrainLossValue, ftp, position || 'hoods', shouldBeActive]
    );
    
    res.status(201).json({ parameters: result.rows[0] });
  } catch (error) {
    console.error('Create parameters error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update parameters
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      mass,
      cda,
      crr,
      drivetrainLoss,
      drivetrain_loss,
      ftp,
      position,
      isActive,
      is_active
    } = req.body;

    const drivetrainLossValue = drivetrainLoss !== undefined ? drivetrainLoss : drivetrain_loss;

    // Preserve is_active unless explicitly provided
    const existingResult = await query(
      'SELECT is_active FROM rider_parameters WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parameters not found' });
    }

    const existingIsActive = !!existingResult.rows[0].is_active;
    const requestedIsActive = isActive !== undefined ? isActive : is_active;
    const isActiveValue = requestedIsActive !== undefined ? !!requestedIsActive : existingIsActive;
    
    // If this is set as active, deactivate others
    if (isActiveValue) {
      await query(
        'UPDATE rider_parameters SET is_active = false WHERE user_id = $1 AND id != $2',
        [req.user.id, req.params.id]
      );
    }
    
    const result = await query(
      `UPDATE rider_parameters
       SET name = $1, mass = $2, cda = $3, crr = $4, drivetrain_loss = $5,
           ftp = $6, position = $7, is_active = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [name, mass, cda, crr, drivetrainLossValue, ftp, position, isActiveValue, req.params.id, req.user.id]
    );
    
    res.json({ parameters: result.rows[0] });
  } catch (error) {
    console.error('Update parameters error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete parameters
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM rider_parameters WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parameters not found' });
    }
    
    res.json({ message: 'Parameters deleted successfully' });
  } catch (error) {
    console.error('Delete parameters error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Estimate parameters from session
router.post('/estimate', authenticateToken, async (req, res) => {
  try {
    const { sessionId, knownPower } = req.body;
    
    // Get session data
    const sessionResult = await query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get data points
    const dataPointsResult = await query(
      'SELECT * FROM session_data_points WHERE session_id = $1',
      [sessionId]
    );
    
    const points = dataPointsResult.rows;
    
    // Simple CdA estimation (if known power provided)
    if (knownPower && points.length > 0) {
      const avgSpeed = points.reduce((sum, p) => sum + parseFloat(p.speed), 0) / points.length;
      const avgGrade = points.reduce((sum, p) => sum + parseFloat(p.grade), 0) / points.length;
      const avgWind = points.reduce((sum, p) => sum + parseFloat(p.wind_speed), 0) / points.length;
      
      // Get current parameters
      const paramsResult = await query(
        'SELECT * FROM rider_parameters WHERE user_id = $1 AND is_active = true LIMIT 1',
        [req.user.id]
      );
      
      const currentParams = paramsResult.rows[0] || {
        mass: 85,
        crr: 0.0045,
        drivetrain_loss: 0.03
      };
      
      // Physics calculations
      const g = 9.81;
      const rho = 1.225;
      const vAir = avgSpeed + avgWind;
      const angleRad = Math.atan(avgGrade);
      
      const pRoll = currentParams.crr * currentParams.mass * g * avgSpeed * Math.cos(angleRad);
      const pGrav = currentParams.mass * g * avgGrade * avgSpeed;
      
      const mechanicalPower = knownPower * (1 - currentParams.drivetrain_loss);
      const pAero = mechanicalPower - pRoll - pGrav;
      
      const estimatedCda = (2 * pAero) / (rho * Math.pow(vAir, 3));
      
      res.json({
        estimatedCda: estimatedCda.toFixed(4),
        avgSpeed: avgSpeed.toFixed(2),
        avgGrade: (avgGrade * 100).toFixed(2),
        avgWind: avgWind.toFixed(2)
      });
    } else {
      res.status(400).json({ error: 'Known power value required for estimation' });
    }
  } catch (error) {
    console.error('Estimate parameters error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
