import { test as base, expect } from '@playwright/test';
import { epic, feature, severity, story } from 'allure-js-commons';
import { PostsApi } from '../src/api/posts';
import { UsersApi } from '../src/api/users';
import { createClient } from '../src/client/apiClient';
import { reportingAdapter } from '../src/reporting/httpReporter';

interface ApiFixtures {
  posts: PostsApi;
  users: UsersApi;
  /** Runs for every test: labels it in the report (epic, feature, story, severity). */
  reporting: void;
}

/** "posts.spec.ts" -> "Posts". */
function featureName(file: string): string {
  const name = (file.split(/[\\/]/).pop() ?? file).replace(/\.spec\.ts$/, '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export const test = base.extend<ApiFixtures>({
  reporting: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      await epic('JSONPlaceholder API');
      await feature(featureName(testInfo.file));
      // The enclosing describe block becomes the story, e.g. "GET /posts".
      const parent = testInfo.titlePath.at(-2);
      if (parent && !parent.endsWith('.ts')) await story(parent);
      await severity(testInfo.tags.includes('@smoke') ? 'critical' : 'normal');
      await use();
    },
    { auto: true },
  ],
  // eslint-disable-next-line no-empty-pattern
  posts: async ({}, use) => {
    await use(new PostsApi(createClient({ adapter: reportingAdapter() })));
  },
  // eslint-disable-next-line no-empty-pattern
  users: async ({}, use) => {
    await use(new UsersApi(createClient({ adapter: reportingAdapter() })));
  },
});

export { expect };
