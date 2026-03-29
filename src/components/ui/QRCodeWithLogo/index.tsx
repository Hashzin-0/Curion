'use client';

import { QRCodeSVG } from 'qrcode.react';
import type { QRCodeProps } from 'qrcode.react';

interface QRCodeWithLogoProps extends Omit<QRCodeProps, 'imageSettings'> {
  logoUrl?: string | null;
  logoSize?: number;
}

const DEFAULT_LOGO = '/icon-512.png';

export function QRCodeWithLogo({
  value,
  size = 160,
  level = 'H',
  fgColor,
  logoUrl,
  logoSize,
  ...props
}: QRCodeWithLogoProps): React.ReactElement {
  const effectiveLogoUrl = logoUrl || DEFAULT_LOGO;
  const effectiveLogoSize = logoSize || Math.round(size * 0.2);

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level={level}
      fgColor={fgColor}
      imageSettings={{
        src: effectiveLogoUrl,
        height: effectiveLogoSize,
        width: effectiveLogoSize,
        excavate: true,
      }}
      {...props}
    />
  );
}
