
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
    let type = labels?.[0]?.name?.replace("Project/", "") || "Misc";
    if (type.startsWith("Release ")) continue;
    if (type === "Task") type = "Misc";
    else if (type === "Bug") type = "Bugfixes";
    else if (type !== "Misc") type = type + "s";
    if (!types[type]) types[type] = `## ${type}\n`;
    types[type] += `- ${title} (#${number})\n`
  }
  return Object.values(types).join("\n");
}