import { load } from "cheerio";
export function correctArchivalHtml(record) {
  const $ = load(record.html, {}, false);
  if (record.url === "/project-team/")
    $("h5").each((_, el) => {
      $(el).replaceWith(
        $('<h2 class="team-member-heading"></h2>').html($(el).html()),
      );
    });
  if (
    record.url ===
    "/2018/10/25/seeking-funded-participants-for-collective-responsibility/"
  )
    $("h3").each((_, el) => {
      $(el).replaceWith(
        $('<h2 class="archive-subheading"></h2>').html($(el).html()),
      );
    });
  $("ol > p, ul > p").each((_, el) => {
    if ($(el).text().trim() === ".") {
      $(el).prev("li").append(".");
      $(el).remove();
    }
  });
  return $.html();
}
