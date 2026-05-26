import { redirect } from 'next/navigation';

export default async function ProductRedirectPage({ params }) {
  const { id } = await params;
  redirect(`/products/${id}`);
}
