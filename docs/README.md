# Interactive Docs (Mintlify / GitBook)

This repo includes a starter interactive documentation structure in `docs/`:

- `docs.json` — Mintlify configuration
- `overview.mdx`, `quickstart.mdx`, `architecture.mdx`, `good-first-issues.mdx` — content pages

## Preview locally (Mintlify)

From the repository root:

```bash
npx mintlify dev docs
```

If `npx` prompts to install Mintlify, accept.

## Deploy

### Option A: Mintlify

Connect your GitHub repo in Mintlify and point it to this `docs/` folder (and `docs/docs.json`).  
After deployment, copy your docs URL and add it to the main `README.md` “Docs” link.

### Option B: GitBook

Create a GitBook space and import/copy the pages from `docs/`.  
After publishing, add the GitBook URL to the main `README.md` “Docs” link.

