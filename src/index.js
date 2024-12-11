import * as core from "@actions/core";
import issues from "./issues.js";
import milestone from "./milestone.js";
import release from "./release.js";

const commands = { issues, milestone, release };

try {
    let [command, action, ...args] = core.getInput("command").trim().split(/\s+/);
    if (!commands[command]) throw new Error(`Unknown command: ${command}`);
    const target = commands[command];
    if (!target[action]) throw new Error(`Unknown ${command} action: ${action}`);
    const result = target[action](parseOptions(core.getInput("options")), ...args);
    if (result instanceof Promise) await result;
    core.setOutput("result", true);
} catch (error) {
  core.setFailed(error.message);
}
