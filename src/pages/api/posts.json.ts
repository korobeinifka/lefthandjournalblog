import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

const normalise = (value: string | undefined | null): string => {
    return value ? value.toLowerCase() : '';
};

const createExcerpt = (post: CollectionEntry<'blogs'>): string => {
    if (post.data.description) {
        return post.data.description;
    }

    const cleaned = (post.body ?? '')
        .replace(/[`*_#>\[\]]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (cleaned.length <= 160) {
        return cleaned;
    }

    return `${cleaned.slice(0, 157).trimEnd()}…`;
};

export const GET: APIRoute = async ({ url }) => {
    const query = url.searchParams.get('q')?.trim().toLowerCase() ?? '';
    const posts = await getCollection('blogs');

    const filtered = query
        ? posts.filter((post) => {
              const title = normalise(post.data.title);
              const description = normalise(post.data.description);
              const body = normalise(post.body);

              return [title, description, body].some((segment) => segment.includes(query));
          })
        : posts;

    const results = filtered
        .sort((a, b) => {
            const aDate = new Date(a.data.pubDate ?? '').getTime();
            const bDate = new Date(b.data.pubDate ?? '').getTime();
            return bDate - aDate;
        })
        .slice(0, 20)
        .map((post) => ({
            slug: post.slug,
            url: `/blog/${post.slug}`,
            title: post.data.title,
            excerpt: createExcerpt(post),
            pubDate: post.data.pubDate,
            category: post.data.category ?? null
        }));

    return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    });
};
