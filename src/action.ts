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

export function isProductionRef(): boolean {
  const REF_NAME = process.env.GITHUB_REF_NAME;
  const REF_TYPE = process.env.GITHUB_REF_TYPE;

  if (REF_TYPE === 'branch' && REF_NAME && (REF_NAME === 'main' || REF_NAME.match(/release\/*/))) {
    return true;
  }

  if (REF_TYPE === 'tag') {
    return true;

    // Get all branches: https://api.github.com/repos/alehechka/gha-playground/branches (JS: https://docs.github.com/en/rest/reference/branches#list-branches)
    // Retrieve timestamp from commit with: https://api.github.com/repos/alehechka/gha-playground/commits?sha=9289e8b99214c3fbe4da65a57cfd221bcc06ae2d&per_page=1 (JS: https://docs.github.com/en/rest/reference/commits#list-commits)
    // Check each branch at exact time and check if there is a record with matching sha: https://api.github.com/repos/alehechka/gha-playground/commits?sha=main&since=2022-04-01T20:44:51Z&until=2022-04-01T20:44:51Z
  }

  return false;
}
