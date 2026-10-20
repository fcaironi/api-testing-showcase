import { test } from '@playwright/test';
import axios, { type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const SENSITIVE_HEADERS = /^(authorization|proxy-authorization|cookie|set-cookie|x-api-key)$/i;

/** Plain copy of a headers object with secrets masked, so tokens never reach the report. */
function safeHeaders(headers: unknown): Record<string, unknown> {
  const plain = JSON.parse(JSON.stringify(headers ?? {})) as Record<string, unknown>;
  for (const name of Object.keys(plain)) {
    if (SENSITIVE_HEADERS.test(name)) plain[name] = '***';
  }
  return plain;
}

/** Request bodies reach the adapter already serialized; show them as JSON when possible. */
function parseBody(data: unknown): unknown {
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

async function attachJson(name: string, content: unknown): Promise<void> {
  await test.info().attach(name, {
    body: JSON.stringify(content, null, 2),
    contentType: 'application/json',
  });
}

/**
 * Axios adapter that records every HTTP call in the report: one step per call
 * ("GET /posts?userId=3") with the request and the response as expandable attachments.
 */
export function reportingAdapter(): AxiosAdapter {
  const send = axios.getAdapter('http');

  return (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const method = (config.method ?? 'get').toUpperCase();
    const path = axios.getUri({ url: config.url, params: config.params, paramsSerializer: config.paramsSerializer });

    return test.step(`${method} ${path}`, async () => {
      await attachJson('Request', {
        method,
        url: `${config.baseURL ?? ''}${path}`,
        headers: safeHeaders(config.headers),
        body: parseBody(config.data),
      });

      const startedAt = Date.now();
      const response = await send(config);

      await attachJson(`Response ${response.status} ${response.statusText} (${Date.now() - startedAt} ms)`, {
        status: response.status,
        headers: safeHeaders(response.headers),
        body: response.data,
      });
      return response;
    });
  };
}
