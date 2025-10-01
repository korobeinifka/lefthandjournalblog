import type { APIRoute } from 'astro';
import { execute, jsonResponse, queryOne } from '../../../../utils/db';

const notFound = () => jsonResponse({ error: 'Post not found.' }, { status: 404 });

const parseId = (params: Record<string, string | undefined>) => {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('Invalid post id');
  }
  return id;
};

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseId(params);
    const post = await queryOne(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug, u.name AS author_name, u.email AS author_email
       FROM posts p
       JOIN categories c ON c.id = p.category_id
       JOIN users u ON u.id = p.author_id
       WHERE p.id = ?`,
      [id],
    );

    if (!post) {
      return notFound();
    }

    return jsonResponse({ data: post });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Failed to fetch post.' }, { status: 400 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseId(params);
    const updates = (await request.json()) as Record<string, unknown>;

    const fields: string[] = [];
    const values: unknown[] = [];

    const allowed: Record<string, string> = {
      slug: 'slug = ?',
      status: 'status = ?',
      title: 'title = ?',
      excerpt: 'excerpt = ?',
      bodyHtml: 'body_html = ?',
      coverImageUrl: 'cover_image_url = ?',
      coverImageAlt: 'cover_image_alt = ?',
      categoryId: 'category_id = ?',
      authorId: 'author_id = ?',
      scheduledPublishAt: 'scheduled_publish_at = ?',
      publishedAt: 'published_at = ?',
    };

    for (const key of Object.keys(allowed)) {
      if (key in updates) {
        fields.push(allowed[key]);
        values.push(updates[key]);
      }
    }

    if (fields.length === 0) {
      return jsonResponse({ error: 'No valid fields supplied.' }, { status: 400 });
    }

    values.push(id);

    await execute(
      `UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values,
    );

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Failed to update post.' }, { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseId(params);

    await execute('DELETE FROM post_assets WHERE post_id = ?', [id]);
    const result = await execute('DELETE FROM posts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return notFound();
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Failed to delete post.' }, { status: 400 });
  }
};
