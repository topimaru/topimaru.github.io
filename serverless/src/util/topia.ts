/* eslint-disable no-throw-literal */
import axios, { Method } from "axios";
import jsonBigint from "json-bigint";
import { URLSearchParams } from "url";
import { getTestClient, setAccessToken, TestClient } from "./firebase";

const clientVersion = "9999.9999.9999";
export const getHeaders = (token?: string) => ({
  Host: "api.topia.tv",
  "x-clientversion": clientVersion,
  accept: "application/json",
  "content-type": "application/json; charset=UTF-8",
  "accept-encoding": "gzip, identity",
  "user-agent": "BestHTTP/2 v2.5.3",
  ...(token
    ? {
        authorization: `Bearer ${token}`,
      }
    : {}),
});

export type API = {
  "GET /self": {
    req: undefined;
    res: ExtendedUser;
    query: undefined;
  };
  "GET /users/:userId": {
    req: undefined;
    res: ExtendedUser;
    query: { userId: number };
  };
  "GET /v2/users/:userId/following_users": {
    req: { page: number };
    res: FFResponse;
    query: { userId: number };
  };
  "GET /v2/users/:userId/follower_users": {
    req: { page: number };
    res: FFResponse;
    query: { userId: number };
  };
  "GET /karaoke_songs": {
    req: Partial<{
      name: string;
      artist_id: number;
      genre_id: number;
      favorite_by_user: number;
      match_name_also_to_artist: boolean;
      original_key: number;
      has_original_key: boolean;
      sort_by: SongSortBy;
      page: number;
    }>;
    res: Repertory;
    query: undefined;
  };
  "GET /karaoke_posts": {
    req: Partial<{
      user_id: number;
    }>;
    res: KaraokePosts;
    query: undefined;
  };
  "GET /users/search": {
    req: { nickname: String };
    res: UserSearch;
    query: undefined;
  };
  "POST /refresh": {
    req: {
      refresh_token: string;
    };
    res: {
      access_token: string;
    };
    query: undefined;
  };
};

export async function api<T extends keyof API>(
  endpoint: T,
  headers: any,
  data: API[T]["req"] | undefined = undefined,
  query: API[T]["query"] | undefined = undefined
): Promise<API[T]["res"]> {
  const [method, url] = endpoint.split(" ");
  const replacedUrl = Object.entries(query ?? {}).reduce(
    (u, [k, r]) => u.replace(new RegExp(`:${k}`, "g"), r as unknown as string),
    url
  );
  try {
    const response = await axios({
      url: `https://api.topia.tv${replacedUrl}${
        method === "GET"
          ? `?${new URLSearchParams(data as any).toString()}`
          : ""
      }`,
      method: method as Method,
      headers,
      data: method === "GET" ? undefined : data,
      transformResponse: (response: string) => {
        return jsonBigint().parse(response);
      },
    });
    return response.data;
  } catch (e) {
    throw { status: e.response.status };
  }
}

export async function tryOrRegenerateToken<T>(
  callback: (client: TestClient) => Promise<T>
) {
  const testClient = await getTestClient();
  try {
    const response = await callback(testClient);

    return response;
  } catch (e) {
    if (e.status !== 401) throw e;

    const options = {
      headers: getHeaders(),
      data: { refresh_token: testClient.refreshToken },
    };
    const response = await api("POST /refresh", options.headers, options.data);

    const newTestClient = {
      ...testClient,
      accessToken: response.access_token,
    };

    return Promise.all([
      callback(newTestClient),
      setAccessToken(response.access_token),
    ]).then(([data]) => data);
  }
}

/* Types */

export type TopiaEvent = {
  id: number;
  event_group_id: number | null;
  priority: number;
  name: string;
  is_forced_to_join: boolean;
  display_total: boolean;
  icon_url: string;
  description: string;
  description_image: string;
  rule: string;
  rule_image: string | null;
  requirement: string;
  requirement_image: string | null;
  benefit: string;
  benefit_image: string | null;
  note: string;
  note_image: string | null;
  start_at: string;
  end_at: string;
  ranking_page_url: string | null;
};

