import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://elenis-cookie.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "shopify-app-users": {
      storageKey: "Role-Shopify-App",
      models: {
        shopifyBillingAddress: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyBillingAddress.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCart: {
          read: {
            filter: "accessControl/filters/shopify/shopifyCart.gelly",
          },
        },
        shopifyCartLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCartLineItem.gelly",
          },
        },
        shopifyCheckout: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCheckout.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutAppliedGiftCard: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCheckoutAppliedGiftCard.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutLineItem: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCheckoutLineItem.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCheckoutShippingRate: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCheckoutShippingRate.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyGdprRequest.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyShop: {
          read: {
            filter: "accessControl/filters/shopify/shopifyShop.gelly",
          },
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: {
            filter: "accessControl/filters/shopify/shopifySync.gelly",
          },
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        uploadFile: {
          actions: {
            create: true,
          },
        },
      },
      actions: {
        scheduledShopifySync: true,
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        uploadFile: {
          actions: {
            create: true,
          },
        },
      },
    },
  },
};
