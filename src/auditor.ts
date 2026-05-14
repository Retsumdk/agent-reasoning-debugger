import { ReasoningTrace, AuditResult, AuditIssue, ReasoningStep } from "./types";

export class Auditor {
  /**
   * Performs a comprehensive audit of an agent reasoning trace
   */
  public static audit(trace: ReasoningTrace): AuditResult {
    const issues: AuditIssue[] = [];
    let totalTokens = 0;
    let totalDuration = 0;

    // Analyze individual steps
    for (let i = 0; i < trace.steps.length; i++) {
      const step = trace.steps[i];
      totalTokens += step.tokensUsed || 0;
      totalDuration += step.durationMs || 0;

      // Check for bottlenecks
      if (step.durationMs && step.durationMs > 5000) {
        issues.push({
          type: 'bottleneck',
          severity: step.durationMs > 15000 ? 'high' : 'medium',
          description: `Step ${step.id} took ${step.durationMs}ms, which is significantly higher than average.`,
          stepId: step.id,
          suggestion: "Consider optimizing the prompt or tool associated with this step."
        });
      }

      // Check for high token usage
      if (step.tokensUsed && step.tokensUsed > 2000) {
        issues.push({
          type: 'efficiency',
          severity: step.tokensUsed > 5000 ? 'high' : 'low',
          description: `Step ${step.id} consumed ${step.tokensUsed} tokens.`,
          stepId: step.id,
          suggestion: "Truncate context or use a more concise prompt."
        });
      }

      // Check for logic gaps (simplified: look for action without thought or observation)
      if (i > 0) {
        const prevStep = trace.steps[i - 1];
        if (step.type === 'action' && prevStep.type !== 'thought') {
          issues.push({
            type: 'logic_gap',
            severity: 'medium',
            description: `Action in step ${step.id} was taken without a preceding reasoning 'thought'.`,
            stepId: step.id,
            suggestion: "Ensure the agent generates internal reasoning before taking external actions."
          });
        }
      }

      // Check for consecutive errors
      if (i > 0 && step.type === 'error' && trace.steps[i-1].type === 'error') {
        issues.push({
          type: 'efficiency',
          severity: 'high',
          description: `Consecutive errors detected at steps ${trace.steps[i-1].id} and ${step.id}.`,
          suggestion: "Agent may be stuck in a failure loop. Implement a retry strategy with backoff."
        });
      }
    }

    // Check for contradictions (simplified: look for opposite keywords in close proximity)
    this.checkForContradictions(trace, issues);

    const efficiencyScore = this.calculateEfficiencyScore(trace, totalTokens, totalDuration);

    return {
      traceId: trace.id,
      issues,
      metrics: {
        totalTokens,
        totalDuration,
        stepCount: trace.steps.length,
        efficiencyScore
      }
    };
  }

  private static checkForContradictions(trace: ReasoningTrace, issues: AuditIssue[]) {
    const thoughts = trace.steps.filter(s => s.type === 'thought').map(s => ({ id: s.id, content: s.content.toLowerCase() }));
    
    for (let i = 0; i < thoughts.length; i++) {
      for (let j = i + 1; j < thoughts.length; j++) {
        const t1 = thoughts[i];
        const t2 = thoughts[j];

        // Example: "i found the file" followed by "the file does not exist"
        if (t1.content.includes("found") && t2.content.includes("not exist") && t1.content.split(' ').some(w => t2.content.includes(w) && w.length > 4)) {
          issues.push({
            type: 'contradiction',
            severity: 'high',
            description: `Potential contradiction between step ${t1.id} and ${t2.id}.`,
            stepId: t2.id,
            suggestion: "Verify if the agent's state management is correctly tracking findings."
          });
        }
      }
    }
  }

  private static calculateEfficiencyScore(trace: ReasoningTrace, tokens: number, duration: number): number {
    if (trace.steps.length === 0) return 0;
    
    // Base score 100
    let score = 100;

    // Penalize for high token count per step (avg > 1000)
    const avgTokens = tokens / trace.steps.length;
    if (avgTokens > 1000) score -= (avgTokens - 1000) / 50;

    // Penalize for high duration per step (avg > 3000ms)
    const avgDuration = duration / trace.steps.length;
    if (avgDuration > 3000) score -= (avgDuration - 3000) / 200;

    // Penalize for error steps
    const errorCount = trace.steps.filter(s => s.type === 'error').length;
    score -= (errorCount / trace.steps.length) * 50;

    return Math.max(0, Math.min(100, score));
  }
}
