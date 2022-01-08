import axios from "axios";
import { FunctionComponent, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { serverVersionState } from "../recoil/version";

import { host } from "../utils/api";

const Global: FunctionComponent = () => {
  const setServerVersion = useSetRecoilState(serverVersionState);

  useEffect(() => {
    try {
      axios({
        url: host,
        method: "GET",
      })
        .then((response) => response.data)
        .then(({ version }) => {
          setServerVersion(version);
        });
    } catch (e) {}
  }, []);

  return null;
};

export default Global;
