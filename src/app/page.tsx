import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 text-center">
      <h1 className="text-2xl font-semibold">Checkout USA</h1>
      <p className="text-neutral-600">Stripe-powered checkout for physical products.</p>
      <div className="flex gap-3">
        <Link href="/admin/login" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          Admin login
        </Link>
        <Link href="/checkout/demo-product" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium">
          View demo checkout
        </Link>
      </div>
    </div>
  );
}
