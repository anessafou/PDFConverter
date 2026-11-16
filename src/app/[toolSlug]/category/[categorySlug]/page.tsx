import { notFound } from 'next/navigation';
import { SUPPORTED_LOCALES, type Locale } from '@/config/i18n-registry';
import CategoryHubPage, { generateMetadata as categoryMetadata } from '@/app/category/[categorySlug]/page';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ toolSlug: string; categorySlug: string }> };
export async function generateMetadata({ params }: Props) {
  const { toolSlug, categorySlug } = await params;
  if (!SUPPORTED_LOCALES.includes(toolSlug as Locale)) return {};
  return categoryMetadata({ params: Promise.resolve({ categorySlug }) });
}
export default async function LocalizedCategory({ params }: Props) {
  const { toolSlug, categorySlug } = await params;
  if (!SUPPORTED_LOCALES.includes(toolSlug as Locale)) notFound();
  return <CategoryHubPage params={Promise.resolve({ categorySlug })} />;
}
