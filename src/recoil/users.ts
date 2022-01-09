import { atom, selector, selectorFamily } from "recoil";
import { guardRecoilDefaultValue } from ".";

export type UserType = {
  id: number;
  name: string;
  profileImage?: string;
  room: string | null;
};

export const usersCacheState = atom<Record<number, UserType>>({
  key: "usersCacheState",
  default: {},
});

export const userCacheState = selectorFamily<UserType | null, number>({
  key: "userCacheState",
  get:
    (id) =>
    ({ get }) => {
      return get(usersCacheState)[id] ?? null;
    },
});

export const setUserCacheState = selector<UserType>({
  key: "setUserCacheState",
  get: () => {
    throw new Error("No getter");
  },
  set: ({ set }, user) => {
    if (guardRecoilDefaultValue(user)) return;
    set(usersCacheState, (users) => ({
      ...users,
      [user.id]: user,
    }));
  },
});

export const setUsersCacheState = selector<UserType[]>({
  key: "setUsersCacheState",
  get: () => {
    throw new Error("No getter");
  },
  set: ({ set }, newUsers) => {
    if (guardRecoilDefaultValue(newUsers)) return;
    set(usersCacheState, (users) => ({
      ...users,
      ...Object.fromEntries(newUsers.map((user) => [user.id, user])),
    }));
  },
});
