/**
 * Types for Agent Reasoning Debugger
 */

export interface ReasoningStep {
  id: string;
  timestamp: string;
  type: 'thought' | 'action' | 'observation' | 'error';
  content: string;
  metadata?: Record<string, any>;
  tokensUsed?: number;
  durationMs?: number;
}

export interface ReasoningTrace {
  id: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  steps: ReasoningStep[];
  status: 'completed' | 'failed' | 'in_progress';
  summary?: string;
}

export interface AuditIssue {
  type: 'logic_gap' | 'bottleneck' | 'contradiction' | 'efficiency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  stepId?: string;
  suggestion?: string;
}

export interface AuditResult {
  traceId: string;
  issues: AuditIssue[];
  metrics: {
    totalTokens: number;
    totalDuration: number;
    stepCount: number;
    efficiencyScore: number;
  };
}
