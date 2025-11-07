import { NextRequest } from "next/server";
import { proxyChatGet, proxyChatPost, type ChatRouteParams } from "../_proxy";

type ParamsOrPromise = ChatRouteParams | Promise<ChatRouteParams>;

export async function POST(request: NextRequest, context: { params: ParamsOrPromise }) {
  const params = (await context.params) ?? {};
  return proxyChatPost(request, params);
}

export async function GET(request: NextRequest, context: { params: ParamsOrPromise }) {
  const params = (await context.params) ?? {};
  return proxyChatGet(request, params);
}
