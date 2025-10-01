import type { APIRoute } from 'astro';
import { execute, jsonResponse, query } from '../../../utils/db';

type PostPayload = {
  slug: string;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  title: string;
  excerpt?: string | null;
  bodyHtml: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  categoryId: number;
  authorId: number;
  scheduledPublishAt?: string | null;
};

const parseNumber = (value: string | null, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const limit = parseNumber(url.searchParams.get('limit'), 20);
    const offset = parseNumber(url.searchParams.get('offset'), 0);

    const filters: string[] = [];
    const params: unknown[] = [];

    if (status) {
      if (status === 'published') {
        filters.push(
          "(p.status = 'published' AND (p.scheduled_publish_at IS NULL OR p.scheduled_publish_at <= NOW()))",
        );
      } else {
        filters.push('p.status = ?');
        params.push(status);
      }
    }

    if (category) {
      const categoryId = Number(category);
      if (Number.isFinite(categoryId)) {
        filters.push('p.category_id = ?');
        params.push(categoryId);
      } else {
        filters.push('c.slug = ?');
        params.push(category);
      }
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const rows = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug, u.name AS author_name
       FROM posts p
       JOIN categories c ON c.id = p.category_id
       JOIN users u ON u.id = p.author_id
       ${whereClause}
       ORDER BY p.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return jsonResponse({ data: rows });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Failed to fetch posts.' }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = (await request.json()) as PostPayload;

    if (!payload.slug || !payload.title || !payload.bodyHtml) {
      return jsonResponse({ error: 'slug, title, and bodyHtml are required.' }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO posts (slug, status, title, excerpt, body_html, cover_image_url, cover_image_alt, category_id, author_id, scheduled_publish_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.slug,
        payload.status ?? 'draft',
        payload.title,
        payload.excerpt ?? null,
        payload.bodyHtml,
        payload.coverImageUrl ?? null,
        payload.coverImageAlt ?? null,
        payload.categoryId,
        payload.authorId,
        payload.scheduledPublishAt ?? null,
      ],
    );

    return jsonResponse({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Failed to create post.' }, { status: 500 });
  }
};
