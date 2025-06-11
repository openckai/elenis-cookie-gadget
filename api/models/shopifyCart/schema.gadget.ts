import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCart" model, go to https://elenis-cookie.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Cart",
  fields: {},
  shopify: {
    fields: [
      "lineItems",
      "note",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "token",
    ],
  },
};
