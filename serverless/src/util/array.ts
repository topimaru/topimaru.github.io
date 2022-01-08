export const removeDuplicatesBy = <T, K>(array: T[], by: (a: T) => K) =>
  Array.from(new Map(array.map((v) => [by(v), v])).values());

export const removeDuplicatesOrderBy = <T, K>(array: T[], by: (a: T) => K) =>
  array.filter((v, i, a) => a.findIndex((t) => by(t) === by(v)) === i);
