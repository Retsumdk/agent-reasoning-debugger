#!/usr/bin/env bun
/**
 * agent-reasoning-debugger - Visualization and auditing tool for internal reasoning steps of AI agents
 * Built by Retsumdk
 */

import { Command } from "commander";
import { Debugger } from "./debugger";
import { Auditor } from "./auditor";
import * as fs from "fs";

const program = new Command();

program
  .name("agent-reasoning-debugger")
  .description("Visualization and auditing tool for internal reasoning steps of AI agents, highlighting logic gaps and decision bottlenecks")
  .version("1.0.0");

program
  .command("visualize")
  .description("Visualize a reasoning trace file")
  .argument("<file>", "Path to the trace JSON file")
  .action((file) => {
    try {
      const trace = Debugger.loadTrace(file);
      Debugger.visualize(trace);
    } catch (e) {
      console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
      process.exit(1);
    }
  });

program
  .command("audit")
  .description("Audit a reasoning trace for logic gaps and bottlenecks")
  .argument("<file>", "Path to the trace JSON file")
  .option("-j, --json", "Output audit result as JSON")
  .action((file, options) => {
    try {
      const trace = Debugger.loadTrace(file);
      const result = Auditor.audit(trace);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n=== Audit Report: ${result.traceId} ===`);
        console.log(`Efficiency Score: ${result.metrics.efficiencyScore.toFixed(1)}/100`);
        console.log(`Steps: ${result.metrics.stepCount} | Tokens: ${result.metrics.totalTokens} | Duration: ${result.metrics.totalDuration}ms`);
        console.log("=".repeat(40));

        if (result.issues.length === 0) {
          console.log("\n✅ No issues detected. This trace looks clean!");
        } else {
          console.log(`\nFound ${result.issues.length} issues:`);
          result.issues.forEach((issue, idx) => {
            const severityIcon = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : issue.severity === 'medium' ? '🟡' : '⚪';
            console.log(`\n[${idx + 1}] ${severityIcon} ${issue.type.toUpperCase()} (${issue.severity})`);
            console.log(`    Description: ${issue.description}`);
            if (issue.stepId) console.log(`    Step ID: ${issue.stepId}`);
            if (issue.suggestion) console.log(`    Suggestion: ${issue.suggestion}`);
          });
        }
        console.log("\n" + "=".repeat(40));
      }
    } catch (e) {
      console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
      process.exit(1);
    }
  });

program
  .command("sample")
  .description("Generate a sample trace file for testing")
  .argument("[output]", "Output file path", "sample-trace.json")
  .action((output) => {
    try {
      const sample = Debugger.generateSample();
      fs.writeFileSync(output, JSON.stringify(sample, null, 2));
      console.log(`Successfully generated sample trace to ${output}`);
    } catch (e) {
      console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
