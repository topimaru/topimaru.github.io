import fastify, {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from "fastify";
import fastifyCors from "fastify-cors";
import axios from "axios";
import { Server, IncomingMessage, ServerResponse } from "http";

const clientVersion = "9999.9999.9999";

const getHeader = (token: string) => ({
  Host: "api.topia.tv",
  authorization: `Bearer ${token}`,
  "x-clientversion": clientVersion,
  accept: "application/json",
  "accept-encoding": "gzip, identity",
  "user-agent": "BestHTTP/2 v2.5.3",
  "content-type": "application/json; charset=UTF-8",
});

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  fastify({ logger: true });

server.register(fastifyCors);

server.post(
  "/validate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await axios
      .get("https://api.topia.tv/self", {
        headers: getHeader(request.body as string),
      })
      .then((r) => ({ success: r.status < 300 }))
      .catch(() => ({ success: false }));
    return response;
  }
);

server.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
  const req = JSON.parse(request.body as string);
  const response = await axios.post(
    "https://api.topia.tv/user_comment_templates",
    req.string,
    {
      headers: getHeader(req.token),
    }
  );

  return response.data;
});

server.listen(3001, (err) => {
  if (err) throw err;
});
