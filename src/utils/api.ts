/* eslint-disable no-throw-literal */
import axios, { AxiosError, Method } from "axios";
import { useRecoilValue } from "recoil";
import { serverMajorVersionState } from "../recoil/version";

export const host =
  "https://3vqvwv089j.execute-api.us-east-1.amazonaws.com";

export const useApi = () => {
  const majorVersion = useRecoilValue(serverMajorVersionState);
  if (!majorVersion) return null;

  const versionedHost = `${host}/v${majorVersion}`;

  return async (method: Method, endpoint: string, data?: any) => {
    try {
      const response = await axios({
        url: `${versionedHost}${endpoint}${
          method === "GET"
            ? `?${new URLSearchParams(data as any).toString()}`
            : ""
        }`,
        method: method as Method,
        data: method === "GET" ? undefined : data,
      });

      return response.data;
    } catch (e) {
      throw { status: (e as AxiosError).response?.status };
    }
  };
};
