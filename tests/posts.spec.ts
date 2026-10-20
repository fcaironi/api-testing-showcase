import { commentSchema, postSchema } from '../src/schemas';
import { expectSchema } from '../src/utils/expectSchema';
import { expect, test } from './fixtures';

test.describe('GET /posts', () => {
  test('returns the whole collection, each item matching the contract', { tag: '@smoke' }, async ({ posts }) => {
    const res = await posts.list();

    await test.step('Verify status and content type', async () => {
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
    });
    await test.step('Verify there are 100 posts with unique ids', async () => {
      expect(res.data).toHaveLength(100);
      expect(new Set(res.data.map((p) => p.id)).size).toBe(100);
    });
    await test.step('Verify every post matches the contract', async () => {
      for (const post of res.data) {
        expectSchema(postSchema, post, `post ${post.id}`);
      }
    });
  });

  test('filters by userId', async ({ posts }) => {
    const res = await posts.list({ userId: 3 });

    await test.step('Verify only the posts of user 3 are returned', async () => {
      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(10);
      expect(res.data.every((p) => p.userId === 3)).toBe(true);
    });
  });

  test('returns an empty list for a userId with no posts', async ({ posts }) => {
    const res = await posts.list({ userId: 999 });

    await test.step('Verify the list is empty', async () => {
      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });
  });
});

test.describe('GET /posts/:id', () => {
  test('returns a single post', { tag: '@smoke' }, async ({ posts }) => {
    const res = await posts.get(1);

    await test.step('Verify the post and its contract', async () => {
      expect(res.status).toBe(200);
      expect(res.data.id).toBe(1);
      expectSchema(postSchema, res.data);
    });
  });

  for (const id of [0, 101, 9999, 'abc']) {
    test(`responds 404 for unknown id "${id}"`, async ({ posts }) => {
      const res = await posts.get(id);

      await test.step('Verify the status is 404', async () => {
        expect(res.status).toBe(404);
      });
    });
  }

  test('returns the comments that belong to the post', async ({ posts }) => {
    const res = await posts.comments(1);

    await test.step('Verify the 5 comments belong to post 1 and match the contract', async () => {
      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(5);
      for (const comment of res.data) {
        expect(comment.postId).toBe(1);
        expectSchema(commentSchema, comment, `comment ${comment.id}`);
      }
    });
  });
});

test.describe('Write operations', () => {
  const payload = { userId: 1, title: 'Regression suites that stay green', body: 'Stable locators, no sleeps.' };

  test('POST creates a post and echoes the payload with a new id', { tag: '@smoke' }, async ({ posts }) => {
    const res = await posts.create(payload);

    await test.step('Verify 201 and the echoed payload', async () => {
      expect(res.status).toBe(201);
      expect(res.data).toMatchObject(payload);
      expect(res.data.id).toEqual(expect.any(Number));
    });
  });

  test('PUT replaces the whole resource', async ({ posts }) => {
    const replacement = { ...payload, id: 1 };
    const res = await posts.replace(1, replacement);

    await test.step('Verify the resource was replaced', async () => {
      expect(res.status).toBe(200);
      expect(res.data).toMatchObject(replacement);
    });
  });

  test('PATCH changes only the sent fields', async ({ posts }) => {
    const res = await posts.update(1, { title: 'patched title' });

    await test.step('Verify the title changed and the other fields did not', async () => {
      expect(res.status).toBe(200);
      expect(res.data.title).toBe('patched title');
      expect(res.data.id).toBe(1);
      expect(res.data.userId).toBe(1);
      expect(res.data.body).toEqual(expect.any(String));
    });
  });

  test('DELETE responds 200 with an empty object', async ({ posts }) => {
    const res = await posts.remove(1);

    await test.step('Verify 200 and an empty body', async () => {
      expect(res.status).toBe(200);
      expect(res.data).toEqual({});
    });
  });
});
