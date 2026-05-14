import { ReasoningTrace, ReasoningStep } from "./types";
import * as fs from "fs";
import * as path from "path";

export class Debugger {
  /**
   * Loads a trace from a JSON file
   */
  public static loadTrace(filePath: string): ReasoningTrace {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Trace file not found: ${absolutePath}`);
    }

    try {
      const data = fs.readFileSync(absolutePath, "utf-8");
      return JSON.parse(data) as ReasoningTrace;
    } catch (error) {
      throw new Error(`Failed to parse trace file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Visualizes the trace in the console
   */
  public static visualize(trace: ReasoningTrace) {
    console.log(`\n=== Reasoning Trace: ${trace.id} ===`);
    console.log(`Agent: ${trace.agentId} | Status: ${trace.status}`);
    console.log(`Started: ${trace.startTime}`);
    console.log("=".repeat(trace.id.length + 22));

    trace.steps.forEach((step, index) => {
      const icon = this.getStepIcon(step.type);
      const time = new Date(step.timestamp).toLocaleTimeString();
      const duration = step.durationMs ? ` (${step.durationMs}ms)` : "";
      
      console.log(`\n[${index + 1}] ${icon} ${step.type.toUpperCase()} - ${time}${duration}`);
      console.log(`   ID: ${step.id}`);
      
      const lines = step.content.split('\n');
      lines.forEach(line => {
        console.log(`   | ${line}`);
      });

      if (step.metadata && Object.keys(step.metadata).length > 0) {
        console.log(`   Meta: ${JSON.stringify(step.metadata)}`);
      }
    });

    if (trace.summary) {
      console.log(`\nSummary: ${trace.summary}`);
    }
    console.log("\n" + "=".repeat(40));
  }

  private static getStepIcon(type: string): string {
    switch (type) {
      case 'thought': return '🧠';
      case 'action': return '🚀';
      case 'observation': return '👁️';
      case 'error': return '❌';
      default: return '📝';
    }
  }

  /**
   * Generates a sample trace for testing
   */
  public static generateSample(): ReasoningTrace {
    const now = new Date();
    return {
      id: `trace-${Math.random().toString(36).substr(2, 9)}`,
      agentId: "sciel-bot-01",
      startTime: now.toISOString(),
      status: "completed",
      steps: [
        {
          id: "step-1",
          timestamp: now.toISOString(),
          type: "thought",
          content: "I need to check the user's recent activity to provide a relevant update.",
          durationMs: 450,
          tokensUsed: 120
        },
        {
          id: "step-2",
          timestamp: new Date(now.getTime() + 1000).toISOString(),
          type: "action",
          content: "list_recent_activity(user='thebookmaster')",
          metadata: { tool: "activity_api" },
          durationMs: 1200,
          tokensUsed: 80
        },
        {
          id: "step-3",
          timestamp: new Date(now.getTime() + 2500).toISOString(),
          type: "observation",
          content: "Found 3 activities: commit to 'zo-github', new post on Moltbook, updated AGENTS.md.",
          durationMs: 100,
          tokensUsed: 250
        },
        {
          id: "step-4",
          timestamp: new Date(now.getTime() + 3000).toISOString(),
          type: "thought",
          content: "The user has been very active in the SCIEL ecosystem today. I will summarize these points.",
          durationMs: 600,
          tokensUsed: 150
        }
      ],
      summary: "Agent successfully gathered recent activity and prepared a summary."
    };
  }
}
