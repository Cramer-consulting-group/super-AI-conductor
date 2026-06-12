// tools/github.js
// GitHub REST API helpers using @octokit/rest

const { Octokit } = require("@octokit/rest");

function getOctokit() {
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not set");
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

function getRepo() {
  return {
    owner: process.env.GITHUB_OWNER,
    repo:  process.env.GITHUB_REPO,
  };
}

/**
 * listIssues() - returns open issues for the configured repo
 */
async function listIssues(state = "open") {
  const octokit = getOctokit();
  const { owner, repo } = getRepo();
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state,
    per_page: 50,
  });
  return data.map((i) => ({
    number:   i.number,
    title:    i.title,
    state:    i.state,
    html_url: i.html_url,
    created:  i.created_at,
  }));
}

/**
 * postComment(issueNumber, body) - posts a comment on an issue
 */
async function postComment(issueNumber, body) {
  const octokit = getOctokit();
  const { owner, repo } = getRepo();
  const { data } = await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
  return { id: data.id, html_url: data.html_url, created_at: data.created_at };
}

module.exports = { listIssues, postComment };
