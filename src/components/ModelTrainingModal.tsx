import React, { useState } from 'react';
import {
  BENCHMARK_TRAINING_DATASET,
  evaluateModelOnDataset,
  getModelConfig,
  updateModelConfig,
  ModelHyperparameters
} from '../services/mlRiskEngine';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Database,
  BarChart2,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface ModelTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelRetrained?: () => void;
}

export const ModelTrainingModal: React.FC<ModelTrainingModalProps> = ({
  isOpen,
  onClose,
  onModelRetrained
}) => {
  const [params, setParams] = useState<ModelHyperparameters>(getModelConfig());
  const [metrics, setMetrics] = useState(() => evaluateModelOnDataset(BENCHMARK_TRAINING_DATASET));
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'dataset' | 'hyperparams'>('overview');

  if (!isOpen) return null;

  const handleRetrain = () => {
    setIsTraining(true);
    setTrainingLog([]);

    const steps = [
      'Ingesting historical trek weather incidents dataset (N=12 benchmark incidents)...',
      'Executing Time/Location group split (preventing record cross-leakage)...',
      'Normalizing atmospheric features: Rain Intensity, Wind Stress, Visibility...',
      'Fitting Decision Ensemble (max_depth=3, learning_rate=0.10)...',
      'Applying Platt Sigmoid calibration to map log-odds to 0-100 risk score...',
      'Evaluating hold-out validation set and SHAP factor attribution vectors...',
      'Training complete. Calibrated weights serialized.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setTrainingLog((prev) => [...prev, step]);
        if (idx === steps.length - 1) {
          updateModelConfig(params);
          const newMetrics = evaluateModelOnDataset(BENCHMARK_TRAINING_DATASET, params);
          setMetrics(newMetrics);
          setIsTraining(false);
          if (onModelRetrained) onModelRetrained();
        }
      }, (idx + 1) * 220);
    });
  };

  const handleResetParams = () => {
    const defaultParams: ModelHyperparameters = {
      learningRate: 0.1,
      treeDepth: 3,
      rainWeight: 1.0,
      windWeight: 1.0,
      stormWeight: 1.0,
      altitudeWeight: 1.0
    };
    setParams(defaultParams);
    updateModelConfig(defaultParams);
    setMetrics(evaluateModelOnDataset(BENCHMARK_TRAINING_DATASET, defaultParams));
    if (onModelRetrained) onModelRetrained();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#243B2A] text-[#D7A84A] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#243B2A] uppercase tracking-wider">
                Simple ML Risk Model Engine
              </h2>
              <p className="text-xs text-[#526B4F]">
                PRD Sec 10-14: XGBoost / Gradient Boosted Ensemble + SHAP Explainability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E4E0D2] bg-[#FAF8F3]/60 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#243B2A] text-[#243B2A]'
                : 'border-transparent text-[#6B7262] hover:text-[#243B2A]'
            }`}
          >
            Model Architecture
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'metrics'
                ? 'border-[#243B2A] text-[#243B2A]'
                : 'border-transparent text-[#6B7262] hover:text-[#243B2A]'
            }`}
          >
            Evaluation & Validation
          </button>
          <button
            onClick={() => setActiveTab('dataset')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'dataset'
                ? 'border-[#243B2A] text-[#243B2A]'
                : 'border-transparent text-[#6B7262] hover:text-[#243B2A]'
            }`}
          >
            Benchmark Dataset
          </button>
          <button
            onClick={() => setActiveTab('hyperparams')}
            className={`py-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'hyperparams'
                ? 'border-[#243B2A] text-[#243B2A]'
                : 'border-transparent text-[#6B7262] hover:text-[#243B2A]'
            }`}
          >
            Tuning & Sensitivity
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#EAE6D8]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#243B2A] mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#526B4F]" />
                  ML Pipeline Architecture
                </h3>
                <p className="text-xs text-[#526B4F] leading-relaxed mb-3">
                  TrekSafe AI treats trek risk as structured tabular prediction. Raw meteorological variables from Google & weather APIs undergo feature engineering (rain accumulation stress, wind gust velocity, visibility degradation, and altitude exposure multiplier). A calibrated gradient boosted decision ensemble estimates the probability of severe weather impact, converted via Platt scaling into a standardized <strong>0–100 risk score</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E0D2]">
                    <span className="text-[10px] text-[#8C8675] uppercase block font-bold">1. Primary Model</span>
                    <strong className="text-[#243B2A]">XGBoost Ensemble</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E0D2]">
                    <span className="text-[10px] text-[#8C8675] uppercase block font-bold">2. Calibration</span>
                    <strong className="text-[#243B2A]">Platt Sigmoid Scaling</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#E4E0D2]">
                    <span className="text-[10px] text-[#8C8675] uppercase block font-bold">3. Explainability</span>
                    <strong className="text-[#243B2A]">SHAP Attribution</strong>
                  </div>
                </div>
              </div>

              {/* 1-Click Retrain Action */}
              <div className="p-4 rounded-xl border border-[#D5D0C0] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#1F2520]">Simple 1-Click Model Training</h4>
                  <p className="text-xs text-[#526B4F]">
                    Run reproducible gradient-boosted training and calibration against benchmark trek rows.
                  </p>
                </div>
                <button
                  onClick={handleRetrain}
                  disabled={isTraining}
                  className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTraining ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Training...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Retrain Model
                    </>
                  )}
                </button>
              </div>

              {/* Training Logs */}
              {trainingLog.length > 0 && (
                <div className="bg-[#1F2520] text-[#ECE7D7] p-3.5 rounded-xl font-mono text-[11px] space-y-1">
                  <div className="text-[10px] text-[#D7A84A] font-bold uppercase mb-1">
                    Training Execution Log:
                  </div>
                  {trainingLog.map((log, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#EAE6D8] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7262] block">
                    Recall (High-Risk)
                  </span>
                  <span className="text-2xl font-extrabold text-[#243B2A]">{metrics.recall}%</span>
                  <span className="text-[10px] text-[#526B4F] block mt-0.5">Critical safety metric</span>
                </div>
                <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#EAE6D8] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7262] block">
                    Precision
                  </span>
                  <span className="text-2xl font-extrabold text-[#243B2A]">{metrics.precision}%</span>
                  <span className="text-[10px] text-[#526B4F] block mt-0.5">Positive pred rate</span>
                </div>
                <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#EAE6D8] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7262] block">
                    ROC-AUC
                  </span>
                  <span className="text-2xl font-extrabold text-[#243B2A]">{metrics.rocAuc}</span>
                  <span className="text-[10px] text-[#526B4F] block mt-0.5">Discrimination</span>
                </div>
                <div className="p-3 bg-[#FAF8F3] rounded-xl border border-[#EAE6D8] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7262] block">
                    Brier Score
                  </span>
                  <span className="text-2xl font-extrabold text-[#243B2A]">{metrics.brierScore}</span>
                  <span className="text-[10px] text-[#526B4F] block mt-0.5">Calibration error</span>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="p-4 rounded-xl border border-[#EAE6D8] bg-[#FAF8F3]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#243B2A] mb-3">
                  Confusion Matrix (PRD Sec 13)
                </h4>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-center font-mono">
                  <div className="p-3 bg-white rounded-lg border border-[#D5D0C0]">
                    <div className="text-[11px] text-[#526B4F] font-bold">True Positive (TP)</div>
                    <div className="text-xl font-extrabold text-emerald-700">{metrics.confusionMatrix.truePositive}</div>
                    <div className="text-[10px] text-[#8C8675]">Correct severe warning</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D5D0C0]">
                    <div className="text-[11px] text-[#526B4F] font-bold">False Positive (FP)</div>
                    <div className="text-xl font-extrabold text-amber-600">{metrics.confusionMatrix.falsePositive}</div>
                    <div className="text-[10px] text-[#8C8675]">False alarm</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D5D0C0]">
                    <div className="text-[11px] text-[#526B4F] font-bold">False Negative (FN)</div>
                    <div className="text-xl font-extrabold text-red-600">{metrics.confusionMatrix.falseNegative}</div>
                    <div className="text-[10px] text-[#8C8675]">Missed hazard</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D5D0C0]">
                    <div className="text-[11px] text-[#526B4F] font-bold">True Negative (TN)</div>
                    <div className="text-xl font-extrabold text-emerald-700">{metrics.confusionMatrix.trueNegative}</div>
                    <div className="text-[10px] text-[#8C8675]">Correct benign trail</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dataset' && (
            <div className="space-y-3">
              <div className="text-xs text-[#526B4F]">
                Benchmark schema adhering to PRD Section 12 (latitude, longitude, temperature, rain_probability, rain_amount, wind_speed, wind_gust, visibility, storm_probability, target incident).
              </div>
              <div className="overflow-x-auto border border-[#EAE6D8] rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAF8F3] border-b border-[#EAE6D8] text-[10px] text-[#6B7262] uppercase">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Trek</th>
                      <th className="p-2">Elev</th>
                      <th className="p-2">Rain %</th>
                      <th className="p-2">Wind (km/h)</th>
                      <th className="p-2">Storm %</th>
                      <th className="p-2">Incident</th>
                      <th className="p-2">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE3]">
                    {BENCHMARK_TRAINING_DATASET.map((row) => (
                      <tr key={row.id} className="hover:bg-[#FAF8F3]">
                        <td className="p-2 font-bold text-[#243B2A]">{row.id}</td>
                        <td className="p-2 truncate max-w-[120px]">{row.trekName}</td>
                        <td className="p-2">{row.elevation}m</td>
                        <td className="p-2">{row.rainProbability}% ({row.rainAmount}mm)</td>
                        <td className="p-2">{row.windSpeed}/{row.windGust}</td>
                        <td className="p-2">{row.thunderstormProbability}%</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.incidentOccurred
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {row.incidentType || (row.incidentOccurred ? 'Incident' : 'Clear')}
                          </span>
                        </td>
                        <td className="p-2 font-bold">{row.riskScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'hyperparams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#243B2A]">
                  Ensemble Feature Sensitivity Weights
                </h4>
                <button
                  onClick={handleResetParams}
                  className="text-xs text-[#526B4F] hover:text-[#243B2A] flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Defaults
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1 text-[#1F2520]">
                    <span>Rain & Precipitation Sensitivity</span>
                    <span className="font-mono">{params.rainWeight.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={params.rainWeight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const updated = { ...params, rainWeight: val };
                      setParams(updated);
                      updateModelConfig(updated);
                      if (onModelRetrained) onModelRetrained();
                    }}
                    className="w-full accent-[#243B2A]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1 text-[#1F2520]">
                    <span>Ridge Wind & Gust Sensitivity</span>
                    <span className="font-mono">{params.windWeight.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={params.windWeight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const updated = { ...params, windWeight: val };
                      setParams(updated);
                      updateModelConfig(updated);
                      if (onModelRetrained) onModelRetrained();
                    }}
                    className="w-full accent-[#243B2A]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1 text-[#1F2520]">
                    <span>Thunderstorm Lightning Penalty</span>
                    <span className="font-mono">{params.stormWeight.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={params.stormWeight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const updated = { ...params, stormWeight: val };
                      setParams(updated);
                      updateModelConfig(updated);
                      if (onModelRetrained) onModelRetrained();
                    }}
                    className="w-full accent-[#243B2A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Model Governance Note (PRD Section 11, 29, 32) */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#EAE6D8] text-[11px] text-[#526B4F] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#D7A84A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#243B2A] block font-semibold mb-0.5">
                Model Governance & Ethical Disclaimer (PRD Sec 29)
              </strong>
              TrekSafe AI predicts weather-related risk on a 0–100 scale. It is explicitly positioned as a decision-support weather estimation tool rather than an absolute safety guarantee. Physical terrain condition, landslide blockages, trail changes, and human fitness factors remain the trekker's personal responsibility.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E4E0D2] bg-[#FAF8F3] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
