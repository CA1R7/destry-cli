import { join } from "path";
import { readFileSync, unlinkSync, writeFileSync } from "fs";

export type FileNameType = "config" | "proxies" | string;

export class File_Handler {
  public readFile<T>(file: FileNameType, parseIt?: boolean): T | null {
    try {
      if (!file) {
        throw new Error("Error argument is required");
      }
      const file_path: FileNameType = this.constants_paths(file) ?? file;
      let file_raw: T | string = readFileSync(file_path, "utf-8");
      if (parseIt) {
        file_raw = JSON.parse(file_raw);
      }
      return file_raw as unknown as T;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  public writeFile<Y>(file: FileNameType, _content: Y, formatIt?: boolean): boolean {
    try {
      if (!file || !_content) {
        throw new Error("Error argument is required");
      }
      let content: Y | string = _content;
      const file_path: FileNameType = this.constants_paths(file) ?? file;
      if (formatIt) content = JSON.stringify(content, null, 2);
      writeFileSync(file_path, content as string);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  public removeFile(file: FileNameType): boolean {
    try {
      if (!file) {
        throw new Error("Error argument is required");
      }
      const file_path: FileNameType = this.constants_paths(file) ?? file;
      unlinkSync(file_path);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  private constants_paths(key: FileNameType): FileNameType | null {
    const file_ext: string = key.indexOf("config") >= 0 ? "json" : "txt";

    switch (key) {
      case "config":
      case "proxies":
        return join(__dirname, `../../configs/${key}.${file_ext}`);
      default:
        return null;
    }
  }
}

export const FileHandler = new File_Handler();
