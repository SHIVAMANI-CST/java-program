// utils/mathUtils.ts

export const getGroupIndex = (index: number, groupSize: number): number =>
  Math.floor(index / groupSize);
