import {
  UNCATEGORISED,
  compareCategoriesFailingFirst,
  hasCategories,
  readCheckCategory,
} from './categories';

describe('readCheckCategory', () => {
  it('reads metadata.category', () => {
    expect(readCheckCategory({ metadata: { category: 'Security' } })).toBe(
      'Security',
    );
  });

  it('trims surrounding whitespace so config typos do not split a category', () => {
    expect(readCheckCategory({ metadata: { category: '  Security ' } })).toBe(
      'Security',
    );
  });

  it.each([
    ['no metadata', {}],
    ['no category key', { metadata: { other: 'x' } }],
    ['empty string', { metadata: { category: '' } }],
    ['whitespace only', { metadata: { category: '   ' } }],
    ['a non-string', { metadata: { category: 7 } }],
    ['null', { metadata: { category: null } }],
  ])('falls back to the uncategorised bucket for %s', (_label, check) => {
    expect(readCheckCategory(check as any)).toBe(UNCATEGORISED);
  });
});

describe('hasCategories', () => {
  it('is true when any check declares a real category', () => {
    expect(hasCategories([UNCATEGORISED, 'Security'])).toBe(true);
  });

  it('is false when everything is uncategorised', () => {
    expect(hasCategories([UNCATEGORISED, UNCATEGORISED])).toBe(false);
    expect(hasCategories([])).toBe(false);
  });
});

describe('compareCategoriesFailingFirst', () => {
  it('puts failing categories first and leaves ties in insertion order', () => {
    const categories = [
      { name: 'a-passing', passing: true },
      { name: 'b-failing', passing: false },
      { name: 'c-passing', passing: true },
      { name: 'd-failing', passing: false },
    ];

    expect(
      [...categories].sort(compareCategoriesFailingFirst).map(c => c.name),
    ).toEqual(['b-failing', 'd-failing', 'a-passing', 'c-passing']);
  });
});
