import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '53f12df02c1f1fb2e65d23f4bf6889456928bd75', queries,  });
export default client;
  