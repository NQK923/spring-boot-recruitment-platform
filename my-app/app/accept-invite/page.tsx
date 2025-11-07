import { redirect } from "next/navigation";

type AcceptInviteAliasParams = {
  token?: string | string[];
};

type AcceptInviteAliasProps = {
  searchParams: Promise<AcceptInviteAliasParams> | AcceptInviteAliasParams;
};

export default async function AcceptInviteAliasPage({ searchParams }: AcceptInviteAliasProps) {
  const resolved = await Promise.resolve(searchParams);
  const params = new URLSearchParams();

  Object.entries(resolved ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "string") {
        params.append(key, value[0]);
      }
    } else {
        params.append(key, value);
    }
  });

  const query = params.toString();
  redirect(`/auth/accept-invite${query ? `?${query}` : ""}`);
}

