/**
 * Minimal offline stand-in for the subset of JSONPlaceholder used by the tests.
 * Lets the suite run deterministically with no network (local dev and CI): `npm run test:mock`.
 * It mirrors the real API's behaviour: writes are echoed back but never persisted.
 */
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 4010);

type Json = Record<string, unknown>;

const posts = Array.from({ length: 100 }, (_, i) => ({
  userId: Math.floor(i / 10) + 1,
  id: i + 1,
  title: `mock post title ${i + 1}`,
  body: `mock post body ${i + 1}`,
}));

const users = Array.from({ length: 10 }, (_, i) => {
  const id = i + 1;
  return {
    id,
    name: `User ${id}`,
    username: `user${id}`,
    email: `user${id}@example.com`,
    address: {
      street: `Street ${id}`,
      suite: `Suite ${id}`,
      city: `City ${id}`,
      zipcode: `0000${id}`,
      geo: { lat: '0.0000', lng: '0.0000' },
    },
    phone: `555-000${id}`,
    website: `user${id}.example.com`,
    company: { name: `Company ${id}`, catchPhrase: 'Mock catch phrase', bs: 'mock bs' },
  };
});

const comments = posts.flatMap((post) =>
  Array.from({ length: 5 }, (_, j) => ({
    postId: post.id,
    id: (post.id - 1) * 5 + j + 1,
    name: `comment ${j + 1} on post ${post.id}`,
    email: `commenter${j + 1}@example.com`,
    body: `mock comment body ${j + 1}`,
  })),
);

function send(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function readBody(req: http.IncomingMessage): Promise<Json> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Json;
  } catch {
    return {};
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const [resource, rawId, sub] = url.pathname.split('/').filter(Boolean);
  const method = req.method ?? 'GET';
  const id = rawId !== undefined && /^\d+$/.test(rawId) ? Number(rawId) : undefined;

  if (resource === 'posts') {
    if (rawId === undefined) {
      if (method === 'GET') {
        const userId = url.searchParams.get('userId');
        return send(res, 200, userId ? posts.filter((p) => String(p.userId) === userId) : posts);
      }
      if (method === 'POST') {
        return send(res, 201, { ...(await readBody(req)), id: posts.length + 1 });
      }
    } else {
      const post = id !== undefined ? posts.find((p) => p.id === id) : undefined;
      if (post) {
        if (sub === 'comments' && method === 'GET') {
          return send(res, 200, comments.filter((c) => c.postId === post.id));
        }
        if (sub === undefined) {
          if (method === 'GET') return send(res, 200, post);
          if (method === 'PUT') return send(res, 200, { ...(await readBody(req)), id: post.id });
          if (method === 'PATCH') return send(res, 200, { ...post, ...(await readBody(req)) });
          if (method === 'DELETE') return send(res, 200, {});
        }
      }
    }
  }

  if (resource === 'users' && method === 'GET') {
    if (rawId === undefined) return send(res, 200, users);
    const user = id !== undefined ? users.find((u) => u.id === id) : undefined;
    if (user) return send(res, 200, user);
  }

  return send(res, 404, {});
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock API listening on http://127.0.0.1:${PORT}`);
});
