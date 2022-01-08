import { FunctionComponent } from "react";
import Link from "./Link";

interface Props {
  big?: boolean;
  name?: string;
  profileImage?: string;
  to?: string;
}

const User: FunctionComponent<Props> = ({
  name,
  profileImage,
  to,
  big = false,
}) =>
  name ? (
    <div
      className={`flex flex-col flex-grow-0 flex-shrink-0 ${
        big ? "mb-6 w-24" : "mb-2 w-20 h-20"
      }`}
      style={{
        height: "fit-content",
      }}
    >
      <Link to={to}>
        <div
          className={`flex flex-col flex-grow-0 flex-shrink-0 text-center ${
            big ? "gap-2" : "gap-1"
          }`}
        >
          <div className={`mx-auto ${big ? "w-16 h-16" : "w-14 h-14"}`}>
            <img
              alt={`${name}さんのアイコン`}
              title={`${name}さんのアイコン`}
              className={
                big
                  ? "object-cover object-center w-16 h-16 rounded-3xl"
                  : "object-cover object-center w-14 h-14 rounded-2xl"
              }
              src={
                profileImage ??
                "https://karaoke.topia.tv/IconProfileDefault.png"
              }
              onError={(e) => {
                e.currentTarget.src =
                  "https://karaoke.topia.tv/IconProfileDefault.png";
              }}
              style={profileImage ? {} : { backgroundColor: "#adadad" }}
            />
          </div>
          <div
            className={`w-full ${
              big ? "overflow-hidden text-sm" : "h-5 text-xs truncate"
            }`}
            style={
              big
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    textOverflow: "ellipsis",
                    WebkitBoxOrient: "vertical",
                  }
                : {}
            }
          >
            {name}
          </div>
        </div>
      </Link>
    </div>
  ) : (
    <div className={`h-0 ${big ? "w-24" : "w-20"}`} aria-hidden />
  );

export default User;
