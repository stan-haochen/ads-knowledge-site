# ADS website maintenance

- This project deploys to **GitHub Pages**, from `main` in `stan-haochen/ads-knowledge-site`. The website output is `dist/`; it has no build step or runtime package dependencies.
- The user explicitly requests that completed website content updates be committed and pushed so GitHub Pages updates automatically. After finishing an authorized change, run `npm test`, check the relevant browser behavior, review your diff, commit the task's files, and push `main` to `origin`. Do not ask for repeated publishing approval. Honor any later instruction to pause publishing or only prepare a draft.
- Only commit files relevant to the task. Preserve other local work; never force-push or silently discard remote changes. If `main` has advanced, inspect and integrate it before pushing, or report the concrete conflict.
- The workflow `.github/workflows/pages.yml` tests every push and pull request to `main`, and deploys `dist` only after tests pass on `main`. Pull requests never publish. Verify the workflow and live page after a publishing change; a successful push alone is not a successful deployment.
- Use relative asset/module URLs so the project site works under `/ads-knowledge-site/`. Preserve hash routes such as `#avl/splay-potential`.
- Keep Student Slides, extracted source text, credentials, local browser artifacts and unrelated teaching files out of the site/repository. Only `dist` is uploaded as a Pages artifact.
- `npm test` includes execution of the first lesson's published reference code and checks algorithm invariants and potential inequalities. Browser checks accept `ADS_BASE_URL` for testing a local or deployed site.
- Maintain the distinctions between actual, amortized and expected costs, full Splay rounds and half-round animation states, and logical key replacement and physical node identity.
