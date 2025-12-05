export enum ForensicMode {
  ORIGINAL = 'ORIGINAL',
  NOISE_ANALYSIS = 'NOISE_ANALYSIS',
  EDGE_DETECTION = 'EDGE_DETECTION',
  ERROR_LEVEL = 'ERROR_LEVEL'
}

export interface AnalysisMetrics {
  aiProbability: number; // 0-100
  textureCoherence: number; // 0-100
  lightingConsistency: number; // 0-100
  geometryScore: number; // 0-100
  backgroundBlur: number; // 0-100
  compressionArtifacts: number; // 0-100
}

export interface AnalysisResult {
  metrics: AnalysisMetrics;
  reasoning: string;
  technicalDetails: string[];
  timestamp: string;
  verdict: 'LIKELY_REAL' | 'LIKELY_AI' | 'UNCERTAIN';
}

export interface ChartDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}