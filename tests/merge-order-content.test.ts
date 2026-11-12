import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPlatformContent } from '../src/config/english-platform-content';
import { TOOLS_REGISTRY } from '../src/config/tools-registry';
import { getToolContent } from '../src/config/tool-content';
import { toolCopy } from '../src/config/tool-content-copy';
import { getEnglishCoreToolGuide } from '../src/config/english-core-tool-content';

test('merge guidance describes browser-provided order and no manual reordering in all locales', () => {
  for (const locale of ['en', 'fr', 'es', 'de', 'ar'] as const) {
    const description = getToolContent(TOOLS_REGISTRY['merge-pdf'], locale).description;
    assert.match(description, /browser|navigateur|navegador|Browser|المتصفح/i);
    assert.match(description, /not guaranteed|n’est pas garanti|no se garantiza|nicht garantiert|لا يُضمن/i);
    assert.match(description, /cannot reorder|ne pouvez pas réorganiser|no puedes reordenar|nicht umsortieren|لا يمكنك إعادة ترتيب/i);
  }
  for (const answer of [toolCopy.merge[0], ...toolCopy.merge.slice(1)]) {
    assert.match(answer, /not guaranteed|n’est pas garanti|no se garantiza|nicht garantiert|لا يُضمن/i);
    assert.match(answer, /cannot reorder|ne pouvez pas réorganiser|no puedes reordenar|nicht umsortieren|لا يمكنك إعادة ترتيب/i);
  }
});

test('English core and platform merge guides do not promise file-picker selection order', () => {
  const guide = getEnglishCoreToolGuide('merge-pdf')!;
  const coreCopy = [guide.introduction, guide.guidance, ...guide.steps.map(step => step.body)].join(' ');
  assert.match(coreCopy, /browser file list/i);
  assert.match(coreCopy, /not guaranteed to match/i);
  assert.match(coreCopy, /no control to reorder/i);
  assert.doesNotMatch(coreCopy, /select them in the sequence you want|in the order of the files you select/i);

  const tool = TOOLS_REGISTRY['merge-pdf'];
  for (const modifier of ['on-iphone', 'for-windows', 'without-watermark'] as const) {
    const content = getPlatformContent(tool, modifier);
    const copy = [content.guideTitle, content.guideText, ...content.steps.map(step => step.desc), ...content.faqs.map(item => item.a)].join(' ');
    assert.match(copy, /browser|picker/i);
    assert.match(copy, /not guaranteed|may differ/i);
    assert.match(copy, /no (visual )?(control|reorder)/i);
    assert.doesNotMatch(copy, /select them in the sequence you want|select them in the order you want/i);
  }
});
