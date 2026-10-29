# Trending Now

## Real-time problem it solves

New open-source projects break out every week, but GitHub's own trending
page is opaque about ranking. Trending Now lists repositories actually
created in the last 7 days, ranked by stars, with a language filter — so you
can see what is genuinely new and gaining traction, not just what is already
famous.

## Data source

- GitHub Search API:
  `https://api.github.com/search/repositories?q=created:>DATE&sort=stars&order=desc&per_page=30`
  where DATE is computed in the browser as 7 days before today. No API key.

## How to run

No build step and no dependencies. Open `index.html` in a browser, or serve
the folder, for example:

```sh
python3 -m http.server 8000
```

then open http://localhost:8000

## Honest limits

- Unauthenticated GitHub API use is limited to 60 requests per hour. This
  page makes exactly one request per refresh (plus one per auto-refresh
  every 10 minutes) and shows the remaining quota when GitHub reports it.
  If the quota is exhausted, the page says so plainly instead of showing
  stale results.
- Star counts favour projects that are already visible; a high rank is not
  proof of quality, security, or maintenance.
- The language filter only covers languages present in the 30 returned
  repositories.
- If the request fails, the page shows an error and no repositories rather
  than old or invented ones.
