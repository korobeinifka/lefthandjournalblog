import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { slugify } from "@/utils/slug";

export async function GET(context) {
  const posts = await getCollection("blogs");
  return rss({
    title: "levogiro",
    description:
      "Ensaios editoriais sobre tecnologia, geopolítica, xadrez, arte, cultura e musicalidade.",
    site: context.site,
    items: posts.map((post) => {
      const slug = slugify(post.data.title);
      return {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${slug}/`,
    };
    }),
  });
}
