import { Octokit } from 'octokit';
import { getGithubToken, getRefName, getRefType, getRepo, getRepoOwner, getSha } from './action';

export async function isProductionRef(): Promise<boolean> {
  const refName = getRefName();
  const refType = getRefType();

  if (refType === 'branch') {
    return isProductionBranch(refName);
  }

  if (refType === 'tag') {
    return await isProductionTag();
  }

  return false;
}

export function isProductionBranch(ref?: string): boolean {
  if (ref && (ref === 'main' || ref.match(/release\/*/))) {
    return true;
  }

  return false;
}

export async function isProductionTag(): Promise<boolean> {
  const octokit = new Octokit({ auth: getGithubToken() });
  const owner = getRepoOwner();
  const repo = getRepo();
  const sha = getSha();

  try {
    // Get all branch names that are valid "production" branches
    const branches = await octokit.request('GET /repos/{owner}/{repo}/branches', {
      owner,
      repo,
    });
    const branchNames = branches.data.map((branch) => branch.name).filter(isProductionBranch);
    if (branchNames.length === 0) return false;

    // Get timestamp of commit that tag is pointing to
    const commits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner,
      repo,
      sha,
      per_page: 1,
    });
    const commitDate = commits.data[0]?.commit.committer?.date;
    if (!commitDate) return false;

    // Check all valid branches for the existence of the tag sha
    // Commit timestamp is used to narrow results to only the tagged commit
    for (const branchName of branchNames) {
      const branchCommits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        sha: branchName,
        since: commitDate,
        until: commitDate,
      });
      for (const commit of branchCommits.data) {
        if (commit.sha === sha) return true;
      }
    }
  } catch (error) {
    return false;
  }

  return false;
}
