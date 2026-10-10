import { readFileSync } from "node:fs";
import {
  prepareContent,
  plainText,
  makeListings,
  commentTree,
} from "./scripts/lib/content.mjs";
export default function (config) {
  const archive = JSON.parse(readFileSync("src/_data/archive.json", "utf8"));
  config.addPassthroughCopy({
    "src/assets": "assets",
    "src/wp-content": "wp-content",
  });
  config.addPassthroughCopy("src/CNAME");
  config.addGlobalData(
    "records",
    [...archive.pages, ...archive.posts].filter((r) => r.url !== "/posts/"),
  );
  config.addGlobalData("listings", makeListings(archive));
  config.addFilter("archiveHtml", prepareContent);
  config.addFilter("plainText", plainText);
  config.addFilter("excerpt", (r) =>
    plainText(r.excerpt || r.html)
      .split(" ")
      .slice(0, 40)
      .join(" "),
  );
  config.addFilter("displayDate", (date) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(date.slice(0, 10) + "T12:00:00Z")),
  );
  config.addFilter("isoDate", (date) => date.slice(0, 10));
  config.addFilter("commentTree", commentTree);
  config.addFilter("neighbors", (r) => {
    const i = archive.posts.findIndex((p) => p.id === r.id);
    return { previous: archive.posts[i + 1], next: archive.posts[i - 1] };
  });
  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    templateFormats: ["njk", "11ty.js"],
    htmlTemplateEngine: "njk",
  };
}
