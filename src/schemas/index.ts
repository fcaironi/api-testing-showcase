import { z } from 'zod';

export const postSchema = z.object({
  userId: z.number().int(),
  id: z.number().int(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const commentSchema = z.object({
  postId: z.number().int(),
  id: z.number().int(),
  name: z.string().min(1),
  email: z.string().email(),
  body: z.string().min(1),
});

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string(),
    geo: z.object({ lat: z.string(), lng: z.string() }),
  }),
  phone: z.string(),
  website: z.string(),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string(),
  }),
});

export type Post = z.infer<typeof postSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type User = z.infer<typeof userSchema>;
