import 'mocha';
import { expect } from 'chai';

import { isProductionBranch, isProductionRef, isProductionTag } from '../src/production';

describe('Production', () => {
  it('main branch is prod', () => {
    const isProdBranch = isProductionBranch('main');
    expect(isProdBranch).equal(true);
  });

  it('release branch is prod', () => {
    const isProdBranch = isProductionBranch('release/v1.2.3');
    expect(isProdBranch).equal(true);
  });

  it('feature branch is not prod', () => {
    const isProdBranch = isProductionBranch('feature/JIRA-123');
    expect(isProdBranch).equal(false);
  });

  it('main branch ref is prod', async () => {
    process.env.GITHUB_REF_NAME = 'main';
    process.env.GITHUB_REF_TYPE = 'branch';
    const isProdRef = await isProductionRef();
    expect(isProdRef).equal(true);
  });

  it('release branch ref is prod', async () => {
    process.env.GITHUB_REF_NAME = 'release/v1.2.3';
    process.env.GITHUB_REF_TYPE = 'branch';
    const isProdRef = await isProductionRef();
    expect(isProdRef).equal(true);
  });

  it('feature branch ref is not prod', async () => {
    process.env.GITHUB_REF_NAME = 'feature/JIRA-123';
    process.env.GITHUB_REF_TYPE = 'branch';
    const isProdRef = await isProductionRef();
    expect(isProdRef).equal(false);
  });

  it('tag is prod', async () => {
    process.env.GITHUB_REPOSITORY_OWNER = 'dmsi-io';
    process.env.GITHUB_REPOSITORY = 'dmsi-io/gha-secret-manager-env';
    process.env.GITHUB_SHA = '1c941301b663cc2def2ed39a7bbf4c0c66d138c0';

    const isProdTag = await isProductionTag();
    expect(isProdTag).equal(true);
  });

  it('tag is not prod', async () => {
    process.env.GITHUB_REPOSITORY_OWNER = 'dmsi-io';
    process.env.GITHUB_REPOSITORY = 'dmsi-io/gha-secret-manager-env';
    process.env.GITHUB_SHA = '192ff21173cef52681f593422d0266037033b7bb';

    const isProdTag = await isProductionTag();
    expect(isProdTag).equal(false);
  });

  it('tag ref is prod', async () => {
    process.env.GITHUB_REPOSITORY_OWNER = 'dmsi-io';
    process.env.GITHUB_REPOSITORY = 'dmsi-io/gha-secret-manager-env';
    process.env.GITHUB_SHA = '1c941301b663cc2def2ed39a7bbf4c0c66d138c0';
    process.env.GITHUB_REF_NAME = 'v0.5.0';
    process.env.GITHUB_REF_TYPE = 'tag';
    const isProdRef = await isProductionRef();
    expect(isProdRef).equal(true);
  });

  it('tag ref is not prod', async () => {
    process.env.GITHUB_REPOSITORY_OWNER = 'dmsi-io';
    process.env.GITHUB_REPOSITORY = 'dmsi-io/gha-secret-manager-env';
    process.env.GITHUB_SHA = '192ff21173cef52681f593422d0266037033b7bb';
    process.env.GITHUB_REF_NAME = 'v0.0.0';
    process.env.GITHUB_REF_TYPE = 'tag';
    const isProdRef = await isProductionRef();
    expect(isProdRef).equal(false);
  });
});
