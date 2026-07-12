import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import ExamplesPage from './page';

async function renderExamples() {
  const element = await ExamplesPage({ params: Promise.resolve({ lang: 'ko' }) });
  return renderToStaticMarkup(element);
}

test('examples renders one accessible canonical card per specimen', async () => {
  const markup = await renderExamples();
  const cards = [...markup.matchAll(/<article\b[^>]*id="([^"]+)"/g)];
  const images = [...markup.matchAll(/<img\b[^>]*>/g)].map(([image]) => image);
  const createLinks = [...markup.matchAll(/<a\b[^>]*href="\/ko\/new\?template=([^"]+)"/g)];

  expect((markup.match(/<main\b/g) ?? [])).toHaveLength(1);
  expect(markup).toContain('<main id="main-content"');
  expect(cards).toHaveLength(14);
  expect(new Set(cards.map((card) => card[1])).size).toBe(14);
  expect(images).toHaveLength(14);
  expect(images.every((image) => /\bwidth="\d+"/.test(image))).toBe(true);
  expect(images.every((image) => /\bheight="\d+"/.test(image))).toBe(true);
  expect(images.every((image) => image.includes('loading="lazy"'))).toBe(true);
  expect(images.every((image) => /\balt="[^"]+"/.test(image))).toBe(true);
  expect(createLinks).toHaveLength(14);
  expect(new Set(createLinks.map((link) => link[1])).size).toBe(14);
  expect(markup).not.toContain('.html');
});
