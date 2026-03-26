export const MAX_LEVEL = 12;

const XP_TO_NEXT_BY_LEVEL = [
  100,
  150,
  225,
  325,
  470,
  680,
  985,
  1430,
  2070,
  3000,
  4350,
];

export function getXpToNextLevel(level = 1) {
  if (level >= MAX_LEVEL) return 0;
  if (XP_TO_NEXT_BY_LEVEL[level - 1]) return XP_TO_NEXT_BY_LEVEL[level - 1];
  return Math.round(100 * 1.45 ** Math.max(0, level - 1));
}

export default XP_TO_NEXT_BY_LEVEL;
