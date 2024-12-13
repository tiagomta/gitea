import { exec } from "@actions/exec";

function main(options, action, ...args) {
  if (!actions[action]) throw new Error(`Unknown issues action: ${action}`);
  return actions[action](options, ...args);
}

export default main;

const actions = {
  async close(options) {
    const milestone = options.milestone && Number(options.milestone);
    let issues;
    if (options.issues) issues = options.issues.split(/,;/);
    else if (options.fromCommit) issues = await getIssuesFromCommit();
    else throw new Error("No issues specified");
    console.log(issues);
    for (let i = 0, len = issues?.length || 0; i < len; i++) {
        try {
            await update(issues[i], { milestone, state: "closed" });
            console.log(`Issue ${issue} closed successfully with milestone ${milestone}`);
        }
        catch (error) {
            console.error(error.message);
        }
    }
  }
}

async function update(issue, data) {
    const response = await fetch(`${context.api_url}/repos/${repository}/issues/${issue.slice(1)}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) throw new Error(`Error updating issue ${issue}: ${response.statusText}`);
  
    return true;
}

async function getIssuesFromCommit() {
    let commitMessage = '';
    await exec('git', ['log', '-1', '--pretty=%B'], {
      silent: true,
      listeners: {
        stdout: (data) => {
          commitMessage += data.toString();
        }
      }
    });
    return commitMessage.match(/#(\d+)/g);
}