import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">404</h1>

        <p className="text-gray-400">
          The page you’re looking for doesn’t exist.
        </p>

        <Link
          href="/"
          className="
            inline-block
            rounded-md
            bg-blue-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-blue-500
            transition
          "
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
