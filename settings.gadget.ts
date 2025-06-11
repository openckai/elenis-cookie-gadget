import type { GadgetSettings } from "gadget-server";

export const settings: GadgetSettings = {
  type: "gadget/settings/v1",
  frameworkVersion: "v1.4.0",
  plugins: {
    connections: {
      shopify: {
        apiVersion: "2025-04",
        enabledModels: [
          "shopifyBillingAddress",
          "shopifyCart",
          "shopifyCartLineItem",
          "shopifyCheckout",
          "shopifyCheckoutAppliedGiftCard",
          "shopifyCheckoutLineItem",
          "shopifyCheckoutShippingRate",
        ],
        type: "partner",
        scopes: [
          "read_checkouts",
          "read_orders",
          "write_checkouts",
          "read_customers",
          "write_customers",
          "write_products",
          "read_products",
          "unauthenticated_read_checkouts",
          "unauthenticated_write_checkouts",
          "unauthenticated_read_content",
          "unauthenticated_read_customer_tags",
          "unauthenticated_read_customers",
          "unauthenticated_write_customers",
          "unauthenticated_read_metaobjects",
          "unauthenticated_read_product_inventory",
          "unauthenticated_read_product_listings",
          "unauthenticated_read_product_pickup_locations",
          "unauthenticated_read_product_tags",
          "unauthenticated_read_selling_plans",
        ],
      },
    },
  },
};
