import type { APIRoute } from 'astro';
import { execute, jsonResponse, queryOne } from '../../../../../utils/db';

export const POST: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return jsonResponse({ error: 'Invalid post id.' }, { status: 400 });
    }

    const original = await queryOne<any>('SELECT * FROM posts WHERE id = ?', [id]);
    if (!original) {
      return jsonResponse({ error: 'Post not found.' }, { status: 404 });
    }

    const timestamp = Date.now();
    const newSlug = `${original.slug}-copy-${timestamp}`;

    const result = await execute(
      `INSERT INTO posts (slug, status, title, excerpt, body_html, cover_image_url, cover_image_alt, category_id, author_id, scheduled_publish_at)
       VALUES (?, 'draft', ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        newSlug,
        `${original.title} (Copy)`,
        original.excerpt,
        original.body_html,
        original.cover_image_url,
        original.cover_image_alt,
        original.category_id,
        original.author_id,
      ],
    );

    return jsonResponse({ id: result.insertId, slug: newSlug }, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Failed to duplicate post.' }, { status: 500 });
  }
};
