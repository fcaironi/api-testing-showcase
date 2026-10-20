import type { AxiosInstance } from 'axios';
import type { User } from '../schemas';

export class UsersApi {
  constructor(private readonly http: AxiosInstance) {}

  list() {
    return this.http.get<User[]>('/users');
  }

  get(id: number | string) {
    return this.http.get<User>(`/users/${id}`);
  }
}
