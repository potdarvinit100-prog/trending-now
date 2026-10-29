"use strict";

// Trending open-source repos created in the last 7 days, via the GitHub
// Search API (no key). Unauthenticated quota is 60 requests/hour; this
// page makes one request per refresh and reports the remaining quota.
const languageSelect = document.getElementById("language");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const summaryEl = document.getElementById("summary");
const listEl = document.getElementById("list");
const sourceLineEl = document.getElementById("sourceLine");

let allRepos = [];

function sevenDaysAgo() {
  const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function render() {
  const language = languageSelect.value;
  const repos = language
    ? allRepos.filter((r) => r.language === language)
    : allRepos;
  listEl.textContent = "";
  summaryEl.textContent = repos.length === 0
    ? "No repositories match this language filter in the current result set."
    : "Showing " + repos.length + " of " + allRepos.length +
      " repositories created since " + sevenDaysAgo() +
      (language ? " (language: " + language + ")" : "") + ".";
  for (const repo of repos) {
    const item = document.createElement("li");

    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = repo.full_name;
    title.appendChild(link);
    item.appendChild(title);

    const desc = document.createElement("p");
    desc.className = "desc";
    desc.textContent = repo.description || "No description provided.";
    item.appendChild(desc);

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent =
      "★ " + repo.stargazers_count.toLocaleString("en-US") +
      " · Forks " + repo.forks_count.toLocaleString("en-US") +
      " · Language: " + (repo.language || "Not specified") +
      " · Created " + new Date(repo.created_at).toLocaleDateString();
    item.appendChild(meta);

    listEl.appendChild(item);
  }
}

function rebuildLanguageOptions() {
  const current = languageSelect.value;
  const languages = [...new Set(
    allRepos.map((r) => r.language).filter(Boolean)
  )].sort();
  languageSelect.textContent = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "All languages";
  languageSelect.appendChild(all);
  for (const language of languages) {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    languageSelect.appendChild(option);
  }
  languageSelect.value = languages.includes(current) ? current : "";
}

async function load() {
  statusEl.textContent = "Loading live data…";
  errorEl.hidden = true;
  try {
    const url = "https://api.github.com/search/repositories?q=created:>" +
      sevenDaysAgo() + "&sort=stars&order=desc&per_page=30";
    const res = await fetch(url);
    const remaining = res.headers.get("x-ratelimit-remaining");
    const reset = res.headers.get("x-ratelimit-reset");
    if (res.status === 403) {
      const resetText = reset
        ? " Quota resets at " + new Date(parseInt(reset, 10) * 1000).toLocaleTimeString() + "."
        : "";
      throw new Error("GitHub API rate limit reached (60 requests/hour without sign-in)." + resetText);
    }
    if (!res.ok) throw new Error("API returned HTTP " + res.status);
    const data = await res.json();
    if (!data || !Array.isArray(data.items)) {
      throw new Error("Unexpected API response");
    }
    allRepos = data.items;
    rebuildLanguageOptions();
    render();
    statusEl.textContent = "Live data loaded.";
    sourceLineEl.textContent =
      "Source: GitHub Search API (created:>" + sevenDaysAgo() + ", sorted by stars)." +
      (remaining !== null ? " Remaining unauthenticated quota: " + remaining + "/hour." : "") +
      " Page last updated: " + new Date().toLocaleString() + ".";
  } catch (err) {
    listEl.textContent = "";
    summaryEl.textContent = "";
    errorEl.hidden = false;
    errorEl.textContent = "Could not load live data from GitHub (" + err.message +
      "). No repositories are shown rather than old or invented ones. Check your connection and try Refresh.";
    statusEl.textContent = "Live data unavailable.";
  }
}

languageSelect.addEventListener("change", render);
document.getElementById("refresh").addEventListener("click", load);
load();
setInterval(load, 10 * 60 * 1000);
