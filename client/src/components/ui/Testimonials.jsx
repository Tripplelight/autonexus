// src/components/ui/Testimonials.jsx
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Brian Otieno', role: 'Bought a Toyota Land Cruiser V8', avatar: 'BO', rating: 5, text: 'The AI chat recommended the perfect car for my family based on my budget and road conditions around Kisumu. Closed the deal in 2 days. Incredible experience!' },
  { name: 'Amina Wanjiku', role: 'Bought a Mazda CX-5', avatar: 'AW', rating: 5, text: 'I typed "reliable SUV for a solo woman under 5M" and AutoNexus AI gave me exactly what I needed with full specs. The price analysis saved me from overpaying.' },
  { name: 'David Kamau', role: 'Bought a BMW 3 Series', avatar: 'DK', rating: 5, text: 'The virtual test drive feature is mad — I asked it everything about the BMW before even visiting the showroom. Knew exactly what I was buying. Zero surprises.' },
  { name: 'Faith Chebet', role: 'Bought a Subaru Forester', avatar: 'FC', rating: 5, text: 'As someone who knows nothing about cars, the AI assistant was like having a knowledgeable friend guide me through the whole process. Totally stress-free.' }
];

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
      <div className="text-center mb-14">
        <p className="text-brand-400 text-xs uppercase tracking-widest font-medium mb-3">Happy Customers</p>
        <h2 className="font-display text-4xl sm:text-5xl tracking-wider">WHAT BUYERS SAY</h2>
        <p className="text-white/40 mt-4 text-sm max-w-md mx-auto">Real stories from real buyers across Kenya</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((t, i) => (
          <div key={i} className="card p-5 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex gap-0.5">
              {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={12} className="text-brand-400 fill-brand-400" />)}
            </div>
            <p className="text-sm text-white/60 leading-relaxed flex-1">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
              <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-white/30">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
