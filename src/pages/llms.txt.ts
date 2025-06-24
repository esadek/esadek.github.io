import { getCollection } from "astro:content";

let content = `# Emil Sadek

> Emil Sadek's personal website and blog.

Emil is the founder of North Star Data, a data engineering and analytics consultancy specialized in implementing modern data technologies for startups.
Previously, he worked at RudderStack, enabling developers to solve complex customer data problems. 
 
## Blog

`;

const posts = await getCollection("blog");
const sortedPosts = posts.sort((a, b) => {
  return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
});
sortedPosts.forEach((post) => {
  content += `- [${post.data.title}](https://emilsadek.com/blog/${post.slug}): ${post.data.description}\n`;
});

export function GET() {
  return new Response(content);
}
