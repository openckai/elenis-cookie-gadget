// Sets up the API client for interacting with your backend.
// For your API reference, visit: https://docs.gadget.dev/api/elenis-cookie
import { Client } from "@gadget-client/elenis-cookie";

export const api = new Client({ environment: window.gadgetConfig.environment });