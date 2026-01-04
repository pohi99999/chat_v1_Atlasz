export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-lg text-slate-600 mb-8">Az oldal nem található</p>
      <a href="/" className="text-blue-600 hover:underline">Vissza a főoldalra</a>
    </div>
  );
}
