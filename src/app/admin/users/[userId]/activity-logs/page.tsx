import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ userId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function LegacyAdminUserActivityLogsRedirect({
  params,
  searchParams,
}: PageProps) {
  const { userId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const query = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(resolvedSearchParams ?? {})) {
    const value = firstValue(rawValue);
    if (typeof value === "string" && value.length > 0) {
      query.set(key, value);
    }
  }
  query.set("userId", userId);
  if (!query.get("sort")) {
    query.set("sort", "createdAt,desc");
  }

  redirect(`/admin/activity-logs?${query.toString()}`);
}
