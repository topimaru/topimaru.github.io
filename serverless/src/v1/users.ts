import { Router } from "express";
import { removeDuplicatesBy } from "../util/array";

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
    return res.status(e.status).json({});
  }
});

router.get("/:userId", async (req, res) => {
  const { userId: userIdString } = req.params;
  if (!userIdString || !/^\d+$/.test(userIdString)) {
    return res.status(404).json({});
  }

  const userId = parseInt(userIdString);

  try {
    const response = await tryOrRegenerateToken(async ({ accessToken }) =>
      api("GET /users/:userId", getHeaders(accessToken), undefined, {
        userId,
      })
    );

    const reservedRoom =
      response.reserved_room ?? response.user_room_reservation ?? null;

    return res.status(200).json({
      id: response.user.id,
      name: response.user.nickname,
      profileImage: response.user.icon_url,
      profile: {
        message: response.user_profile.message,
        tags: response.user_profile.interest_tags,
        twitterId: response.user_profile.twitter_id,
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
    return res.status(e.status).json({});
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
    return res.status(e.status).json({});
  }
});

router.get("/:userId/repertory", async (req, res) => {
  const { userId: userIdString } = req.params;
  if (!userIdString || !/^\d+$/.test(userIdString)) {
    return res.status(404).json({});
  }

  const userId = parseInt(userIdString);

  try {
    const response = await tryOrRegenerateToken(async ({ accessToken }) =>
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
      })
    );
    return res.status(200).json({
      repertory: response.karaoke_songs.map((song) => ({
        id: song.id,
        title: song.name,
        artist:
          response.included.karaoke_song_artists.find(
            (artist) => artist.id === song.artist_id
          )?.name ?? "",
      })),
      hasNextPage: response.result_list_meta.next_page_available,
    });
  } catch (e) {
    return res.status(e.status).json({});
  }
});

export = router;