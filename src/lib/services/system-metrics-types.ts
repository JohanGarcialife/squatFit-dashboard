/**
 * Tipos para el Dashboard de Rendimiento del Sistema
 * Endpoint: /api/v1/admin/system-metrics/performance-dashboard
 */

export interface SystemClassificationMetrics {
  accuracy: number;
  confidence: number;
}

export interface SystemLatencyMetrics {
  averageResponseTime: number;
}

export interface SystemLearningMetrics {
  patternsLearned: number;
}

export interface SystemSatisfactionMetrics {
  clientSatisfaction: number;
}

export interface SystemOverview {
  classification: SystemClassificationMetrics;
  latency: SystemLatencyMetrics;
  learning: SystemLearningMetrics;
  satisfaction: SystemSatisfactionMetrics;
}

export interface SystemTrendClassification {
  // Añade campos si se devuelven en los arrays de trends
  [key: string]: any;
}

export interface SystemTrend {
  period: "daily" | "weekly" | "monthly";
  days?: number;
  weeks?: number;
  months?: number;
  classification: SystemTrendClassification[];
}

export interface SystemTrends {
  daily: SystemTrend;
  weekly: SystemTrend;
  monthly: SystemTrend;
}

export interface SystemAlert {
  type: "warning" | "error" | "info" | "success";
  category: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface SystemRecommendation {
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  action: string;
}

export interface SystemMetricsResponse {
  overview: SystemOverview;
  trends: SystemTrends;
  alerts: SystemAlert[];
  recommendations: SystemRecommendation[];
}
