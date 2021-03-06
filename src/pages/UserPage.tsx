import { FunctionComponent, useEffect, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useMediaQueries } from "@react-hook/media-query";

import Spinner from "../components/Spinner";
import User from "../components/User";
import { userCacheState, UserType } from "../recoil/users";
import { useApi } from "../utils/api";
import { removeDuplicatesOrderBy } from "../utils/array";
import Link from "../components/Link";
import ExternalLink from "../components/ExternalLink";

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
  url?: string;
};

interface Props {
  userId: number;
  name: string;
  profileImage: string | null;
  message: string | null;
  tags: string[];
  room: string | null;
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
      setItems((current) =>
        removeDuplicatesOrderBy(
          [...current, ...repertory],
          (song: Song) => song.id
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
  room,
  twitterProfile,
}) => {
  const { matches } = useMediaQueries({
    two: "(min-width: 480px)",
    three: "(min-width: 720px)",
    four: "(min-width: 1024px)",
  });
  const gridCols = ["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4"];
  const screenType = matches.four ? 3 : matches.three ? 2 : matches.two ? 1 : 0;

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

  const navigate = useNavigate();

  const htmlMessage =
    message
      ?.replace(/\n/g, "<br>")
      .replace(/<color=(#[0-9a-f]{3,8})>/g, '<span style="color: $1">')
      .replace(/<\/color>/g, "</span>")
      .replace(
        /<size=(\d+)>/g,
        '<span style="font-size: calc(0.5px * $1); line-height: 110%;">'
      )
      .replace(/<size=(\d+)[^>]/g, "")
      .replace(/<\/size>/g, "</span>") ?? "";

  const [messageEnlarged, setMessageEnlarged] = useState(false);

  useEffect(() => {
    repertory.initialize();
    ff.initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="flex flex-col pt-2 pb-4 w-full h-full">
      {messageEnlarged && (
        <div
          className="flex absolute top-0 z-20 px-8 py-16 w-full h-full bg-gray-700 bg-opacity-20"
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setMessageEnlarged(false);
            }
          }}
          onKeyPress={(e) => {
            if (e.key === "Escape") {
              setMessageEnlarged(false);
            }
          }}
        >
          <div className="overflow-y-auto overflow-x-hidden p-8 w-full h-full text-center bg-white rounded-3xl">
            <div className="mb-8">
              {tags.map((tag, i) => (
                <span
                  className="px-2 py-1 mx-1.5 leading-8 rounded-md text-sm bg-gray-100"
                  key={i}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div dangerouslySetInnerHTML={{ __html: htmlMessage }} />
          </div>
        </div>
      )}
      <div className="mt-2 w-full h-6 text-base font-bold leading-6 text-center">
        <span
          className="absolute top-0 left-2 p-2 mt-2 h-10 cursor-pointer group"
          onClick={() => navigate(-1)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            className="text-gray-500 stroke-current stroke-2 group-hover:text-gray-700"
          >
            <path
              d="M14 6l-6 6l6 6"
              stroke="currentColor"
              fill="none"
              fillRule="evenodd"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </span>
        <span>{name}</span>
        <Link to="/">
          <span className="absolute top-0 right-2 p-2 mt-2 h-10 cursor-pointer group">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              className="text-gray-500 stroke-current stroke-2 group-hover:text-gray-700"
            >
              <path
                d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
                stroke="currentColor"
                fill="none"
                fillRule="evenodd"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </span>
        </Link>
      </div>
      <div
        className="flex overflow-y-auto overflow-x-hidden flex-col gap-3 py-4 w-full h-full"
        style={{
          maxHeight: "calc(100% - 16em)",
        }}
      >
        <div className="flex gap-4 px-4 w-full h-20">
          <ExternalLink to={room ?? undefined}>
            <div className="relative flex-grow-0 flex-shrink-0 w-20 h-20">
              <img
                alt={`${name}?????????????????????`}
                title={`${name}?????????????????????`}
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
                    alt="Twitter???????????????"
                    title="Twitter???????????????"
                    className="absolute right-0 bottom-0 w-8 h-8 rounded-full cursor-pointer"
                    src="/images/twitter.svg"
                  />
                </a>
              ) : null}
              {!!room && (
                <span className="flex absolute -top-1 -right-1 w-5 h-5">
                  <span
                    style={{ backgroundColor: "#ff4556" }}
                    className="inline-flex absolute w-full h-full rounded-full opacity-75 animate-ping"
                  ></span>
                  <span
                    style={{ backgroundColor: "#ff4556" }}
                    className="inline-flex relative w-5 h-5 rounded-full"
                  ></span>
                </span>
              )}
            </div>
          </ExternalLink>
          <div
            className="flex-1 px-4 py-2 bg-gray-100 rounded-2xl transition-colors cursor-pointer overflow-y-clip hover:bg-gray-200 group"
            onClick={() => {
              setMessageEnlarged(true);
            }}
          >
            {message === null ? (
              <div className="flex justify-center items-center w-full h-full">
                <Spinner className="w-6 h-6 text-gray-600" />
              </div>
            ) : (
              <div
                className="text-sm text-center break-all overflow-y-clip"
                style={{
                  minHeight: "100%",
                  maxHeight: "calc(100% + 8px)",
                  WebkitMaskImage:
                    "linear-gradient(180deg, #000 60%, transparent)",
                }}
              >
                <div className="mb-8">
                  {tags.map((tag, i) => (
                    <span
                      className="px-2 py-1 mx-1.5 leading-8 rounded-md text-sm bg-gray-200 group-hover:bg-gray-300 transition-colors"
                      key={i}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: htmlMessage,
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 w-full h-6 text-base font-bold leading-6 text-center">
          ??????????????????{" "}
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
          <div
            className="overflow-y-auto overflow-x-hidden py-4"
            style={{
              WebkitMaskImage:
                "linear-gradient(180deg, transparent, #000 4%, #000 96%, transparent)",
            }}
          >
            <div className={`grid gap-3 px-4 ${gridCols[screenType]}`}>
              {repertory.items.map((song) => (
                <ExternalLink to={song.url}>
                  <div
                    key={song.id}
                    className={`flex flex-col flex-1 gap-1 px-3 py-1 rounded-xl transition-colors ${
                      song.url
                        ? "bg-blue-100 hover:bg-blue-200 cursor-pointer"
                        : "bg-gray-100"
                    }`}
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
                      {song.url ? "???? " : ""}
                      {song.title}
                    </div>
                    <div className="text-xs text-right text-gray-600 truncate">
                      {song.artist}
                    </div>
                  </div>
                </ExternalLink>
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
        className="flex overflow-y-auto flex-wrap justify-evenly px-4 pt-4 w-full h-52"
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
          <div className="overflow-y-auto overflow-x-hidden pt-4">
            <div className="flex flex-wrap justify-evenly w-full">
              {ff.items
                .filter(({ room }) => !!room)
                .map((user) => (
                  <User
                    key={user.id}
                    profileImage={user.profileImage}
                    name={user.name}
                    to={`/users/${user.id}`}
                    live={!!user.room}
                  />
                ))}
              {ff.items
                .filter(({ room }) => !room)
                .map((user) => (
                  <User
                    key={user.id}
                    profileImage={user.profileImage}
                    name={user.name}
                    to={`/users/${user.id}`}
                    live={!!user.room}
                  />
                ))}
              {new Array(30).fill(0).map((x, i) => (
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
        ????????????????????????????????????
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
      room={user.room?.link ?? null}
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
      room={null}
      twitterProfile={null}
    />
  );
};

export default UserPage;
