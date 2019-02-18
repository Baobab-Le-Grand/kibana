/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import expect from 'expect.js';

export default function ({ getService, getPageObjects }) {
  const retry = getService('retry');
  const { visualBuilder, timePicker } = getPageObjects(['visualBuilder', 'timePicker']);

  describe('visual builder', function describeIndexTests() {

    describe('markdown', () => {

      before(async () => {
        await visualBuilder.resetPage();
        await visualBuilder.clickMarkdown();
        await timePicker.setAbsoluteRange('2015-09-22 06:00:00.000', '2015-09-22 11:00:00.000');
      });

      afterEach(async () => {
        await visualBuilder.clearMarkdown();
      });

      it('should render subtabs and table variables markdown components', async () => {
        const tabs = await visualBuilder.getSubTabs();
        expect(tabs.length).to.be(3);

        const variables = await visualBuilder.getMarkdownTableVariables();
        expect(variables).not.to.be.empty();
        expect(variables).to.have.length(5);
      });

      it('should allow printing raw timestamp of data', async () => {
        await visualBuilder.enterMarkdown('{{ count.data.raw.[0].[0] }}');
        retry.try(async () => {
          const text = await visualBuilder.getMarkdownText();
          expect(text).to.be('1442901600000');
        });
      });

      it('should allow printing raw value of data', async () => {
        await visualBuilder.enterMarkdown('{{ count.data.raw.[0].[1] }}');
        await retry.try(async () => {
          const text = await visualBuilder.getMarkdownText();
          expect(text).to.be('6');
        });
      });

      it('should render html as plain text', async () => {
        const html = '<h1>hello world</h1>';
        await visualBuilder.enterMarkdown(html);
        retry.try(async () => {
          const markdownText = await visualBuilder.getMarkdownText();
          expect(markdownText).to.be(html);
        });
      });

      it('should render mustache list', async () => {
        const list = '{{#each _all}}\n{{ data.formatted.[0] }} {{ data.raw.[0] }}\n{{/each}}';

        const expectedRenderer = 'Sep 22, 2015 @ 06:00:00.000,6 1442901600000,6';

        await visualBuilder.enterMarkdown(list);
        retry.try(async () => {
          const markdownText = await visualBuilder.getMarkdownText();
          expect(markdownText).to.be(expectedRenderer);
        });
      });

      it('should render first table variable', async () => {
        retry.try(async () => {
          await visualBuilder.clearMarkdown();
          const variables = await visualBuilder.getMarkdownTableVariables();
          const beforeClickText = await visualBuilder.getMarkdownText();

          expect(variables).not.to.be.empty();
          expect(beforeClickText).to.be.empty();

          await variables[0].selector.click();

          const text = await visualBuilder.getMarkdownText();
          expect(text).to.be('46');
        });
      });
    });
  });
}
