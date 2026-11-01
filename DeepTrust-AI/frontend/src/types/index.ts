export interface User {
  id: string;
  email: string;
  full_name: string;
  preferred_language: string;
  avatar_url?: string;
  created_at: string;
}

export interface ScanEvidence {
  id: string;
  evidence_type: string;
  title: string;
  description?: string;
  visual_url?: string;
  metadata_json?: any;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  media_type: 'audio' | 'image' | 'video' | 'message' | 'url';
  title: string;
  file_url?: string;
  original_filename?: string;
  file_size_bytes: number;
  file_hash_sha256?: string;
  status: string;
  classification: string;
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  confidence: number;
  model_name: string;
  model_version: string;
  inference_latency_ms: number;
  summary?: string;
  forensic_details?: any;
  technical_limitations?: string;
  recommended_actions?: string[];
  synthetic_risk_score?: number;
  scam_risk_score?: number;
  transcript?: string;
  flagged_phrases?: Array<{
    phrase: string;
    category: string;
    description: string;
    start?: number;
    end?: number;
  }>;
  created_at: string;
  evidence: ScanEvidence[];
}

export interface DashboardStats {
  total_scans: number;
  potential_deepfakes: number;
  low_risk_results: number;
  suspicious_messages_links: number;
  pending_analyses: number;
  media_distribution: Record<string, number>;
  risk_breakdown: Record<string, number>;
  recent_scans: Scan[];
  ai_service_health: any;
}

export interface ReportItem {
  id: string;
  scan_id: string;
  report_uuid: string;
  pdf_url?: string;
  created_at: string;
  scan?: Scan;
}

export interface DemoSample {
  id: string;
  title: string;
  category: string;
  media_type: string;
  file_name?: string;
  content?: string;
  ground_truth: string;
  ground_truth_label: string;
  description: string;
  dual_risk?: boolean;
  sample_preview: string;
  behind_the_ai: {
    preprocessing: string;
    model_architecture: string;
    feature_focus: string;
  };
}

export interface ModelMetric {
  model_id: string;
  name: string;
  version: string;
  domain: string;
  license: string;
  evaluation_dataset: string;
  methodology: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    false_positive_rate: number;
    equal_error_rate_eer?: number;
    average_inference_latency_ms: number;
  };
  confusion_matrix: {
    true_positive: number;
    false_positive: number;
    true_negative: number;
    false_negative: number;
  };
  known_limitations: string[];
}
