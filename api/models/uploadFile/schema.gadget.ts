import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "uploadFile" model, go to https://elenis-cookie.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "eHz5uZfhG9PG",
  fields: {
    description: { type: "string", storageKey: "8fStK85IQZ6C" },
    file: {
      type: "file",
      allowPublicAccess: false,
      storageKey: "vvwxpgMUOau7",
    },
    fileName: { type: "string", storageKey: "zdrZcEabhrfm" },
    fileSize: { type: "number", storageKey: "J6kajNZbTVIn" },
    isPublic: { type: "boolean", storageKey: "viNzVE9jDoGJ" },
    mimeType: { type: "string", storageKey: "oYx0wOcNvPzO" },
    url: { type: "string", storageKey: "XyLWEE_gFr5i" },
  },
};
