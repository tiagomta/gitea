
function main(options, action, ...args) {
  if (!actions[action]) throw new Error(`Unknown issues action: ${action}`);
  return actions[action](options, ...args);
}

export default main;

const actions = {
    async create(options, tag) {
      if (!tag) throw new Error("No tag specified");
      console.log(options.milestone);
      const response = await fetch(`${context.api_url}/repos/${repository}/releases`, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: options.name || tag,
          body: options.body || options.milestone ? await getMilestoneInfo(options.milestone) : "",
          tag_name: tag
        }),
      });
    
      if (!response.ok)
        throw new Error(`Error creating release: ${response.statusText}`);
    
      return response;
    }
}

async function getMilestoneInfo(milestone) {
  console.log(`${context.api_url}/repos/${repository}/issues?state=all&milestone=${milestone}`);
  const response = await fetch(`${context.api_url}/repos/${repository}/issues?state=all&milestone=${milestone}`, {
    method: "GET",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    }
  });

  if (!response.ok)
    throw new Error(`Error getting issues from milestone ${milestone}: ${response.statusText}`);
  
  const issues = await response.json();
  console.log(issues);
  const types = {};
  for (let i = 0, len = issues.length; i < len; i++) {
    const { number, title, labels: [{ name }] } = issues[i];
    const type = name.replace("Project/", "");
    if (!types[type]) types[type] = `## ${type}s\n`;
    types[type] += `- ${title} #(${number})\n`
    types[type].push(issues[i]);
  }
  return Object.values(types).join("\n");
}