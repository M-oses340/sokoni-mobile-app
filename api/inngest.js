import { serve } from "inngest/express";
import { inngest, functions } from "../backend/src/config/inngest.js";

export default serve({
  client: inngest,
  functions,
});
