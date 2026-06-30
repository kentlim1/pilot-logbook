import { ImageResponse } from "next/og";
import { appIconElement } from "@/lib/appIcon";

export async function GET() {
  return new ImageResponse(appIconElement(512), { width: 512, height: 512 });
}
