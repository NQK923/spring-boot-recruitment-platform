import { NextRequest } from "next/server";
import { proxyChatGet, proxyChatPost, type ChatRouteParams } from "../../../chat/_proxy";

export async function POST(request: NextRequest, context: { params: ChatRouteParams }) {
  return proxyChatPost(request, context.params);
}

export async function GET(request: NextRequest, context: { params: ChatRouteParams }) {
  return proxyChatGet(request, context.params);
}
