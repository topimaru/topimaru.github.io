import axios from "axios";
import { Router } from "express";
import jsonBigint from "json-bigint";

import { removeDuplicatesBy, removeDuplicatesOrderBy } from "../util/array";
import { api, getHeaders, tryOrRegenerateToken } from "../util/topia";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const result = await tryOrRegenerateToken(async ({ accessToken }) =>
      api("GET /users/search", getHeaders(accessToken), {
        nickname: (req.query.nickname as string) ?? "",
      })
    );
    return res.status(200).json(
      result.users.map((user) => ({
        id: user.id,
        profileImage: user.icon_url,
        name: user.nickname,
        room:
          result.opening_rooms.find((room) => room.user_id === user.id)
            ?.firebase_dynamic_link ?? null,
      }))
    );
  } catch (e) {
    return res.status(e.status ?? 502).json({});
  }
});

router.get("/:userId", async (req, res) => {
  const { userId: userIdString } = req.params;
  if (!userIdString || !/^\d+$/.test(userIdString)) {
    return res.status(404).json({});
  }

  const userId = parseInt(userIdString);

  try {
    const twitterAccessToken = process.env.TWITTER_TOKEN;

    const response = await tryOrRegenerateToken(async ({ accessToken }) =>
      api("GET /users/:userId", getHeaders(accessToken), undefined, {
        userId,
      })
    );

    const twitterProfile = !response.user_profile.twitter_id
      ? null
      : await axios
          .request({
            method: "GET",
            url: `https://api.twitter.com/2/users/${response.user_profile.twitter_id}`,
            headers: {
              Authorization: `Bearer ${twitterAccessToken}`,
            },
            transformResponse: (response: string) => {
              return jsonBigint().parse(response);
            },
          })
          .then((response) => {
            return response.data.data ?? null;
          })
          .catch((e) => {
            // eslint-disable-next-line no-throw-literal
            throw { status: e.response.status };
          });

    const reservedRoom =
      response.reserved_room ?? response.user_room_reservation ?? null;

    return res.status(200).json({
      id: response.user.id,
      name: response.user.nickname,
      profileImage: response.user.icon_url,
      profile: {
        message: response.user_profile.message,
        tags: response.user_profile.interest_tags,
        twitterProfile,
      },
      room: response.user_room
        ? {
            id: response.user_room.id,
            name: response.user_room.name,
            link: response.user_room.firebase_dynamic_link,
            thumbnail: response.user_room.thumbnail_url,
          }
        : null,
      reservedRoom: reservedRoom
        ? {
            id: reservedRoom.id,
            name: reservedRoom.name,
            date: reservedRoom.reserved_date,
            thumbnail: response.user_room.thumbnail_url,
          }
        : null,
    });
  } catch (e) {
    return res.status(e.status ?? 502).json({});
  }
});

router.get("/:userId/ff", async (req, res) => {
  const { userId: userIdString } = req.params;
  if (!userIdString || !/^\d+$/.test(userIdString)) {
    return res.status(404).json({});
  }

  const userId = parseInt(userIdString);

  const page = req.query.page ? parseInt(req.query.page as string) : 1;

  try {
    const [following, follower] = await tryOrRegenerateToken(
      async ({ accessToken }) =>
        await Promise.all([
          api(
            "GET /v2/users/:userId/following_users",
            getHeaders(accessToken),
            { page },
            { userId }
          ),
          api(
            "GET /v2/users/:userId/follower_users",
            getHeaders(accessToken),
            { page },
            { userId }
          ),
        ])
    );

    const ffIds = removeDuplicatesBy(
      [
        ...following.follows.map(({ followable_id }) => followable_id),
        ...follower.follows.map(({ follower_id }) => follower_id),
      ],
      (a) => a
    );
    const included = {
      users: [...following.included.users, ...follower.included.users],
      opening_rooms: [
        ...following.included.opening_rooms,
        ...follower.included.opening_rooms,
      ],
    };

    return res.status(200).json({
      follows: ffIds.map((ffId) => {
        const user = included.users.find(({ id }) => id === ffId);
        return {
          id: ffId,
          profileImage: user.icon_url,
          name: user.nickname,
          room:
            included.opening_rooms.find((room) => room.user_id === user.id)
              ?.firebase_dynamic_link ?? null,
        };
      }),
      hasNextPage:
        following.list_result_meta.next_page_available ||
        follower.list_result_meta.next_page_available,
    });
  } catch (e) {
    return res.status(e.status ?? 502).json({});
  }
});

router.get("/:userId/repertory", async (req, res) => {
  const { userId: userIdString } = req.params;
  if (!userIdString || !/^\d+$/.test(userIdString)) {
    return res.status(404).json({});
  }

  const userId = parseInt(userIdString);

  try {
    const [songsResponse, postsResponse] = await tryOrRegenerateToken(
      async ({ accessToken }) =>
        Promise.all([
          api("GET /karaoke_songs", getHeaders(accessToken), {
            favorite_by_user: userId,
            artist_id: (req.query.artist_id as any) ?? 0,
            genre_id: (req.query.genre_id as any) ?? 0,
            match_name_also_to_artist:
              (req.query.match_name_also_to_artist as any) ?? true,
            original_key: (req.query.original_key as any) ?? 0,
            has_original_key: (req.query.has_original_key as any) ?? false,
            sort_by: (req.query.sort_by as any) ?? "popularity_desc",
            page: (req.query.page as any) ?? 1,
          }),
          api("GET /karaoke_posts", getHeaders(accessToken), {
            user_id: userId,
          }),
        ])
    );

    const songsRepertory = songsResponse.karaoke_songs.map((song) => ({
      id: song.id,
      title: song.name,
      artist:
        songsResponse.included.karaoke_song_artists.find(
          (artist) => artist.id === song.artist_id
        )?.name ?? "",
    }));

    const postsRepertory = postsResponse.karaoke_posts.map((post) => {
      const song = postsResponse.included.karaoke_songs.find(
        ({ id }) => id === post.karaoke_song_id
      );
      return {
        id: post.karaoke_song_id,
        title: song.name ?? "",
        artist:
          postsResponse.included.karaoke_song_artists.find(
            (artist) => artist.id === song.artist_id
          )?.name ?? "",
        url: post.web_url,
      };
    });

    return res.status(200).json({
      repertory: removeDuplicatesOrderBy(
        [...postsRepertory, ...songsRepertory],
        (song) => song.id
      ),
      hasNextPage: songsResponse.result_list_meta.next_page_available,
    });
  } catch (e) {
    return res.status(e.status ?? 502).json({});
  }
});

export = router;
