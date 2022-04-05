<!--
Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# get-secretmanager-secrets

This action fetches secrets from [Secret Manager][sm] and makes them available
to later build steps via outputs. This is useful when you want Secret Manager to
be the source of truth for secrets in your organization, but you need access to
those secrets in build steps.

Secrets that are successfully fetched are set as output variables and can be
used in subsequent actions. After a secret is accessed, its value is added to
the mask of the build to reduce the chance of it being printed or logged by
later steps.

## Prerequisites

- This action requires Google Cloud credentials that are authorized to access
  the secrets being requested. See the Authorization section below for more
  information.

- This action runs using Node 16. If you are using self-hosted GitHub Actions
  runners, you must use runner version [2.285.0](https://github.com/actions/virtual-environments)
  or newer.

## Usage

#### Environment Secrets Usage

This GitHub Action has been bootstrapped to be a new and improved version of [gha-secret-manager][gha-original]. This time it has been forked from an existing repo so it now is coded with TypeScript and will support Workload Identity Federation.

The purpose of the original action was to facilitate environmental secrets based on branching/tagging strategy. This functionality has been added to this GHA in the form of a new optional input: `env_secrets`. More on this [below](#environment-secrets).

```yaml
jobs:
  job_id:
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - id: 'auth'
        uses: 'google-github-actions/auth@v0'
        with:
          workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
          service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

      - id: 'secrets'
        uses: 'google-github-actions/get-secretmanager-secrets@v0'
        with:
          env_secrets: |-
            token:SECRET_TOKEN
            OTHER_SECRET_TOKEN

      # Example of using the output
      - id: 'publish'
        uses: 'foo/bar@master'
        env:
          TOKEN: '${{ steps.secrets.outputs.token }}'
          OTHER_TOKEN: '${{ steps.secrets.outputs.OTHER_SECRET_TOKEN }}
```

Environment Secrets heavily rely on `google-github-actions/auth@v0` to be run first to establish the `GCP_PROJECT` environment variable, which is then used to build the secret path.

Additionally, secrets can be retrieved by name only and will be outputted as such. Or as a colon `:` separated list where the first value is the output name and the second is the requested secret name.

The list of secrets can be either a comma or newline separated list.

#### Original Usage

This action is forked from [get-secretmanager-secrets][gha] and thus retains the original functionality outlined below:

```yaml
jobs:
  job_id:
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - id: 'auth'
        uses: 'google-github-actions/auth@v0'
        with:
          workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
          service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

      - id: 'secrets'
        uses: 'google-github-actions/get-secretmanager-secrets@v0'
        with:
          secrets: |-
            token:my-project/docker-registry-token

      # Example of using the output
      - id: 'publish'
        uses: 'foo/bar@master'
        env:
          TOKEN: '${{ steps.secrets.outputs.token }}'
```

## Inputs

- `secrets`: (Required) The list of secrets to access and inject into the
  environment. Due to limitations with GitHub Actions inputs, this is
  specified as a string.

  You can specify multiple secrets by putting each secret on its own line:

  ```yaml
  secrets: |-
    output1:my-project/my-secret1
    output2:my-project/my-secret2
  ```

  Secrets can be referenced using the following formats:

  ```text
  # Long form
  projects/<project-id>/secrets/<secret-id>/versions/<version-id>

  # Long form - "latest" version
  projects/<project-id>/secrets/<secret-id>

  # Short form
  <project-id>/<secret-id>/<version-id>

  # Short form - "latest" version
  <project-id>/<secret-id>
  ```

- `credentials`: (**Deprecated**) This input is deprecated. See [auth section](https://github.com/google-github-actions/get-secretmanager-secrets#via-google-github-actionsauth) for more details.
  [Google Service Account JSON][sa] credentials,
  typically sourced from a [GitHub Secret][gh-secret].

## Outputs

Each secret is prefixed with an output name. The secret's resolved access value
will be available at that output in future build steps.

For example:

```yaml
jobs:
  job_id:
    steps:
      - id: 'secrets'
        uses: 'google-github-actions/get-secretmanager-secrets@v0'
        with:
          secrets: |-
            token:my-project/docker-registry-token
```

will be available in future steps as the output "token":

```yaml
# other step
- id: 'publish'
  uses: 'foo/bar@master'
  env:
    TOKEN: '${{ steps.secrets.outputs.token }}'
```

## Authorization

There are a few ways to authenticate this action. The caller must have
permissions to access the secrets being requested.

### Via google-github-actions/auth

Use [google-github-actions/auth](https://github.com/google-github-actions/auth) to authenticate the action. You can use [Workload Identity Federation][wif] or traditional [Service Account Key JSON][sa] authentication.
by specifying the `credentials` input. This Action supports both the recommended [Workload Identity Federation][wif] based authentication and the traditional [Service Account Key JSON][sa] based auth.

See [usage](https://github.com/google-github-actions/auth#usage) for more details.

#### Authenticating via Workload Identity Federation

```yaml
jobs:
  job_id:
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - uses: 'actions/checkout@v3'

      - id: 'auth'
        uses: 'google-github-actions/auth@v0'
        with:
          workload_identity_provider: 'projects/123456789/locations/global/workloadIdentityPools/my-pool/providers/my-provider'
          service_account: 'my-service-account@my-project.iam.gserviceaccount.com'

      - id: 'secrets'
        uses: 'google-github-actions/get-secretmanager-secrets@v0'
        with:
          secrets: |-
            token:my-project/docker-registry-token
```

#### Authenticating via Service Account Key JSON

```yaml
jobs:
  job_id:
    steps:
      - uses: 'actions/checkout@v3'

      - id: 'auth'
        uses: 'google-github-actions/auth@v0'
        with:
          credentials_json: '${{ secrets.gcp_credentials }}'

      - id: 'secrets'
        uses: 'google-github-actions/get-secretmanager-secrets@v0'
        with:
          secrets: |-
            token:my-project/docker-registry-token
```

### Environment Secrets

Secrets will be managed by GCP Secret Manager and must follow a strict naming scheme.

```
Production Secrets: PROD_[key]

Develop Secrets: DEVELOP_[key]
```

> There must exist both named versions of each key.

When requesting a desired key from this action, the key must not include the environment prefix. This action will handle the checks and balances to determine which prefix to append to the requested keys (based on branch/tag names) and will always append an environment prefix.

The general rules are that `main` and `release/*` branches are provided the `PROD` prefix. Tags where the tagged commit sha exists within a `main` or `release/*` branch will also receive the `PROD` prefix. All other branches or tags will receive the `DEVELOP` prefix.

> All outputted secrets will be masked from console logs.

```yaml
  with:
    secrets: KEY

  # multiple secrets can be supplied as a comma-separated list
  with:
    secrets: KEY, OTHER_KEY
```

[sm]: https://cloud.google.com/secret-manager
[wif]: https://cloud.google.com/iam/docs/workload-identity-federation
[sa]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[gh-runners]: https://help.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners
[gh-secret]: https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
[setup-gcloud]: https://github.com/google-github-actions/setup-gcloud
[gha-fork]: google-github-actions/get-secretmanager-secrets
[gha-original]: https://github.com/dmsi-io/gha-secret-manager
