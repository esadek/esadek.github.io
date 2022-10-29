import lume from "lume/mod.ts";
import date from "lume/plugins/date.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";

const site = lume();

site.use(date())
    .use(codeHighlight());

site.copy("static");

site.ignore("README.md");

export default site;
