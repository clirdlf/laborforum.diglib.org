export function findResults(records, query) {
  const tokens =
    String(query || "")
      .toLocaleLowerCase("en-US")
      .match(/[\p{L}\p{N}]+/gu) || [];
  if (!tokens.length) return [];
  return records
    .filter((r) => {
      const text = (r.title + " " + r.text).toLocaleLowerCase("en-US");
      return tokens.every((t) => text.includes(t));
    })
    .sort((a, b) => {
      const score = (r) =>
        tokens.filter((t) => r.title.toLocaleLowerCase("en-US").includes(t))
          .length;
      return score(b) - score(a);
    });
}
