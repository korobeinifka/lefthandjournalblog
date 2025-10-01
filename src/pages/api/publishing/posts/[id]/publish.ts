import type { APIRoute } from 'astro';
import { execute, jsonResponse } from '../../../../../utils/db';

type PublishPayload = {
  publish: boolean;
  scheduledPublishAt?: string | null;
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return jsonResponse({ error: 'Invalid post id.' }, { status: 400 });
    }

    const body = (await request.json()) as PublishPayload;
    const nextStatus = body.publish ? 'published' : 'draft';
    const scheduled = body.publish ? body.scheduledPublishAt ?? null : null;

    await execute(
      `UPDATE posts SET status = ?, scheduled_publish_at = ?, updated_at = CURRENT_TIMESTAMP${
        body.publish ? ', published_at = COALESCE(published_at, NOW())' : ''
      } WHERE id = ?`,
      [nextStatus, scheduled, id],
    );

    return jsonResponse({ success: true, status: nextStatus, scheduledPublishAt: scheduled });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Failed to update publish state.' }, { status: 500 });
  }
};
