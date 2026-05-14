import { expect, test, describe } from "bun:test";
import { Debugger } from "../src/debugger";
import { Auditor } from "../src/auditor";
import { ReasoningTrace } from "../src/types";

describe("Agent Reasoning Debugger", () => {
  test("Debugger should generate a valid sample trace", () => {
    const sample = Debugger.generateSample();
    expect(sample.id).toBeDefined();
    expect(sample.steps.length).toBeGreaterThan(0);
    expect(sample.status).toBe("completed");
  });

  test("Auditor should detect bottlenecks", () => {
    const trace: ReasoningTrace = {
      id: "test-trace",
      agentId: "test-agent",
      startTime: new Date().toISOString(),
      status: "completed",
      steps: [
        {
          id: "step-1",
          timestamp: new Date().toISOString(),
          type: "thought",
          content: "Thinking...",
          durationMs: 20000, // bottleneck
          tokensUsed: 100
        }
      ]
    };

    const result = Auditor.audit(trace);
    expect(result.issues.some(i => i.type === 'bottleneck')).toBe(true);
    expect(result.metrics.efficiencyScore).toBeLessThan(100);
  });

  test("Auditor should detect logic gaps", () => {
    const trace: ReasoningTrace = {
      id: "test-trace",
      agentId: "test-agent",
      startTime: new Date().toISOString(),
      status: "completed",
      steps: [
        {
          id: "step-1",
          timestamp: new Date().toISOString(),
          type: "observation",
          content: "Saw something.",
          durationMs: 100
        },
        {
          id: "step-2",
          timestamp: new Date().toISOString(),
          type: "action",
          content: "Took action.",
          durationMs: 100
        }
      ]
    };

    const result = Auditor.audit(trace);
    expect(result.issues.some(i => i.type === 'logic_gap')).toBe(true);
  });

  test("Auditor should detect contradictions", () => {
    const trace: ReasoningTrace = {
      id: "test-trace",
      agentId: "test-agent",
      startTime: new Date().toISOString(),
      status: "completed",
      steps: [
        {
          id: "step-1",
          timestamp: new Date().toISOString(),
          type: "thought",
          content: "I found the document in the folder.",
          durationMs: 100
        },
        {
          id: "step-2",
          timestamp: new Date().toISOString(),
          type: "thought",
          content: "The document does not exist.",
          durationMs: 100
        }
      ]
    };

    const result = Auditor.audit(trace);
    expect(result.issues.some(i => i.type === 'contradiction')).toBe(true);
  });

  test("Auditor should calculate efficiency score correctly", () => {
    const trace = Debugger.generateSample();
    const result = Auditor.audit(trace);
    expect(result.metrics.efficiencyScore).toBeGreaterThan(80);
    expect(result.metrics.efficiencyScore).toBeLessThanOrEqual(100);
  });
});
