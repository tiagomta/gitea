import * as core from "@actions/core";
import { exec } from "@actions/exec";

class Milestone {
    #context = JSON.parse(core.getInput("context"));
    #token = core.getInput("token");
    #prNumber = core.getInput("pr_number");

    async create(options, milestone) {
        if (!milestone) throw new Error("No milestone specified");
        const api = `${this.#context.api_url}/repos/${this.#context.repository}`;
        let response = await fetch(`${api}/milestones`, {
          method: "POST",
          headers: {
            Authorization: `token ${this.#token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: milestone }),
        });
      
        if (!response.ok) throw new Error(`Error creating milestone: ${response.statusText}`);

        milestone = await response.json();
        if (options.linkPR) {
            response = await fetch(`${api}/pulls/${this.#prNumber}`, {
                method: "PATCH",
                headers: {
                    Authorization: `token ${this.#token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, milestone: milestone.id }),
            });
          
            if (!response.ok)
                throw new Error(`Error assigning milestone to PR: ${response.statusText}`);
        }
      
        return milestone;
    }

    async close(_, milestone) {
        if (!milestone) throw new Error("No milestone specified");
        const response = await fetch(`${this.#context.api_url}/repos/${this.#context.repository}/milestones/${milestone}`, {
          method: "PATCH",
          headers: {
            Authorization: this.#token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state: "closed",
          }),
        });
      
      
        if (!response.ok)
          throw new Error(`Error updating milestone ${milestone}: ${response.statusText}`);
      
        return true;
    }
}

const milestone = new Milestone();

export default milestone;

/**/