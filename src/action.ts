import { getInput } from '@actions/core';

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

export function getRepoOwner(): string {
  return process.env.GITHUB_REPOSITORY_OWNER || '';
}

export function getRepo(): string {
  const fullRepo = process.env.GITHUB_REPOSITORY || '';
  const parts = fullRepo.split('/');

  if (parts.length === 2) {
    return parts[1];
  }

  return '';
}

export function getSha(): string {
  return process.env.GITHUB_SHA || '';
}

export function getGithubToken(): string {
  return getInput('GHA_ACCESS_TOKEN');
}

export function getRefName() {
  return process.env.GITHUB_REF_NAME;
}

type RefType = 'branch' | 'tag' | undefined;
export function getRefType(): RefType {
  return process.env.GITHUB_REF_TYPE as RefType;
}
