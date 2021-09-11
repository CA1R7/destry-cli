import { ToolStartManager } from "./middlewares/tools";
import { PreviewStartQuestions } from "./utils/preview";
import { ProxiesHandler } from "./utils/proxies_handler";

(async () => {
  const ProxyHandler = await new ProxiesHandler().init();
  const options = await PreviewStartQuestions();
  ToolStartManager({ proxieshandler: ProxyHandler, options });
})();
