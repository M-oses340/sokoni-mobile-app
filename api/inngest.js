import { serve } from "inngest/server";
import { inngest, functions } from "../backend/src/config/inngest.js";

export default serve({
  client: inngest,
  functions,
});
