
function main(options, action, ...args) {
  if (!actions[action]) throw new Error(`Unknown issues action: ${action}`);
  return actions[action](options, ...args);
}

export default main;

const actions = {
    async create(options, title) {
        if (!title) throw new Error("No milestone title specified");
        const api = `${context.api_url}/repos/${repository}`;
        let response = await fetch(`${api}/milestones`, {
          method: "POST",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        });
      
        if (!response.ok) throw new Error(`Error creating milestone: ${response.statusText}`);

        const milestone = await response.json();
        if (options.linkPR) {
            response = await fetch(`${api}/pulls/${context.event.pull_request.number}`, {
                method: "PATCH",
                headers: {
                    Authorization: `token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: milestone, milestone: milestone.id }),
            });
          
            if (!response.ok)
                throw new Error(`Error assigning milestone to PR: ${response.statusText}`);
        }
      
        return milestone;
    },
    async close(_, milestone) {
        if (!milestone) throw new Error("No milestone specified");
        const response = await fetch(`${context.api_url}/repos/${repository}/milestones/${milestone}`, {
          method: "PATCH",
          headers: {
            Authorization: `token ${token}`,
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
