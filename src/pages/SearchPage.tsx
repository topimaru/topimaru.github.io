import { FunctionComponent, useState } from "react";
import { atom, useRecoilState, useSetRecoilState } from "recoil";

import SearchInput from "../components/SearchInput";
import Spinner from "../components/Spinner";
import User from "../components/User";
import { setUsersCacheState, UserType } from "../recoil/users";
import { useApi } from "../utils/api";

const SearchList: FunctionComponent<{ data: UserType[] | null }> = ({ data }) =>
  !data ? (
    <div
      className="flex justify-center items-center px-4 pt-4 w-full h-full"
      style={{
        maxHeight: "calc(100% - 4em)",
      }}
    >
      <Spinner className="w-8 h-8 text-gray-600" />
    </div>
  ) : !data.length ? (
    <div
      className="flex justify-center items-center px-4 pt-4 w-full h-full"
      style={{
        maxHeight: "calc(100% - 4em)",
      }}
    >
      検索結果がありません。
    </div>
  ) : (
    <div
      className="flex overflow-y-auto flex-wrap justify-evenly px-4 pt-4 w-full h-full"
      style={{
        maxHeight: "calc(100% - 4em)",
        WebkitMaskImage:
          "linear-gradient(180deg, transparent, #000 4%, #000 96%, transparent)",
      }}
    >
      {data.map(({ id, profileImage, name }, i) => (
        <User
          key={id}
          big
          profileImage={profileImage}
          name={name}
          to={`/users/${id}`}
        />
      ))}
      {new Array(10).fill(0).map((x, i) => (
        <User key={i} big />
      ))}
    </div>
  );

export const searchPageInputState = atom<string>({
  key: "searchPageInputState",
  default: "",
});

export const searchPageDataState = atom<UserType[] | null>({
  key: "searchPageDataState",
  default: [],
});

const SearchPage: FunctionComponent = () => {
  const [input, setInput] = useRecoilState(searchPageInputState);
  const [data, setData] = useRecoilState(searchPageDataState);
  const [query, setQuery] = useState("");
  const setUsersCache = useSetRecoilState(setUsersCacheState);

  const api = useApi();

  return (
    <div
      className={`flex flex-col gap-4 p-4 w-full ${
        data === null || data.length === 0 ? "h-full" : "max-h-full"
      }`}
    >
      <SearchInput
        placeholder="ニックネーム"
        value={input}
        onInput={setInput}
        onSubmit={async (value) => {
          if (!api) return;
          if (data === null) return;
          if (value === query) return;
          setQuery(value);
          setData(null);
          const newData = (await api("GET", "/users/search", {
            nickname: value,
          })) as UserType[];
          setData(newData);
          setUsersCache(newData);
        }}
      />
      <SearchList data={data} />
    </div>
  );
};

export default SearchPage;
