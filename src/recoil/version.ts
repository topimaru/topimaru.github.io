import { atom, selector } from "recoil";
import { guardRecoilDefaultValue } from ".";

const clientVersion = "1.0";

export type Version = {
  client: string;
  server: string | null;
};

export const versionState = atom<Version>({
  key: "versionState",
  default: {
    client: clientVersion,
    server: null,
  },
});

export const clientDisplayVersionState = selector({
  key: "clientDisplayVersionState",
  get: ({ get }) => {
    const { client } = get(versionState);
    return `v${client}`;
  },
});

export const serverVersionState = selector<string | null>({
  key: "serverVersionState",
  get: ({ get }) => {
    const { server } = get(versionState);
    return server ?? "...";
  },
  set: ({ set }, newServerVersion) => {
    if (guardRecoilDefaultValue(newServerVersion)) return;
    set(versionState, (version) => ({ ...version, server: newServerVersion }));
  },
});

export const serverDisplayVersionState = selector({
  key: "serverDisplayVersionState",
  get: ({ get }) => {
    const { server } = get(versionState);
    return server ? `v${server}` : "...";
  },
});

export const serverMajorVersionState = selector({
  key: "serverMajorVersionState",
  get: ({ get }) => {
    const { server } = get(versionState);
    return server ? server.split(".")[0] : null;
  },
});
