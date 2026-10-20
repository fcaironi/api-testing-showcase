import type { AxiosInstance } from 'axios';
import type { Comment, Post } from '../schemas';

export type NewPost = Omit<Post, 'id'>;

/** Thin typed wrapper over the /posts resource. No assertions here: those belong to the tests. */
export class PostsApi {
  constructor(private readonly http: AxiosInstance) {}

  list(params?: { userId?: number }) {
    return this.http.get<Post[]>('/posts', { params });
  }

  get(id: number | string) {
    return this.http.get<Post>(`/posts/${id}`);
  }

  create(body: NewPost) {
    return this.http.post<Post>('/posts', body);
  }

  replace(id: number, body: Post) {
    return this.http.put<Post>(`/posts/${id}`, body);
  }

  update(id: number, body: Partial<NewPost>) {
    return this.http.patch<Post>(`/posts/${id}`, body);
  }

  remove(id: number) {
    return this.http.delete<Record<string, never>>(`/posts/${id}`);
  }

  comments(id: number) {
    return this.http.get<Comment[]>(`/posts/${id}/comments`);
  }
}
