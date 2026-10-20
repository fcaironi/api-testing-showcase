import { defineConfig } from 'allure';

// Builds one self-contained HTML file: open allure-report/index.html with a double click.
// No Java, no server and nothing to install to read the report.
export default defineConfig({
  name: 'API Testing Showcase',
  output: './allure-report',
  historyPath: './allure-history.jsonl',
  plugins: {
    awesome: {
      options: {
        singleFile: true,
        reportLanguage: 'en',
        // Feature > story (the describe block) > test.
        groupBy: ['feature', 'story'],
        stepTreeExpansion: 'expanded',
      },
    },
  },
});
