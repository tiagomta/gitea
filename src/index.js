import * as core from "@actions/core";
import { parse } from "./utils.js";
import issues from "./issues.js";
import milestone from "./milestone.js";
import release from "./release.js";

const commands = { issues, milestone, release };

async function run() {
    try {
        const directory = core.getInput("working-directory");
        if (directory) process.chdir(directory);
        const [[command, ...args], options] = parse(core.getInput("command").trim());
        globalThis.context = JSON.parse(core.getInput("context"));
        globalThis.repository = core.getInput("repository");
        globalThis.ref = core.getInput("ref");
        globalThis.token = core.getInput("token");
        if (!commands[command]) throw new Error(`Unknown command: ${command}`);
        const result = commands[command](options, ...args);
        if (result instanceof Promise) core.setOutput("result", await result);
        else core.setOutput("result", result);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();