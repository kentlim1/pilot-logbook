import { ImageResponse } from "next/og";
import { appIconElement } from "@/lib/appIcon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(appIconElement(size.width), size);
}
