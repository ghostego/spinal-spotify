export const batchRequests = async (
  requests: (() => Promise<any>)[],
  limit = 5
) => {
  const results = [];
  let i = 0;

  while (i < requests.length) {
    const chunk = requests.slice(i, i + limit);
    const chunkResults = await Promise.all(chunk.map((fn) => fn()));
    results.push(...chunkResults);
    i += limit;
  }

  return results;
};
