import { Inngest } from "inngest";

// Create the Inngest client
export const inngest = new Inngest({
  id: "smart-ticket-system",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
