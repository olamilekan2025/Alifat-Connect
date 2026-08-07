export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-800 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