export type User = {
  id: number;
  nickname: string;
  icon_url: string | null;
  email: string | null;
  external_identifier: string;
  firebase_dynamic_link: string;
  free_coin: number | null;
  google_coin: number | null;
  apple_coin: number | null;
  jewel: number | number;
  login_count: number;
  pending_jewel_to_exchange: number;
  push_notification_allowed: "unknown" | string;
  is_rookie: boolean;
  is_verified: boolean;
  joining_event: TopiaEvent | null;
  joining_event_id: number | null;
  selecting_avatar_storage_id: number | null;
  avatar_storage_max: number | null;
  avatar_storage_num: number | null;
  live_background_identifier: string;
  live_thumbnail_identifier: string;
  current_user_meta: {
    follow_to_this_user: FF | null;
    followed_by_this_user: boolean;
  } | null; // TODO
  follow_meta: {
    notify_live_start: boolean;
  } | null; // TODO
};

export type UserProfile = {
  id: number;
  user_id: number;
  twitter_id: number;
  message: string;
  gender: "male" | "female" | string;
  voice_type: "not_yet_selected" | string;
  birthday: string;
  url: string;
  interest_tags: string[];
};

export type UserChannel = {
  id: number;
  user_id: number;
  name: string;
  url: string;
  archive_allowed: boolean;
  live_notification_allowed: boolean;
  follow_notification_allowed: boolean;
  live_start_tweet_allowed: boolean;
  live_start_tweet_message: string;
  record_tweet_allowed: boolean;
  save_movie_allowed: boolean;
  live_intrusion_allowed: "everyone" | string;
  message: string;
  channel_tags: string[];
};

export type UserFCMToken = {
  id: number;
  user_id: number;
  token: string;
};

export type ReservedRoom = {
  id: number;
  user_id: number;
  name: string;
  thumbnail_url: string;
  reserved_date: string;
};

export type Badge = {
  id: number;
  category_type: string;
  icon_type: string;
  rarity: string;
  name: string;
  short_name: string;
  description: string;
  achievement_text: string;
  label_color: `#${string}`;
  event_id: number | null;
  start_at: string;
  end_at: string | null;
};

export type MetaBadgeInfo = {
  id: number;
  user_id: number;
  badge_id: number;
  acquisition_at: string;
  invalid_at: string | null;
  last_equipped_at: string | null;
  event_ranking: number | null;
  is_equipped: boolean;
  is_enable: boolean;
  max_daily_broadcasting_continuance: number;
  now_daily_broadcasting_continuance: number;
};

export type ExtendedUser = {
  user: User;
  earned_gift_points: {
    current_month: number;
  };
  top_cheerer_user_ids: number[];
  /* TODO starts */
  user_avatars: any[];
  user_avatars_coordinates: any[];
  user_avatars_items: any[];
  user_gift_items: any[];
  user_ticket_items: {
    id: number;
    user_id: number;
    ticket_item_id: number;
    count: number;
  }[];
  user_presents: any[];
  /* TODO ends */
  user_profile: UserProfile;
  user_channel: UserChannel;
  user_fcm_token: UserFCMToken;
  user_room?: OpeningRoom;
  user_room_reservation?: ReservedRoom;
  reserved_room?: ReservedRoom;
  current_datetime: string;
  specific_avatar_item_ids: number[];
  following_user_count: number;
  follower_user_count: number;
  sign_in_with_apple_token: any | null; // TODO
  specific_gift_item_ids_as_host: number[];
  specific_gift_item_ids_as_listener: number[];
  specific_live_emote_ids_as_host: number[];
  specific_live_emote_ids_as_listener: number[];
  fes_host_user_configs: any[]; // TODO
  badge: Badge;
  meta_badge_info: MetaBadgeInfo;
  jewel_exchanged_coin: number;
  stripe_coin: number;
  included: {
    events: TopiaEvent[];
  };
};

