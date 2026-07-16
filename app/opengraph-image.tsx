import { ImageResponse } from 'next/og';
import { OG_IMAGE_SIZE, siteShareImageElement } from '@/lib/og-image';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(siteShareImageElement(), { ...size });
}
