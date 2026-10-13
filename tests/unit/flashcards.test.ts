import { expect, test } from 'vitest';
import { filterCards, shuffled, tagsOf } from '@/widgets/flashcards';

const cards = [
  { id: 'a', term: 'A', short: '', long: '', tags: ['x', 'y'] },
  { id: 'b', term: 'B', short: '', long: '', tags: ['y'] },
];

test('tagsOf sorts unique tags', () => expect(tagsOf(cards)).toEqual(['x', 'y']));
test('filterCards filters and falls back to all', () => {
  expect(filterCards(cards, 'x').map((c) => c.id)).toEqual(['a']);
  expect(filterCards(cards, 'zzz')).toHaveLength(2);
  expect(filterCards(cards, 'all')).toHaveLength(2);
});
test('shuffled keeps every card and does not mutate', () => {
  const out = shuffled(cards, () => 0);
  expect(out.map((c) => c.id).sort()).toEqual(['a', 'b']);
  expect(cards[0].id).toBe('a');
});
