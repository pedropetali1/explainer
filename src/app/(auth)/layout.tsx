import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-xl font-semibold tracking-tight"
      >
        Explainer
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
