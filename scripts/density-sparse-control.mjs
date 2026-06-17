/**
 * Deliberately sparse fixture for VAL-DENSITY-003.
 *
 * This is the "sparse control" the density scanner must flag. It reuses the
 * `report` template (a4 portrait) but blanks most optional slots so a page
 * has only a title + one short summary line — well under the 50% fill bar.
 *
 * Used by `scripts/design-guard.mjs --check-density --sparse-control` to prove
 * the sparse threshold actually fires. It is NOT part of the 14 shipping
 * fixtures (`previewFixtures`); it lives here as a regression control.
 */

export const sparseControlFixture = {
  templateId: 'report',
  title: '빈 보고서',
  slots: {
    title: '제목만 있는 보고서',
    summary: '한 줄 요약.',
    // progress, results, issues, plan, closing all intentionally blank.
  },
};
