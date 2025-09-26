// Stub BetaCreator component for static builds
// The actual component is in betacreator/src/components/BetaCreator.tsx
// but we create this stub to satisfy imports for static builds

import React, { forwardRef } from 'react';

export interface BetaCreatorRef {
  getData: (escape?: boolean) => string;
  loadData: (data: string) => void;
  getImage: (includeSource?: boolean, type?: string, width?: number) => string;
}

export interface BetaCreatorProps {
  src?: string;
  imageUrl?: string;
  width?: number | string;
  height?: number | string;
  topoData?: string;
  initialData?: string;
  onReady?: () => void;
  onError?: (error: any) => void;
  onChange?: () => void;
}

// Stub component for static builds - this won't actually render in production
const BetaCreator = forwardRef<BetaCreatorRef, BetaCreatorProps>((props, ref) => {
  // In static builds, this component is not functional
  // It's just here to satisfy TypeScript imports
  
  React.useImperativeHandle(ref, () => ({
    getData: () => '',
    loadData: () => {},
    getImage: () => '',
  }));

  return (
    <div style={{ width: props.width, height: props.height }}>
      <p>BetaCreator is not available in static builds</p>
    </div>
  );
});

BetaCreator.displayName = 'BetaCreator';

export default BetaCreator;