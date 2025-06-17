import React from 'react';
import { Provider } from '@gadgetinc/react';
import { api } from './api';

export const GadgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if we're in Shopify preview mode
  const isPreviewMode = window.Shopify && window.Shopify.Preview;

  if (isPreviewMode) {
    // In preview mode, just render children without Gadget provider
    return <>{children}</>;
  }

  return (
    <Provider api={api}>
      {children}
    </Provider>
  );
}; 