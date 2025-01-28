
function main(options, action, ...args) {
    if (!actions[action]) throw new Error(`Unknown issues action: ${action}`);
    return actions[action](options, ...args);
  }
  
  export default main;
  
  const actions = {
      async create(options, title, base, head) {
          if (!title) throw new Error("No milestone title specified");
          const api = `${context.api_url}/repos/${repository}`;
          const body = { title, base, head };
          if (options.milestone) body.milestone = options.milestone;
          if (options.labels) body.labels = options.labels.split(",");
          let response = await fetch(`${api}/pulls`, {
            method: "POST",
            headers: {
              Authorization: `token ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) throw new Error(`Error creating Pull Request: ${response.statusText}`);
          return (await response.json()).id;
      }
  }
  