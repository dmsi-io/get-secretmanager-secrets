import { getInput } from '@actions/core';
import { Octokit } from 'octokit';

export function getProjectID(): string {
  return (
    process.env.GCP_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.CLOUDSDK_CORE_PROJECT ||
    process.env.CLOUDSDK_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    ''
  );
}

function getRepoOwner(): string {
  return process.env.GITHUB_REPOSITORY_OWNER || '';
}

function getRepo(): string {
  const fullRepo = process.env.GITHUB_REPOSITORY || '';
  const parts = fullRepo.split('/');

  if (parts.length === 2) {
    return parts[1];
  }

  return '';
}

function getSha(): string {
  return process.env.GITHUB_SHA || '';
}

function isProdRef(ref?: string): boolean {
  if (ref && (ref === 'main' || ref.match(/release\/*/))) {
    return true;
  }

  return false;
}

export async function isProductionRef(): Promise<boolean> {
  const REF_NAME = process.env.GITHUB_REF_NAME;
  const REF_TYPE = process.env.GITHUB_REF_TYPE;

  if (REF_TYPE === 'branch' && isProdRef(REF_NAME)) {
    return true;
  }

  if (REF_TYPE === 'tag') {
    const octokit = new Octokit({ auth: getInput('GHA_ACCESS_TOKEN') });
    const owner = getRepoOwner();
    const repo = getRepo();
    const sha = getSha();

    try {
      const branches = await octokit.request('GET /repos/{owner}/{repo}/branches', {
        owner,
        repo,
      });
      const branchNames = branches.data.map((branch) => branch.name).filter(isProdRef);

      const commits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        sha,
        per_page: 1,
      });
      const commitDate = commits.data[0]?.commit.committer?.date;
      if (!commitDate) return false;

      for (const branchName of branchNames) {
        const branchCommits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
          owner,
          repo,
          sha: branchName,
          per_page: 1,
          since: commitDate,
          until: commitDate,
        });
        if (branchCommits.data.length === 0) continue;
        if (branchCommits.data[0].sha === sha) return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  return false;
}
