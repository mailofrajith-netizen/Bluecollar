const REVIEWS = [
  {
    text: 'The fabric quality is amazing. Perfect fit and wrinkle free exactly as promised.',
    name: 'Rahul Verma',
    stars: 5,
    initials: 'RV',
    color: '#d4956a',
  },
  {
    text: 'Finally found shirts that are comfortable and look premium at the same time.',
    name: 'Arjun Mehta',
    stars: 5,
    initials: 'AM',
    color: '#8b9fc4',
  },
  {
    text: 'Great stitching, perfect fitting and fabric is top notch. Highly recommended!',
    name: 'Karan Singh',
    stars: 5,
    initials: 'KS',
    color: '#7cb8a4',
  },
];

function StarFill() {
  return (
    <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-10 h-0.5 mx-auto mb-4" style={{ backgroundColor: '#c8922a' }} />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1a1a1a] uppercase tracking-wider">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white border border-[#e8e0d8] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl font-serif leading-none mb-3" style={{ color: '#e8e0d8' }}>"</div>
              <p className="text-sm text-[#4a4a4a] leading-relaxed mb-5">{r.text}</p>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((i) => <StarFill key={i} />)}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: r.color }}>
                  {r.initials}
                </div>
                <span className="font-semibold text-sm text-[#1a1a1a]">— {r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
