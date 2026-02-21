name: CI — Build, Test & Lighthouse

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

permissions:
  contents: read
  pull-requests: write

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter (TypeScript type check)
        run: npx tsc -b --noEmit

      - name: Run tests
        run: npm run test

      - name: Build production bundle
        run: npm run build

      - name: Upload build artifacts
        if: matrix.node-version == 22
        uses: actions/upload-artifact@v4
        with:
          name: dist-build
          path: dist/
          retention-days: 7

  lighthouse:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: dist-build
          path: dist/

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Lighthouse CI
        run: npm install -g @lhci/cli

      - name: Run Lighthouse CI
        run: |
          lhci autorun \
            --collect.staticDistDir=./dist \
            --collect.numberOfRuns=3 \
            --assert.preset=lighthouse:recommended \
            --assert.assertions.categories:performance=off \
            --assert.assertions.categories:accessibility=warn \
            --assert.assertions.categories:best-practices=warn \
            --assert.assertions.categories:seo=off \
            --upload.target=temporary-public-storage
        env:
          LHCI_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Comment Lighthouse results on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = require('path');

            // Find Lighthouse report
            const lhciDir = '.lighthouseci';
            if (!fs.existsSync(lhciDir)) {
              console.log('No Lighthouse results found');
              return;
            }

            const manifests = fs.readdirSync(lhciDir).filter(f => f.endsWith('.json') && f.startsWith('lhr-'));
            if (manifests.length === 0) return;

            const latest = JSON.parse(fs.readFileSync(path.join(lhciDir, manifests[manifests.length - 1]), 'utf8'));
            const cats = latest.categories;

            const scores = [
              `| Performance | ${Math.round((cats.performance?.score || 0) * 100)} |`,
              `| Accessibility | ${Math.round((cats.accessibility?.score || 0) * 100)} |`,
              `| Best Practices | ${Math.round((cats['best-practices']?.score || 0) * 100)} |`,
              `| SEO | ${Math.round((cats.seo?.score || 0) * 100)} |`,
            ].join('\n');

            const body = `## 🔦 Lighthouse Report\n\n| Category | Score |\n|---|---|\n${scores}\n\n_Generated from ${manifests.length} run(s)_`;

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body,
            });
