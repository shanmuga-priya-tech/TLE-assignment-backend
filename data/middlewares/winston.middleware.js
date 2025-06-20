import logger from "../helpers/loggers/file_rotation/winston.log.js";
import { encrypt } from "../helpers/utils/encrypt.js";

const isEncryptionRequired = (url) => {
  const requiredUrls = ["/auth/register", "/auth/login"];
  let requiredFlag = false;
  for (const requiredUrl of requiredUrls) {
    if (url.includes(requiredUrl)) {
      requiredFlag = true;
      break;
    }
  }
  return requiredFlag;
};

const rotationalLogger = (req, res, next) => {
  try {
    let body = req.body;
    if (isEncryptionRequired(req.url)) {
      body = encrypt(JSON.stringify(req.body));
    }

    res.on("finish", () => {
      logger.info({
        logType: "info", //TODO: separate loggers required for other log types
        method: req.method,
        url: req.originalUrl,
        body: body,
        queryParams: req.query,
        ip: req.ip || req.socket.remoteAddress,
        statusCode: res.statusCode,
        // TODO: add response and latency
      });
    });
  } catch (error) {
    console.error("Error while writing rotational log :: rotationalLogger()");
    console.error(error);
    // TODO: threshold based alerts
  }
  next();
};

export default rotationalLogger;
