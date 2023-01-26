---
title: Running Markdoc on Deno
date: 2023-01-22
layout: post.njk
---

[Markdoc](https://markdoc.dev) is a Markdown-based authoring framework developed at Stripe to power their renowned documentation site. Now that npm compatibility has been stabilized in [Deno](https://deno.land), a JavaScript runtime developed by Node.js creator Ryan Dahl, running Markdoc is easier than ever before. And since Markdoc is written in TypeScript and Deno supports TypeScript out of the box, you get all of the benefits that come with TypeScript, such as an enhanced IDE experience.

Markdoc is imported using an `import` statement with a [npm specifier](https://deno.land/manual@v1.30.0/node/npm_specifiers):

```typescript
import Markdoc from "npm:@markdoc/markdoc";
```

Deno's file system API is used to read and write files, while Markdoc is used to render the content:

```typescript
const source = await Deno.readTextFile("./index.md");

const ast = Markdoc.parse(source);
const content = Markdoc.transform(ast);
const html = Markdoc.renderers.html(content);

await Deno.writeTextFile("./index.html", html);
```

Here's a breakdown of the code above:

1. Read a Markdown file with [Deno.readTextFile](https://deno.land/api?s=Deno.readTextFile).
2. Parse the string into an abstract syntax tree with [Markdoc.parse](https://markdoc.dev/docs/render#parse).
3. Transform the abstract syntax tree into a renderable tree with [Markdoc.transform](https://markdoc.dev/docs/render#transform).
4. Render the renderable tree into a HTML document as a string with [Markdoc.html](https://markdoc.dev/docs/render#html).
5. Output to an HTML file with [Deno.writeTextFile](https://deno.land/api@v1.30.0?s=Deno.writeTextFile).
