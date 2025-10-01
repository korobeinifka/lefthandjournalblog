import type { APIRoute } from 'astro';
import { jsonResponse, queryOne } from '../../../../../utils/db';

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return jsonResponse({ error: 'Invalid post id.' }, { status: 400 });
    }

    const post = await queryOne(
      `SELECT p.*, u.name AS author_name, u.email AS author_email, c.slug AS category_slug
       FROM posts p
       JOIN users u ON u.id = p.author_id
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [id],
    );

    if (!post) {
      return jsonResponse({ error: 'Post not found.' }, { status: 404 });
    }

    return jsonResponse({ data: post });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Failed to load preview.' }, { status: 500 });
  }
};
