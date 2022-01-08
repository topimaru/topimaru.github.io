import serverless from "serverless-http";
import express from "express";
import cors from "cors";

import v1 from "./v1";

const config = {
  version: "1.0",
};

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);

app.get("/", async (req, res) => {
  res.status(200).json({ version: config.version });
});

app.use("/v1", v1);

export = {
  handler: serverless(app as any),
};
