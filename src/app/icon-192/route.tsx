import { ImageResponse } from "next/og";
import { appIconElement } from "@/lib/appIcon";

export async function GET() {
  return new ImageResponse(appIconElement(192), { width: 192, height: 192 });
}
