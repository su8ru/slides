import { describe, expect, test } from 'vitest';
import { transformTalkMetadata } from './talk-metadata.mjs';

const markdownWithTalk = `---
marp: true
title: こんにちは useTransition
author: すばる / su8ru
talk:
  slug: 260408-react-study
  date: 2026-04-08
  event: React.study vol.01@sapporo #hokkaido_js
---

# {{ title }}

{{ talk.label }}

<{{ urls.short }}>
`;

describe('transformTalkMetadata', () => {
  test('injects metadata directives and expands placeholders', () => {
    const transformed = transformTalkMetadata(markdownWithTalk);

    expect(transformed).toContain("description: '2026-04-08 | React.study vol.01@sapporo #hokkaido_js'");
    expect(transformed).toContain("footer: '2026-04-08 | React.study vol.01@sapporo #hokkaido_js'");
    expect(transformed).toContain('image: https://slides.su8ru.dev/260408-react-study/index.jpg');
    expect(transformed).toContain('url: https://slides.su8ru.dev/260408-react-study');
    expect(transformed).toContain('# こんにちは useTransition');
    expect(transformed).toContain('<https://s.su8.run/260408-react-study>');
    expect(transformed).not.toContain('{{');
  });

  test('keeps legacy markdown without talk metadata unchanged', () => {
    const legacy = `---
marp: true
title: Legacy
---

# Legacy
`;

    expect(transformTalkMetadata(legacy)).toBe(legacy);
  });

  test('rejects placeholders without talk metadata', () => {
    const legacy = `---
marp: true
title: Legacy
---

# {{ title }}
`;

    expect(() => transformTalkMetadata(legacy)).toThrow('placeholder requires talk frontmatter');
  });

  test('rejects unknown placeholders', () => {
    expect(() => transformTalkMetadata(`${markdownWithTalk}\n{{ urls.missing }}\n`)).toThrow(
      'unknown placeholder: urls.missing',
    );
  });

  test('requires talk slug, date, and event', () => {
    const missingSlug = `---
marp: true
title: Missing slug
talk:
  date: 2026-04-08
  event: React.study vol.01@sapporo #hokkaido_js
---

# Missing slug
`;

    expect(() => transformTalkMetadata(missingSlug)).toThrow('talk.slug is required');
  });
});
