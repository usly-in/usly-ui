export function generateStaticParams() { return []; }

import ClientPage from "./ClientPage";

export default async function Page(props: { params?: Promise<Record<string, unknown>> }) {
  const paramsResolved = await props.params;
  const p = paramsResolved as Record<string, unknown> | undefined;
  const id = p && typeof p["id"] === "string" ? (p["id"] as string) : "";
  return <ClientPage id={id} />;
}
