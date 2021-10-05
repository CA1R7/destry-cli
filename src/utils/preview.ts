import { join } from "path";
import inquirer from "inquirer";
import { existsSync, mkdirSync } from "fs";
import { FileHandler } from "./file_handler";

export type ProxiesProtocols = "http" | "https" | "socks4" | "socks5";

export type YesNoType = "yes" | "no";

export interface OptionsType {
  protocol?: ProxiesProtocols;
  version: number;
  proxiesQs: YesNoType;
  saveOptionsQs: YesNoType;
  max_checks: number;
  delay_time: number;
}

export const PreviewStartQuestions = async (): Promise<OptionsType> => {
  initGenerale();
  console.log(`       :::::::::  :\x1b[31m:::::\x1b[0m:::: ::\x1b[36m::::::\x1b[0m ::\x1b[33m::::::\x1b[0m::: :::\x1b[35m::::::\x1b[0m  :::   ::: 
      \x1b[34m:+:\x1b[0m    :+: :+:       :+:    :+:    :+:     :+:    :+: :+:   \x1b[31m:+:\x1b[0m  
     +:+    +:+ +:+       +:+           +:+     +:+    +:+  +:+ +:+    
    +#+    +:+ \x1b[32m+#++:+\x1b[0m+#  +#++:\x1b[36m++#+\x1b[0m+    +#+     +#++:++#:    +#++:      
   +#+    +#+ +#+              +#+    +#+     +#+    +#+    +#+        
  #+#    #+# #+#       #+#    #+#    #+#     #+#    \x1b[35m#+#\x1b[0m    #+#         
 #\x1b[32m#######\x1b[0m#  ###\x1b[34m#####\x1b[0m## ###\x1b[36m###\x1b[0m##     ###     ###    ###    #\x1b[33m##\x1b[0m`);
  const options_in: OptionsType = await new Promise((resolve, reject) => {
    (async () => {
      try {
        if (existsSync(join(__dirname, "../../configs/config.json"))) {
          const oldConfigs: { old_configs: "yes" | "no" } = await inquirer.prompt([
            {
              type: "list",
              name: "old_configs",
              message: "Do you wanna use last configs saved?",
              choices: ["yes", "no"],
              default() {
                return "no";
              },
            },
          ]);
          if (oldConfigs.old_configs === "yes") {
            const raw_configs: OptionsType | null = FileHandler.readFile<OptionsType>(
              "config",
              true,
            );
            if (raw_configs) {
              return resolve(raw_configs);
            }
          }
        }
        const OptionsResult: OptionsType = await inquirer.prompt([
          {
            type: "list",
            name: "proxiesQs",
            message: "Do you wanna use the proxies (if you don't sure about it let it no) ?",
            choices: ["yes", "no"],
            default() {
              return "no";
            },
          },
          {
            type: "list",
            name: "protocol",
            message: "Select the procotol for proxies are you use ? (http)",
            choices: ["http", "https", "socks4", "socks5"],
            default() {
              return "http";
            },
          },
          {
            type: "list",
            name: "version",
            message: "Select discord API version ? (v9)",
            choices: [8, 9],
            default() {
              return 9;
            },
          },
          {
            type: "number",
            name: "max_checks",
            message: "How many checks you want (0 infinity) ? (100 checks)",
            default() {
              return 100;
            },
          },
          {
            type: "number",
            name: "delay_time",
            message: "Enter delay time for each request ? (1 seconde)",
            default() {
              return 1;
            },
          },
          {
            type: "list",
            name: "saveOptionsQs",
            message: "Do you save the configs for use it again later ?",
            choices: ["yes", "no"],
            default() {
              return "yes";
            },
          },
        ]);
        return resolve(OptionsResult);
      } catch (e) {
        return reject(e);
      }
    })();
  });
  if (options_in.saveOptionsQs === "yes") {
    FileHandler.writeFile<OptionsType>("config", options_in, true);
  }
  return options_in;
};

const initGenerale = (): void => {
  const resultPath: string = join(__dirname, "../../result");
  if (!existsSync(resultPath)) {
    mkdirSync(resultPath);
  }
};
