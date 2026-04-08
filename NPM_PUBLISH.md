# Publishing amazon-store to npm

This document describes how to publish the `amazon-store` package to the
[npm registry](https://www.npmjs.com/).

---

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18 and npm ≥ 8 installed locally.
- An [npmjs.com](https://www.npmjs.com/) account with publish rights to the
  `amazon-store` package (or the scoped name you choose, e.g.
  `@davorg/amazon-store`).
- Two-factor authentication (2FA) enabled on your npm account — npm requires
  it for publishing.

---

## One-time setup

### 1. Verify / update `package.json`

Make sure the `repository` field points to the real GitHub URL:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/davorg/amazon-store.git"
},
```

Also confirm the `name` field is the package name you want on npm.  If
`amazon-store` is already taken you may need a scoped name such as
`@davorg/amazon-store`.

### 2. Log in to npm

```bash
npm login
```

Follow the prompts (username, password, OTP).  Verify with:

```bash
npm whoami
```

---

## Manual publish

### 1. Install dependencies

```bash
npm ci
```

### 2. Build the distribution files

```bash
npm run build
```

This runs `rollup` and `terser` to produce the UMD and ESM bundles under
`dist/`.

### 3. Inspect what will be published

```bash
npm pack --dry-run
```

Check that only the expected files are listed (i.e. those in the `"files"`
array in `package.json`: `dist/`, `README.md`, `CHANGELOG.md`, `LICENSE`).

You can also create the tarball locally and inspect it:

```bash
npm pack
tar -tzf amazon-store-*.tgz
rm  amazon-store-*.tgz        # clean up
```

### 4. Bump the version

Use the built-in `npm version` command to update `package.json`,
`package-lock.json`, and create an annotated git tag in one step:

```bash
# patch release  (1.2.0 → 1.2.1)
npm version patch -m "chore: release %s"

# minor release  (1.2.0 → 1.3.0)
npm version minor -m "chore: release %s"

# major release  (1.2.0 → 2.0.0)
npm version major -m "chore: release %s"
```

### 5. Publish

```bash
npm publish --access public
```

> **Pre-releases** — add a dist-tag so the `latest` pointer is not moved:
>
> ```bash
> npm version 1.3.0-rc.0
> npm publish --tag next --access public
> ```
>
> Promote a pre-release to `latest` once it is stable:
>
> ```bash
> npm dist-tag add amazon-store@1.3.0 latest
> ```

### 6. Push the tag to GitHub

```bash
git push origin main --follow-tags
```

Then [create a GitHub Release](https://github.com/davorg/amazon-store/releases/new)
from that tag so the CDN workflow also fires.

---

## Automated publishing via GitHub Actions

Add the following workflow file as `.github/workflows/npm-publish.yml` to
publish automatically whenever a GitHub Release is published.

### Add the npm token secret

1. Generate a publish token on npmjs.com:
   **Account → Access Tokens → Generate New Token → Automation**.
2. In this repository go to **Settings → Secrets and variables → Actions**
   and create a secret named **`NPM_TOKEN`** with the token value.

### Workflow file

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write   # required for npm provenance

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish
        run: npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

> **Note on provenance** — the `--provenance` flag links the published package
> to this repository and the specific GitHub Actions run that produced it.
> It requires `id-token: write` permission and npm ≥ 9.5.

---

## Release checklist

- [ ] All changes merged to `main`.
- [ ] `CHANGELOG.md` updated with the new version and date.
- [ ] `npm run build` succeeds locally.
- [ ] `npm pack --dry-run` lists only the expected files.
- [ ] `npm version <patch|minor|major>` run (updates `package.json` and creates
  git tag).
- [ ] `git push origin main --follow-tags` pushed.
- [ ] GitHub Release created from the new tag.
- [ ] CDN workflow ([Publish to CDN](.github/workflows/release-to-cdn.yml))
  triggered and PR merged in the CDN repo.
- [ ] npm publish workflow triggered and package visible on
  [npmjs.com/package/amazon-store](https://www.npmjs.com/package/amazon-store).
