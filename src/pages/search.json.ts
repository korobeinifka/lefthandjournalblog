import { getCollection } from "astro:content";

const normalise = (value: string) => value.replace(/\s+/g, " ").trim();

const stripMarkdown = (value: string) =>
  value
    .replace(/`{3}[\s\S]*?`{3}/g, " ")
    .replace(/`+/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*_~\-]+/g, " ");

export async function GET() {
  const posts = await getCollection("blogs");

  const payload = posts
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => {
      const rawBody = typeof post.body === "string" ? post.body : "";
      const cleanedBody = normalise(stripMarkdown(rawBody));
      const excerptSource = cleanedBody || post.data.description || "";
      const excerpt = excerptSource.slice(0, 200).trim();

      return {
        title: post.data.title,
        description: post.data.description,
        category: post.data.category,
        url: `/blog/${post.slug}`,
        excerpt: excerpt ? `${excerpt}${excerptSource.length > excerpt.length ? "…" : ""}` : "",
        pubDate: post.data.pubDate.toISOString(),
        searchField: normalise(
          [
            post.data.title,
            post.data.description,
            post.data.category,
            cleanedBody,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        ),
      };
    });

  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=600",
    },
  });
}
