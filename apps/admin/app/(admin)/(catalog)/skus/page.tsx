import { redirect } from 'next/navigation';

export default async function SkusPage() {
  redirect('/products?tab=skus');
}
