import * as core from "@actions/core";
import { exec } from "@actions/exec";

class Issues {
    #context = JSON.parse(core.getInput("context"));
    #token = core.getInput("token");

    async close(options) {
        const milestone = options.milestone && Number(options.milestone);
        let issues;
        if (options.issues) issues = options.issues.split(/,;/);
        else if (options.fromCommit) issues = await getIssuesFromCommit();
        else throw new Error("No issues specified");
        for (let i = 0, len = issues?.length || 0; i < len; i++) {
            try {
                await this.#update(issues[i], { milestone, state: "closed" });
                console.log(`Issue ${issue} closed successfully with milestone ${milestone}`);
            }
            catch (error) {
                console.error(error.message);
            }
        }

    }

    async #update(issue, data) {
        const response = await fetch(`${this.#context.api_url}/repos/${core.getInput("repository")}/issues/${issue.slice(1)}`, {
          method: "PATCH",
          headers: {
            Authorization: `token ${this.#token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      
        if (!response.ok) throw new Error(`Error updating issue ${issue}: ${response.statusText}`);
      
        return true;
    }
}

const issues = new Issues();

export default issues;

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