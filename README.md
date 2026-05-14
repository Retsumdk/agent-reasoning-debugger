# Agent Reasoning Debugger

A professional tool for visualizing and auditing the internal reasoning steps of AI agents. It helps developers identify logic gaps, performance bottlenecks, and contradictions in agent behavior.

## Features

- **🧠 Reasoning Visualization**: Clear CLI-based visualization of thoughts, actions, observations, and errors.
- **🛡️ Automated Auditing**: Detects common reasoning failures:
  - **Logic Gaps**: Actions taken without preceding reasoning thoughts.
  - **Bottlenecks**: Steps with unusually high duration.
  - **Efficiency Issues**: Excessive token usage or redundant loops.
  - **Contradictions**: Identifying conflicting statements in the agent's internal monologue.
- **📊 Metrics & Scoring**: Provides an overall efficiency score based on token usage, duration, and error rates.
- **📁 Trace Management**: Easy loading and analysis of standardized reasoning trace JSON files.

## Installation

```bash
# Clone the repository
git clone https://github.com/Retsumdk/agent-reasoning-debugger
cd agent-reasoning-debugger

# Install dependencies
bun install
```

## Usage

### Generate a Sample Trace
To see the tool in action, generate a sample reasoning trace:
```bash
bun src/index.ts sample
```

### Visualize a Trace
Visualize the reasoning flow in your terminal:
```bash
bun src/index.ts visualize sample-trace.json
```

### Audit a Trace
Run the auditor to detect issues:
```bash
bun src/index.ts audit sample-trace.json
```

### JSON Output
For integration with other tools, you can output audit results as JSON:
```bash
bun src/index.ts audit sample-trace.json --json
```

## Trace Format

The tool expects a JSON file following this structure:

```json
{
  "id": "trace-unique-id",
  "agentId": "agent-name",
  "startTime": "ISO-8601-timestamp",
  "status": "completed",
  "steps": [
    {
      "id": "step-1",
      "timestamp": "ISO-8601-timestamp",
      "type": "thought",
      "content": "I should search for the documentation.",
      "durationMs": 500,
      "tokensUsed": 150
    }
  ]
}
```

## Architecture

The project is built with TypeScript and Bun:
- `src/types.ts`: Core data structures.
- `src/auditor.ts`: Analysis logic and scoring engine.
- `src/debugger.ts`: Loading and visualization logic.
- `src/index.ts`: CLI entry point.

## License

MIT
