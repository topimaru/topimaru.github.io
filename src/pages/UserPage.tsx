import { FunctionComponent, useEffect, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import Spinner from "../components/Spinner";
import User from "../components/User";

import { userCacheState, UserType } from "../recoil/users";
import { useApi } from "../utils/api";
import { removeDuplicatesOrderBy } from "../utils/array";

type ExtendedUser = {
  id: number;
  name: string;
  profileImage: string;
  profile: {
    message: string;
    tags: string[];
    twitterProfile: {
      id: number;
      name: string;
      username: string;
    } | null;
  };
  room: {
    id: number;
    name: string;
    link: string;
    thumbnail: string;
  } | null;
  reservedRoom: {
    id: number;
    name: string;
    date: string;
    thumbnail: string;
  } | null;
};

type Song = {
  id: number;
  title: string;
  artist: string;
};

interface Props {
  userId: number;
  name: string;
  profileImage: string | null;
  message: string | null;
  tags: string[];
  twitterProfile: ExtendedUser["profile"]["twitterProfile"];
}

const useLoadRepertory = (userId: number) => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Song[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [error, setError] = useState<{ status: number }>();

  const initialize = () => {
    setLoading(false);
    setPage(1);
    setItems([]);
    setHasNextPage(true);
    setError(undefined);
  };

  async function loadMore() {
    setLoading(true);
    try {
      if (!api) return;
      const { repertory, hasNextPage: newHasNextPage } = await api(
        "GET",
        `/users/${userId}/repertory`,
        { page }
      );
      setPage((p) => p + 1);
      setItems((current) => [...current, ...repertory]);
      setHasNextPage(newHasNextPage);
    } catch (err) {
      setError(err as { status: number });
    } finally {
      setLoading(false);
    }
  }

  return { loading, items, hasNextPage, error, loadMore, initialize };
};

const useLoadFF = (userId: number) => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<UserType[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [error, setError] = useState<{ status: number }>();

  const initialize = () => {
    setLoading(false);
    setPage(1);
    setItems([]);
    setHasNextPage(true);
    setError(undefined);
  };

  async function loadMore() {
    setLoading(true);
    try {
      if (!api) return;
      const { follows, hasNextPage: newHasNextPage } = await api(
        "GET",
        `/users/${userId}/ff`,
        { page }
      );
      setPage((p) => p + 1);
      setItems((current) =>
        removeDuplicatesOrderBy(
          [...current, ...follows],
          (user: UserType) => user.id
        )
      );
      setHasNextPage(newHasNextPage);
    } catch (err) {
      setError(err as { status: number });
    } finally {
      setLoading(false);
    }
  }

  return { loading, items, hasNextPage, error, loadMore, initialize };
};

const UserPageComponent: FunctionComponent<Props> = ({
  userId,
  name,
  profileImage,
  message,
  tags,
  twitterProfile,
}) => {
  const repertory = useLoadRepertory(userId);
  const [repertoryRef] = useInfiniteScroll({
    loading: repertory.loading,
    hasNextPage: repertory.hasNextPage,
    onLoadMore: repertory.loadMore,
    disabled: !!repertory.error,
  });

  const ff = useLoadFF(userId);
  const [ffRef] = useInfiniteScroll({
    loading: ff.loading,
    hasNextPage: ff.hasNextPage,
    onLoadMore: ff.loadMore,
    disabled: !!ff.error,
  });

  useEffect(() => {
    repertory.initialize();
    ff.initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="flex flex-col pt-2 pb-4 w-full h-full">
      <div className="mt-2 w-full h-6 text-base font-bold leading-6 text-center">
        {name}
      </div>
      <div
        className="flex overflow-y-auto overflow-x-hidden flex-col gap-3 py-4 w-full h-full"
        style={{
          maxHeight: "calc(100% - 12em)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, #000 4%, #000 96%, transparent)",
        }}
      >
        <div className="flex gap-4 px-4 w-full h-20">
          <div className="relative flex-grow-0 flex-shrink-0 w-20 h-20">
            <img
              alt={`${name}さんのアイコン`}
              title={`${name}さんのアイコン`}
              className="rounded-3xl"
              src={
                profileImage ??
                "https://karaoke.topia.tv/IconProfileDefault.png"
              }
              onError={(e) => {
                e.currentTarget.src =
                  "https://karaoke.topia.tv/IconProfileDefault.png";
              }}
            />
            {twitterProfile ? (
              <a
                href={`https://twitter.com/${twitterProfile.username}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  alt="Twitterのアイコン"
                  title="Twitterのアイコン"
                  className="absolute right-0 bottom-0 w-8 h-8 rounded-full cursor-pointer"
                  src="/images/twitter.svg"
                />
              </a>
            ) : null}
          </div>
          <div className="flex-1 px-4 py-2 bg-gray-100 rounded-2xl overflow-y-clip">
            {message === null ? (
              <div className="flex justify-center items-center w-full h-full">
                <Spinner className="w-6 h-6 text-gray-600" />
              </div>
            ) : (
              <div
                className="text-sm break-all overflow-y-clip"
                style={{
                  minHeight: "100%",
                  maxHeight: "calc(100% + 8px)",
                  WebkitMaskImage:
                    "linear-gradient(180deg, #000 60%, transparent)",
                }}
              >
                {/* TODO */}
                {message}
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 w-full h-6 text-base font-bold leading-6 text-center">
          レパートリー{" "}
          {repertory.items.length === 0
            ? ""
            : `(${repertory.items.length}${repertory.hasNextPage ? "+" : ""})`}
        </div>
        {repertory.items.length === 0 &&
        (repertory.loading || repertory.hasNextPage) ? (
          <div
            className="flex justify-center items-center w-full h-full"
            ref={repertoryRef}
          >
            <Spinner className="w-6 h-6 text-gray-600" />
          </div>
        ) : repertory.items.length === 0 ? null : (
          <div className="overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-2 gap-3 px-4">
              {repertory.items.map((song) => (
                <div
                  key={song.id}
                  className="flex flex-col flex-1 gap-1 px-3 py-1 bg-gray-100 rounded-xl"
                >
                  <div
                    className="overflow-hidden h-10 text-sm"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      textOverflow: "ellipsis",
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {song.title}
                  </div>
                  <div className="text-xs text-right text-gray-600 truncate">
                    {song.artist}
                  </div>
                </div>
              ))}
            </div>
            {repertory.hasNextPage && (
              <div
                className="flex justify-center items-center w-full h-12"
                ref={repertoryRef}
              >
                <Spinner className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 w-full h-6 text-base font-bold leading-6 text-center">
        FF{" "}
        {ff.items.length === 0
          ? ""
          : `(${ff.items.length}${ff.hasNextPage ? "+" : ""})`}
      </div>
      <div
        className="flex overflow-y-auto flex-wrap justify-evenly px-4 pt-4 w-full h-36"
        style={{
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent)",
        }}
      >
        {ff.items.length === 0 && (ff.loading || ff.hasNextPage) ? (
          <div
            className="flex justify-center items-center w-full h-full"
            ref={ffRef}
          >
            <Spinner className="w-6 h-6 text-gray-600" />
          </div>
        ) : ff.items.length === 0 ? null : (
          <div className="overflow-y-auto overflow-x-hidden">
            <div className="flex flex-wrap justify-evenly w-full">
              {ff.items.map((user) => (
                <User
                  key={user.id}
                  profileImage={user.profileImage}
                  name={user.name}
                  to={`/users/${user.id}`}
                />
              ))}
              {new Array(10).fill(0).map((x, i) => (
                <User key={i} />
              ))}
            </div>
            {ff.hasNextPage && (
              <div
                className="flex justify-center items-center w-full h-12"
                ref={ffRef}
              >
                <Spinner className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const UserPage: FunctionComponent = () => {
  const { userId } = useParams();

  const numericalUserId =
    !userId || !/^\d+$/.test(userId) ? -1 : parseInt(userId);
  const cachedUser = useRecoilValue(userCacheState(numericalUserId));
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const api = useApi();

  useEffect(() => {
    if (numericalUserId < 0) return;
    if (!api) return;

    api("GET", `/users/${numericalUserId}`).then((newUser: ExtendedUser) => {
      setUser(newUser);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!api, numericalUserId]);

  if (numericalUserId === -1) {
    return (
      <div className="flex flex-col pt-2 pb-4 w-full h-full">
        ユーザーが存在しません。
      </div>
    );
  }

  return user ? (
    <UserPageComponent
      userId={user.id}
      name={user.name}
      profileImage={user.profileImage}
      message={user.profile.message}
      tags={user.profile.tags}
      twitterProfile={user.profile.twitterProfile}
    />
  ) : cachedUser === null ? (
    <div className="flex flex-col justify-center items-center p-4 w-full h-full">
      <Spinner className="w-8 h-8 text-gray-600" />
    </div>
  ) : (
    <UserPageComponent
      userId={cachedUser.id}
      name={cachedUser.name}
      profileImage={cachedUser.profileImage ?? null}
      message={null}
      tags={[]}
      twitterProfile={null}
    />
  );
};

export default UserPage;
