import React from 'react';
import { 
  ExclamationTriangleIcon, 
  BoltIcon,
  CloudIcon,
  FireIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

export default function IntelligenceDashboard({ rideData, intelligenceData }) {
  if (!intelligenceData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">No intelligence data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Alerts */}
      {intelligenceData.alerts && intelligenceData.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
          {intelligenceData.alerts.map((alert, idx) => (
            <AlertBanner key={idx} alert={alert} />
          ))}
        </div>
      )}

      {/* Intelligence Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Environmental Load Index */}
        <MetricCard
          icon={<CloudIcon className="w-6 h-6" />}
          title="Environmental Load"
          value={`+${intelligenceData.environmentalLoad?.toFixed(1) || 0}%`}
          subtitle="effort cost"
          color="orange"
        />

        {/* Effort Budget */}
        <MetricCard
          icon={<BoltIcon className="w-6 h-6" />}
          title="Effort Budget"
          value={`${intelligenceData.effortBudget?.toFixed(0) || 100}%`}
          subtitle="remaining"
          color={getBudgetColor(intelligenceData.effortBudget)}
          progress={intelligenceData.effortBudget}
        />

        {/* TSS (Training Stress Score) */}
        <MetricCard
          icon={<FireIcon className="w-6 h-6" />}
          title="Training Stress"
          value={intelligenceData.tss?.toFixed(0) || 0}
          subtitle="TSS"
          color="red"
        />

        {/* Calories Burned */}
        <MetricCard
          icon={<BeakerIcon className="w-6 h-6" />}
          title="Calories Burned"
          value={intelligenceData.caloriesBurned?.toFixed(0) || 0}
          subtitle="kcal"
          color="purple"
        />

        {/* Predicted Speed */}
        {intelligenceData.predictedSpeed && (
          <div className="col-span-1 md:col-span-2 bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CloudIcon className="w-6 h-6 text-cyan-400" />
              <div>
                <p className="text-sm text-gray-400">Wind-Aware Prediction</p>
                <p className="text-xl font-bold text-cyan-400">
                  ~{intelligenceData.predictedSpeed.speed.toFixed(1)} mph
                </p>
                <p className="text-sm text-gray-500">
                  ({intelligenceData.predictedSpeed.condition})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Climb */}
        {intelligenceData.upcomingClimb && (
          <div className="col-span-1 md:col-span-2 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-400 transform rotate-45" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3l7 7-7 7V3z" />
              </svg>
              <div>
                <p className="text-sm text-gray-400">Upcoming Climb</p>
                <p className="text-lg font-semibold text-red-400">
                  {intelligenceData.upcomingClimb.distance.toFixed(1)} mi @ {intelligenceData.upcomingClimb.grade.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500">
                  Recommended: {intelligenceData.upcomingClimb.recommendedPower} watts
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fatigue Analysis */}
      {intelligenceData.fatigueDrift && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">Fatigue Detected</p>
              <p className="text-sm text-gray-300">{intelligenceData.fatigueDrift.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                Efficiency drop: {(intelligenceData.fatigueDrift.efficiencyDrop * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FTP Context */}
      {rideData?.ftp && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Power Zones (based on FTP: {rideData.ftp}W)</h4>
          <div className="space-y-2">
            <PowerZone zone="Recovery" range={`< ${Math.round(rideData.ftp * 0.55)}W`} color="gray" />
            <PowerZone zone="Endurance" range={`${Math.round(rideData.ftp * 0.55)}-${Math.round(rideData.ftp * 0.75)}W`} color="blue" />
            <PowerZone zone="Tempo" range={`${Math.round(rideData.ftp * 0.75)}-${Math.round(rideData.ftp * 0.90)}W`} color="green" />
            <PowerZone zone="Threshold" range={`${Math.round(rideData.ftp * 0.90)}-${Math.round(rideData.ftp * 1.05)}W`} color="yellow" />
            <PowerZone zone="VO2 Max" range={`${Math.round(rideData.ftp * 1.05)}-${Math.round(rideData.ftp * 1.20)}W`} color="orange" />
            <PowerZone zone="Anaerobic" range={`> ${Math.round(rideData.ftp * 1.20)}W`} color="red" />
          </div>
        </div>
      )}
    </div>
  );
}

function AlertBanner({ alert }) {
  const severityColors = {
    critical: 'bg-red-900/30 border-red-500',
    high: 'bg-orange-900/30 border-orange-500',
    medium: 'bg-yellow-900/30 border-yellow-500',
    low: 'bg-blue-900/30 border-blue-500'
  };

  const severityIcons = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵'
  };

  return (
    <div className={`${severityColors[alert.severity] || severityColors.medium} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{severityIcons[alert.severity] || '⚠️'}</span>
        <div className="flex-1">
          <p className="text-white font-medium">{alert.message}</p>
          {alert.details && (
            <p className="text-sm text-gray-400 mt-1">{alert.details}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color, progress }) {
  const colorClasses = {
    orange: 'text-orange-400 bg-orange-900/20 border-orange-500/30',
    green: 'text-green-400 bg-green-900/20 border-green-500/30',
    red: 'text-red-400 bg-red-900/20 border-red-500/30',
    yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-500/30',
    blue: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
    gray: 'text-gray-400 bg-gray-900/20 border-gray-500/30'
  };

  return (
    <div className={`${colorClasses[color] || colorClasses.gray} border rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-2">
        <div className={colorClasses[color]}>{icon}</div>
      </div>
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]}`}>{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
      
      {progress !== undefined && (
        <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function PowerZone({ zone, range, color }) {
  const colorClasses = {
    gray: 'bg-gray-600',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${colorClasses[color]}`} />
      <span className="text-sm text-gray-300 flex-1">{zone}</span>
      <span className="text-sm text-gray-500">{range}</span>
    </div>
  );
}

function getBudgetColor(budget) {
  if (budget > 60) return 'green';
  if (budget > 30) return 'yellow';
  return 'red';
}
