import { Updater } from "./utils/updater";
import { ToolStartManager } from "./middlewares/tools";
import { PreviewStartQuestions } from "./utils/preview";
import { ProxiesHandler } from "./utils/proxies_handler";

(async () => {
  const updater = new Updater();
  const ProxyHandler = await new ProxiesHandler().init();
  const fetchDetailsUpdate = await updater.checkForUpdates();
  if (fetchDetailsUpdate !== false) return;
  const options = await PreviewStartQuestions();
  ToolStartManager({ proxieshandler: ProxyHandler, options });
})();
