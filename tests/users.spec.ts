import { userSchema } from '../src/schemas';
import { expectSchema } from '../src/utils/expectSchema';
import { expect, test } from './fixtures';

test.describe('Users', () => {
  test('GET /users returns 10 users matching the contract', { tag: '@smoke' }, async ({ users }) => {
    const res = await users.list();

    await test.step('Verify there are 10 users and each matches the contract', async () => {
      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(10);
      for (const user of res.data) {
        expectSchema(userSchema, user, `user ${user.id}`);
      }
    });
  });

  test('GET /users/:id returns the requested user', async ({ users }) => {
    const res = await users.get(1);

    await test.step('Verify the user and its contract', async () => {
      expect(res.status).toBe(200);
      expect(res.data.id).toBe(1);
      expectSchema(userSchema, res.data);
    });
  });

  test('GET /users/:id responds 404 for an unknown user', async ({ users }) => {
    const res = await users.get(9999);

    await test.step('Verify the status is 404', async () => {
      expect(res.status).toBe(404);
    });
  });

  test('every post belongs to an existing user (referential integrity)', async ({ users, posts }) => {
    const [usersRes, postsRes] = await Promise.all([users.list(), posts.list()]);

    await test.step('Verify no post points to a missing author', async () => {
      const userIds = new Set(usersRes.data.map((u) => u.id));
      const orphans = postsRes.data.filter((p) => !userIds.has(p.userId));

      expect(orphans, `posts without a valid author: ${orphans.map((p) => p.id).join(', ')}`).toEqual([]);
    });
  });
});
