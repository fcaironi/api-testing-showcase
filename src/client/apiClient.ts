import axios, { type AxiosAdapter, type AxiosInstance } from 'axios';

export interface ClientOptions {
  baseURL?: string;
  /** Replaces axios' default transport, e.g. to record every call in the test report. */
  adapter?: AxiosAdapter;
}

/**
 * Axios instance used by every API wrapper.
 * `validateStatus: () => true` makes axios resolve for ANY status code, so tests can
 * assert on 4xx/5xx responses explicitly instead of catching thrown errors.
 */
export function createClient({
  baseURL = process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
  adapter,
}: ClientOptions = {}): AxiosInstance {
  return axios.create({
    baseURL,
    adapter,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    validateStatus: () => true,
  });
}
