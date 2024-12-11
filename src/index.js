import * as core from "@actions/core";
import { exec } from "@actions/exec";
import fs from "node:fs";
import { URL } from "node:url";

try {
  const context = JSON.parse(core.getInput("context"));
  const command = core.getInput("command");
  const args = core.getInput("args");
  console.log(command);
  console.log(context);
  console.log(args);
  core.setOutput("result", true);
} catch (error) {
  core.setFailed(error.message);
}
