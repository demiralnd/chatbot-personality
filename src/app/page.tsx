import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to TechNova
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Choose your chat experience to explore our innovative product catalog
        </p>
        
        <div className="flex gap-6 justify-center mt-8">
          <Link
            href="/warm"
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Chat A
          </Link>
          
          <Link
            href="/formal"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Chat B
          </Link>
        </div>
        
        <div className="mt-16">
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </main>
  );
}