import os from "os";
import https from "https";
import { join } from "path";
import request from "request";
import unzipper from "unzipper";
import { spawn } from "child_process";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { platform } from "process";
import { IncomingMessage } from "http";
import { Logger } from "./logger";
import { FileHandler } from "./file_handler";

interface PackageFileType {
  name: string;
  version: string;
}

export class Updater {
  private pkgFile: string;
  private tempFolder: string;
  private rawFileRepo: string;
  constructor() {
    this.pkgFile = "https://raw.githubusercontent.com/CA1R7/destry-cli/main/package.json";
    this.rawFileRepo = "https://codeload.github.com/CA1R7/destry-cli/zip/main";
    this.tempFolder = join(os.tmpdir(), "./destry_cli");
    this.init();
  }
  public init(): void {
    if (!existsSync(this.tempFolder)) {
      mkdirSync(this.tempFolder);
    }
  }
  public async checkForUpdates(): Promise<undefined | boolean> {
    this.init();
    const fetchUpdatesDetails = await new Promise<undefined | boolean>((resolve) => {
      if (platform !== "win32") {
        // Updating system for win32 only.
        return resolve(false);
      }
      Logger.warn(`Checking for updates ...`);
      request.get(
        this.pkgFile,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
        async (error, _response, body) => {
          try {
            if (error || !body) {
              throw new Error("Invalid updates details content.");
            }
            const details: PackageFileType = JSON.parse(body);
            const currentVersion: PackageFileType | null = FileHandler.readFile<PackageFileType>(
              join(__dirname, "../../package.json"),
              true,
            );

            if (currentVersion && currentVersion.version !== details.version) {
              this.downloadUpdate(details);
            } else {
              return resolve(false);
            }
          } catch (e) {
            Logger.error(String(e));
            return resolve(false);
          }
        },
      );
    });
    return fetchUpdatesDetails;
  }
  public downloadUpdate(details: PackageFileType): void {
    try {
      const file_zip = join(this.tempFolder, `./version_${details.version}.zip`);
      const outStream = createWriteStream(file_zip);
      https
        .get(this.rawFileRepo)
        .on("response", (res: IncomingMessage) => {
          const _len: string | undefined = res.headers["content-length"];
          const len: number = _len ? parseInt(_len) : NaN;
          let downloaded = 0;
          let percent = 0;
          let slash = "/";
          res
            .on("data", (chunk) => {
              outStream.write(chunk);
              downloaded += chunk.length;
              percent = Number(((100 * downloaded) / len).toFixed(2));
              // simple animation for downloading
              if (slash === "/") {
                slash = "-";
              } else if (slash === "-") {
                slash = "\\";
              } else if (slash === "\\") {
                slash = "/";
              }
              if (process.stderr.clearLine) {
                process.stderr.clearLine(0);
                process.stderr.cursorTo(0);
              }
              process.stderr.write(
                `[\x1b[32mUPDATER\x1b[0m] ${slash} Downloading update v${details.version} ... ${
                  isNaN(len) ? downloaded + " Bytes" : percent + "%"
                }`,
              );
            })
            .on("end", async () => {
              outStream.end();
              if (isNaN(len) || percent >= 1e2) {
                process.stderr.write("\n");
                await this.installUpdate({ ...details, zipFile: file_zip });
              }
            });
        })
        .on("error", (e) => {
          throw new Error(String(e));
        });
    } catch (e) {
      Logger.error(String(e));
    }
  }
  public async installUpdate(details: PackageFileType & { zipFile: string }): Promise<void> {
    // install update by running updater batch file for latest copy.
    Logger.info(`Installing update v${details.version} ...`);
    try {
      FileHandler.writeFile<typeof details>(join(__dirname, "../../package.json"), details, true);
      createReadStream(details.zipFile)
        .pipe(unzipper.Extract({ path: this.tempFolder }))
        .promise()
        .then(async () => {
          if (!existsSync((this.tempFolder = join(this.tempFolder, "./destry-cli-main/src")))) {
            throw new Error("Something went wrong while extracting update zip file.");
          }
          const startProcess = spawn(join(__dirname, "../../shells/updater_cli.bat"), [], {
            cwd: join(__dirname, "../../src"),
          });
          startProcess.stdout.on("data", (data: Buffer) => {
            console.log(data.toString());
          });
          startProcess.stderr.on("data", (data: Buffer) => {
            console.error(data.toString());
          });
          startProcess.on("close", (code: number) => {
            Logger.warn(`child process exited with code ${code}`);
          });
        });
    } catch (e) {
      Logger.error(String(e));
    }
  }
}
