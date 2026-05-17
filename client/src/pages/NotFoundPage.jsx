// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-9xl text-white/5">404</p>
      <h1 className="font-display text-4xl tracking-wider -mt-10 mb-4">PAGE NOT FOUND</h1>
      <p className="text-white/40 mb-8">This road doesn't exist. Let's get you back on track.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}
