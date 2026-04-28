export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-green-600">404</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        We couldn&apos;t find what you were looking for.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
      >
        Go home
      </a>
    </div>
  );
}