export type Mission = {
  id: number;
  mission_trigger_id: number;
  name: string;
  description: string;
  category: number;
  clear_line: number;
  clear_count: number;
  start_at: string;
  end_at: string;
};
export type UserMission = {
  id: number;
  user_id: number;
  mission_id: number;
  progress: number;
  goal: number;
  completed_at: string | null;
};

export type Repertory = {
  karaoke_songs: Song[];
  included: {
    karaoke_song_artists: SongArtist[];
    karaoke_song_and_genre_relations: SongGenreRelation[];
    karaoke_song_genres: SongGenre[];
    karaoke_song_requests: any[]; // TODO
  };
  result_list_meta: {
    sorted_by: SongSortBy;
    current_page: number;
    next_page_available: boolean;
  };
};
export type Song = {
  id: number;
  joysound_song_no: string;
  name: string;
  name_yomi: string;
  artist_id: number;
  lyric_writer_name: string;
  composer_name: string;
  duet_type: "ｿﾛ男";
  jasrac_copyright_code: string;
  nextone_copyright_code: string;
  on_sale_date: string;
  info: null; // TODO
  first_of_lyric: string;
  original_url: null; // TODO
  original_key: number;
  has_original_key: boolean;
  has_guide_melody: boolean;
  bpm: number;
  current_user_meta: {
    is_marked_as_favorite: boolean;
  };
  karaoke_song_current_user_meta: {
    is_marked_as_favorite: boolean;
  };
};
export type SongSortBy =
  | "name_asc"
  | "name_desc"
  | "popularity_asc"
  | "popularity_desc"
  | "artist_name_asc"
  | "artist_name_desc"
  | "random";
export type SongArtist = {
  id: number;
  name: string;
  name_yomi: string;
  created_at: string;
  updated_at: string;
  song_count: number | null;
};
export type SongGenreRelation = {
  id: number;
  karaoke_song_id: number;
  karaoke_song_genre_id: number;
  created_at: string;
  updated_at: string;
};
export type SongGenre = {
  id: number;
  name: string;
  image_url: string | null;
  priority: number;
  display_karaoke_posts: boolean;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSearch = {
  users: User[];
  opening_rooms: OpeningRoom[];
};
export type OpeningRoom = {
  id: number;
  broadcast_type: "normal" | "karaoke_box";
  karaoke_queue_needs_approval: boolean;
  status: "opened" | "closed" | string;
  user_id: number;
  name: string;
  thumbnail_url: string;
  external_identifier: string;
  firebase_dynamic_link: string;
  realtime_database_endpoint: string;
  join_count: number;
  created_at: string;
  updated_at: string;
};

export type FF = {
  id: number;
  followable_type: "User" | string;
  followable_id: number;
  follower_type: "User" | string;
  follower_id: number;
  blocked: boolean;
  is_follower_notified_about_followable: boolean;
  created_at: string;
};
export type FFResponse = {
  follows: FF[];
  included: {
    users: User[];
    opening_rooms: OpeningRoom[];
  };
  list_result_meta: {
    sort_key: string;
    sort_direction: string;
    current_page: number;
    next_page_available: boolean;
  };
};

export type KaraokePosts = {
  karaoke_posts: KaraokePost[];
  included: {
    users: {
      id: number;
      nickname: string;
      icon_url: string;
    }[];
    karaoke_songs: {
      id: number;
      artist_id: number;
      name: string;
    }[];
    karaoke_song_artists: {
      id: number;
      name: string;
    }[];
  };
};
export type KaraokePost = {
  id: number;
  user_id: number;
  karaoke_song_id: number;
  audio_url: string;
  comment: string;
  ogp_image_url: string;
  external_identifier: string;
  firebase_dynamic_link: string;
  web_url: string;
  created_at: string;
};
