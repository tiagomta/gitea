
function main(options, action, ...args) {
  if (!actions[action]) throw new Error(`Unknown issues action: ${action}`);
  return actions[action](options, ...args);
}

export default main;

const actions = {
    async create(options, tag) {
      if (!tag) throw new Error("No tag specified");
      const response = await fetch(`${context.api_url}/repos/${repository}/releases`, {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: options.name || tag,
          body: options.body || options.fromMilestone ? await getMilestoneInfo(options.fromMilestone) : "",
          tag_name: tag
        }),
      });
    
      if (!response.ok)
        throw new Error(`Error creating release: ${response.statusText}`);
    
      return response;
    }
}

async function getMilestoneInfo(milestone) {
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
  const types = {};
  for (let i = 0, len = issues.length; i < len; i++) {
    const { number, title, labels } = issues[i];
    for (let i2 = 0, len2 = labels?.length || 0; i2 < len2; i2++) {
      const name = labels[i2].name;
      if (!types[name]) types[name] = `## ${name}\n`;
      types[name] += `- ${title} (#${number})\n`
    }
  }
  return Object.values(types).join("\n");
}