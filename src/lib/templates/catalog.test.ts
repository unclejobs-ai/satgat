import { describe, expect, test } from 'bun:test';
import { previewFixtures } from '../../../scripts/template-preview-fixtures.mjs';
import { getPageSpec, getTemplate, getTemplateIds, listTemplates } from './registry';

describe('template catalog', () => {
  test('has fourteen unique IDs distributed across every product category', () => {
    const templates = listTemplates();
    expect(templates).toHaveLength(14);
    expect(new Set(getTemplateIds()).size).toBe(14);
    expect(new Set(templates.map((template) => template.category))).toEqual(
      new Set(['personal', 'business', 'occasion']),
    );
  });

  test('matches the exact catalog identity, category, and page-spec table', () => {
    const expectedCatalog = [
      { id: 'resume', category: 'personal', pageSpec: 'a4Portrait' },
      { id: 'self-intro', category: 'personal', pageSpec: 'a4Portrait' },
      { id: 'business-card', category: 'personal', pageSpec: 'businessCard8Up' },
      { id: 'brand-onepager', category: 'business', pageSpec: 'a4Landscape' },
      { id: 'product-brochure', category: 'business', pageSpec: 'a4Portrait' },
      { id: 'company-profile', category: 'business', pageSpec: 'a4Portrait' },
      { id: 'investor-deck', category: 'business', pageSpec: 'slide16x9' },
      { id: 'brand-storybook', category: 'business', pageSpec: 'a4Portrait' },
      { id: 'invitation', category: 'occasion', pageSpec: 'postcardPortrait' },
      { id: 'new-year-card', category: 'occasion', pageSpec: 'postcardPortrait' },
      { id: 'proposal', category: 'business', pageSpec: 'a4Portrait' },
      { id: 'newsletter', category: 'business', pageSpec: 'a4Portrait' },
      { id: 'portfolio', category: 'personal', pageSpec: 'a4Landscape' },
      { id: 'report', category: 'business', pageSpec: 'a4Portrait' },
    ];

    expect(
      listTemplates().map(({ id, category, pageSpec }) => ({ id, category, pageSpec })),
    ).toEqual(expectedCatalog);
    for (const { id } of expectedCatalog) {
      expect(getTemplate(id)?.id).toBe(id);
    }
    for (const template of listTemplates()) {
      expect(getPageSpec(template.pageSpec)).toBeDefined();
    }
    expect(getTemplate('not-a-template')).toBeUndefined();
  });

  test('keeps guidance and canonical fixtures complete for every declared slot', () => {
    for (const template of listTemplates()) {
      expect(template.promptSeeds.length).toBeGreaterThan(0);
      expect(template.factChecklist.length).toBeGreaterThan(0);
      expect(template.specimen.alt).toContain(template.name);
      expect(Object.keys(previewFixtures[template.id])).toEqual(
        template.slots.map((slot) => slot.id),
      );
    }
  });
});
