import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import jsx from "lume/plugins/jsx.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import search from "lume/plugins/search.ts";

const site = lume();

site.use(search());
site.use(date());
site.use(codeHighlight());
site.use(jsx());
site.use(tailwindcss({ extensions: [".html", ".tsx"] }));
site.use(postcss());

site.loadAssets([".css"]);

site.copy("CNAME");
site.copy("static");

site.ignore("LICENSE", "README.md");

export default site;
