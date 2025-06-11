import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyBillingAddress" model, go to https://elenis-cookie.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-BillingAddress",
  fields: {},
  shopify: {
    fields: [
      "address1",
      "address2",
      "checkouts",
      "city",
      "company",
      "country",
      "countryCode",
      "firstName",
      "lastName",
      "phone",
      "province",
      "provinceCode",
      "shop",
      "zipCode",
    ],
  },
};
