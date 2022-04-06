import 'mocha';
import { expect } from 'chai';

import {
  getProjectID,
  getRepoOwner,
  getGithubToken,
  getRefName,
  getRefType,
  getRepo,
  getSha,
} from '../src/action';

describe('Action', () => {
  it('gets projectID from env', () => {
    process.env.GCP_PROJECT = 'my-project';
    let projectID = getProjectID();
    expect(projectID).equal('my-project');

    process.env.GCP_PROJECT = '';
    projectID = getProjectID();
    expect(projectID).equal('');
  });

  it('gets repo owner', () => {
    process.env.GITHUB_REPOSITORY_OWNER = 'dmsi-io';
    let repoOwner = getRepoOwner();
    expect(repoOwner).equal('dmsi-io');

    process.env.GITHUB_REPOSITORY_OWNER = '';
    repoOwner = getRepoOwner();
    expect(repoOwner).equal('');
  });

  it('gets repo name', () => {
    process.env.GITHUB_REPOSITORY = 'dmsi-io/gha-secret-manager-env';
    let repo = getRepo();
    expect(repo).equal('gha-secret-manager-env');

    process.env.GITHUB_REPOSITORY = 'gha-secret-manager-env';
    repo = getRepo();
    expect(repo).equal('');

    process.env.GITHUB_REPOSITORY = '';
    repo = getRepo();
    expect(repo).equal('');
  });

  it('gets sha', () => {
    process.env.GITHUB_SHA = 'abc1234';
    let sha = getSha();
    expect(sha).equal('abc1234');

    process.env.GITHUB_SHA = '';
    sha = getSha();
    expect(sha).equal('');
  });

  it('gets github token', () => {
    process.env.INPUT_GHA_ACCESS_TOKEN = 'token';
    let token = getGithubToken();
    expect(token).equal('token');

    process.env.INPUT_GHA_ACCESS_TOKEN = '';
    token = getGithubToken();
    expect(token).equal('');
  });

  it('gets ref name', () => {
    process.env.GITHUB_REF_NAME = 'main';
    let refName = getRefName();
    expect(refName).equal('main');

    process.env.GITHUB_REF_NAME = '';
    refName = getRefName();
    expect(refName).equal('');
  });

  it('gets ref type', () => {
    process.env.GITHUB_REF_TYPE = 'branch';
    let refType = getRefType();
    expect(refType).equal('branch');

    process.env.GITHUB_REF_TYPE = 'tag';
    refType = getRefType();
    expect(refType).equal('tag');

    process.env.GITHUB_REF_TYPE = '';
    refType = getRefType();
    expect(refType).equal('');
  });
});
