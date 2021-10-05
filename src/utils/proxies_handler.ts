import { join } from "path";
import { get } from "request";
import { existsSync } from "fs";
import { FileHandler } from "./file_handler";
import { Logger } from "./logger";

export class ProxiesHandler {
  public proxies: string[];
  public proxiesFilePath: string;
  constructor() {
    this.proxiesFilePath = join(__dirname, "../../configs/proxies.txt");
    // global proxies for use it while checking tokens.
    this.proxies = [];
  }
  public init(): Promise<ProxiesHandler> {
    return new Promise((resolve) => {
      (async () => {
        try {
          // check if proxies file exists and assign it.
          if (!existsSync(this.proxiesFilePath)) {
            throw new Error("Invalid proxies file path");
          }
          const proxiesFileContent: string | null = FileHandler.readFile<string>("proxies");

          if (!proxiesFileContent) {
            throw new Error("An error occurred while reading proxies file.");
          }

          const tempProxiesFile: string[] = proxiesFileContent.split("\n");

          for (let i = 0; i < tempProxiesFile.length; i++) {
            const proxy: string = tempProxiesFile[i];
            if (!proxy) delete tempProxiesFile[i];
          }

          if (!tempProxiesFile.length || !proxiesFileContent) {
            throw new Error("Invalid proxies content");
          }

          this.proxies = tempProxiesFile;
          resolve(this);
        } catch (e) {
          // if things wrong will use a default proxies.
          await this.setDefaultProxies(this.proxiesFilePath);
          Logger.error(String(e));
          resolve(this);
        }
      })();
    });
  }
  public async setDefaultProxies(filename: string): Promise<void> {
    try {
      const requestProxies = await new Promise<string[]>((resolve, reject) => {
        get(
          "https://destry.ca1r7.repl.co/v1/proxies",
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
          (error, response, body) => {
            if (error || !body || response.statusCode !== 2e2) {
              return reject(error ?? "Failed to fetch proxies");
            }
            interface ResponseProxiesType {
              status?: boolean;
              content?: string[];
            }
            const proxiesObject: ResponseProxiesType = JSON.parse(body);
            if (
              !("status" in proxiesObject) ||
              !proxiesObject.status ||
              !Array.isArray(proxiesObject.content)
            ) {
              return reject("Wrong content");
            }
            return resolve(proxiesObject.content);
          },
        );
      });
      if (!Array.isArray(requestProxies)) {
        throw new Error("Content is not an array object");
      }
      this.proxies = requestProxies;
      FileHandler.writeFile<string>(filename, requestProxies.join("\n"));
    } catch (e) {
      Logger.error(String(e));
      process.exit(1);
    }
  }
}
