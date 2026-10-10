import { findResults } from "./search-core.js";
const form = document.querySelector("#archive-search"),
  input = document.querySelector("#archive-query"),
  status = document.querySelector("#search-status"),
  list = document.querySelector("#search-results");
let indexPromise;
let requestId = 0;
async function search(query) {
  const currentRequest = ++requestId;
  list.replaceChildren();
  if (!query.trim()) {
    status.textContent =
      "Enter a word or phrase to search published pages and posts.";
    return;
  }
  status.textContent = "Searching…";
  try {
    indexPromise ||= fetch("/search-index.json").then((r) => {
      if (!r.ok) throw new Error("Index unavailable");
      return r.json();
    });
    const index = await indexPromise;
    if (currentRequest !== requestId) return;
    const results = findResults(index, query);
    status.textContent = results.length
      ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${query}”.`
      : `No results for “${query}”. Try another word or phrase.`;
    for (const record of results) {
      const item = document.createElement("li"),
        heading = document.createElement("h2"),
        link = document.createElement("a"),
        summary = document.createElement("p");
      link.href = record.url;
      link.textContent = record.title;
      heading.append(link);
      summary.textContent =
        record.text.slice(0, 240) + (record.text.length > 240 ? "…" : "");
      item.append(heading, summary);
      list.append(item);
    }
  } catch {
    if (currentRequest !== requestId) return;
    indexPromise = null;
    status.textContent =
      "Search is unavailable. Please try again or browse the posts and navigation.";
  }
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input.value.trim();
  const url = new URL(location.href);
  query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
  history.replaceState(null, "", url);
  search(query);
});
input.value =
  new URL(location.href).searchParams.get("q") ||
  new URL(location.href).searchParams.get("s") ||
  "";
search(input.value);
