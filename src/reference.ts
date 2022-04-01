/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { parseCSV } from '@google-github-actions/actions-utils';
import { getProjectID } from './action';

/**
 * Parses a string of the format `outout:secret`. For example:
 *
 *     output:project/secret/version
 *
 * @param s String reference to parse
 * @returns Reference
 */
export class Reference {
  // output is the name of the output variable.
  readonly output: string = '';

  // project, name, and version are the secret ref
  readonly project: string = process.env.GCP_PROJECT || '';
  readonly name: string = getProjectID();
  readonly version: string = 'latest';
  readonly branch_env: string;

  constructor(s: string, env = 'DEVELOP') {
    this.branch_env = env;

    const sParts = s.split(':');
    if (sParts.length >= 2) {
      this.output = sParts[0].trim();
    }

    const ref = sParts.length < 2 ? sParts.slice().join(':') : sParts.slice(1).join(':');
    const refParts = ref.split('/');
    switch (refParts.length) {
      // projects/<p>/secrets/<s>/versions/<v>
      case 6: {
        this.project = refParts[1];
        this.name = refParts[3];
        this.version = refParts[5];
        break;
      }
      // projects/<p>/secrets/<s>
      case 4: {
        this.project = refParts[1];
        this.name = refParts[3];
        break;
      }
      // <p>/<s>/<v>
      case 3: {
        this.project = refParts[0];
        this.name = refParts[1];
        this.version = refParts[2];
        break;
      }
      // <p>/<s>
      case 2: {
        this.project = refParts[0];
        this.name = refParts[1];
        break;
      }
      case 1: {
        this.name = refParts[0];
        break;
      }
      default: {
        throw new TypeError(`Invalid reference "${s}" - unknown format`);
      }
    }

    if (this.output === '') {
      this.output = this.name;
    }

    if (this.output === '' || this.project === '' || this.name === '' || this.version === '') {
      throw new TypeError(`Invalid reference "${s}" - unknown format`);
    }
  }

  /**
   * Returns the full GCP self link.
   *
   * @returns String self link.
   */
  public selfLink(): string {
    return `projects/${this.project}/secrets/${this.name}/versions/${this.version}`;
  }

  /**
   * Returns the full GCP environment specific self link.
   *
   * @returns String self link.
   */
  public selfEnvironmentLink(): string {
    return `projects/${this.project}/secrets/${this.branch_env}_${this.name}/versions/${this.version}`;
  }
}

/**
 * Accepts the actions list of secrets and parses them as References.
 *
 * @param input List of secrets, from the actions input, can be
 * comma-delimited or newline, whitespace around secret entires is removed.
 * @returns Array of References for each secret, in the same order they were
 * given.
 */
export function parseSecretsRefs(input: string, isProd = false): Reference[] {
  const secrets: Reference[] = [];
  for (const line of input.split(/\r|\n/)) {
    const pieces = parseCSV(line);
    for (const piece of pieces) {
      secrets.push(new Reference(piece, isProd ? 'PROD' : 'DEVELOP'));
    }
  }
  return secrets;
}
