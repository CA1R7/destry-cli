export const Logger = {
  info: (msg: string): void => {
    console.log(`[\x1b[32m+\x1b[0m] - ${msg}`);
  },
  error: (msg: string): void => {
    console.log(`[\x1b[31m+\x1b[0m] - ${msg}`);
  },
  warn: (msg: string): void => {
    console.log(`[\x1b[33m+\x1b[0m] - ${msg}`);
  },
};
