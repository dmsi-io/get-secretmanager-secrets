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

import 'mocha';
import { expect } from 'chai';

import { parseCredential } from '@google-github-actions/actions-utils';

import { Client } from '../src/client';

describe('Client', function () {
  it('initializes with JSON creds', function () {
    const client = new Client({
      credentials: parseCredential(`{"foo":"bar"}`),
    });
    expect(client.auth.jsonContent).eql({ foo: 'bar' });
  });

  it('initializes with ADC', function () {
    const client = new Client();
    expect(client.auth.jsonContent).eql(null);
  });
});
