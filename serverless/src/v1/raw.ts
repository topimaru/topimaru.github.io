import axios, { Method } from "axios";
import { Router } from "express";
import jsonBigint from "json-bigint";

import { getHeaders, tryOrRegenerateToken } from "../util/topia";

const router = Router();

router.use("/", async (req, res) => {
  try {
    return res.json(
      await tryOrRegenerateToken(async ({ accessToken }) => {
        const response = await axios({
          url: `https://api.topia.tv${req.query.url}`,
          method: req.method as Method,
          headers: getHeaders(accessToken),
          data: req.body,
          transformResponse: (data: string) => {
            try {
              return jsonBigint().parse(data);
            } catch (e) {
              return data;
            }
          },
        });
        return response.data;
      })
    );
  } catch (e) {
    return res.status(e.status ?? 502).json({ error: e.toString() });
  }
});

export = router;
