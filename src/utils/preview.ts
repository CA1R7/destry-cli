import { join } from "path";
import inquirer from "inquirer";
import { existsSync, mkdirSync } from "fs";

export type ProxiesProtocols = "http" | "https" | "socks4" | "socks5";

export interface OptionsType {
  protocol: ProxiesProtocols;
  version: number;
  max_checks: number;
  delay_time: number;
}

export const PreviewStartQuestions = (): Promise<OptionsType> => {
  initGenerale();
  console.log(`       :::::::::  :\x1b[31m:::::\x1b[0m:::: ::\x1b[36m::::::\x1b[0m ::\x1b[33m::::::\x1b[0m::: :::\x1b[35m::::::\x1b[0m  :::   ::: 
      \x1b[34m:+:\x1b[0m    :+: :+:       :+:    :+:    :+:     :+:    :+: :+:   \x1b[31m:+:\x1b[0m  
     +:+    +:+ +:+       +:+           +:+     +:+    +:+  +:+ +:+    
    +#+    +:+ \x1b[32m+#++:+\x1b[0m+#  +#++:\x1b[36m++#+\x1b[0m+    +#+     +#++:++#:    +#++:      
   +#+    +#+ +#+              +#+    +#+     +#+    +#+    +#+        
  #+#    #+# #+#       #+#    #+#    #+#     #+#    \x1b[35m#+#\x1b[0m    #+#         
 #\x1b[32m#######\x1b[0m#  ###\x1b[34m#####\x1b[0m## ###\x1b[36m###\x1b[0m##     ###     ###    ###    #\x1b[33m##\x1b[0m`);
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const OptionsResult = await inquirer.prompt([
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
            choices: [4, 5, 6, 7, 8, 9],
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
        ]);
        return resolve(OptionsResult);
      } catch (e) {
        return reject(e);
      }
    })();
  });
};

const initGenerale = (): void => {
  const resultPath: string = join(__dirname, "../../result");
  if (!existsSync(resultPath)) {
    mkdirSync(resultPath);
  }
};
