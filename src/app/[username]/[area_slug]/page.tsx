// @deprecated - Use a rota CamelCase [areaSlug] para evitar conflitos de build no Next.js
import { redirect } from 'next/navigation';

export default async function Page({ params }: any) {
  const resolvedParams = await params;
  redirect(`/${resolvedParams.username}/${resolvedParams.area_slug}`);
}
