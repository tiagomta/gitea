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
    const labels = await getLabels(context.api_url, repository, token, options?.labels?.split(","));
    if (labels) body.labels = labels;
    const response = await fetch(`${api}/pulls`, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok)
      throw new Error(`Error creating Pull Request: ${response.statusText}`);
    return (await response.json()).id;
  },
};

async function getLabels(api, repository, token, labels = []) {
  const len = labels.length;
  if (len === 0) return null;
  const labelNameToId = {};
  const mapLabels = async(url) => {
    const response = await (
      await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
      })
    ).json();
    for (let i = 0; i < response.length; i++)
      labelNameToId[response[i].name] = response[i].id;
  };
  await mapLabels(`${api}/repos/${repository}/labels`);
  await mapLabels(`${api}/orgs/${repository.split("/")[0]}/labels`);
  const result = [];
  for (let i = 0; i < len; i++) {
    const label = labels[i];
    if (allLabels[label]) result.push(allLabels[label]);
  }
  return result.length === 0 ? null : result;
}
