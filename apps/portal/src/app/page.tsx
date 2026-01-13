import { services, getServiceUrl } from '@bkamp/shared';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50 py-12 px-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12">
        <div className="nb-card p-6 bg-nb-yellow">
          <h1 className="text-4xl md:text-6xl font-black text-black">
            BKAMP Services
          </h1>
          <p className="text-lg md:text-xl mt-2 text-black/80">
            다양한 서비스를 한 곳에서
          </p>
        </div>
      </header>

      {/* Service Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-16">
        <div className="nb-card p-4 bg-black text-white text-center">
          <p className="font-bold">Built with bkamp</p>
        </div>
      </footer>
    </main>
  );
}

function ServiceCard({ service }: { service: (typeof services)[number] }) {
  const colorMap: Record<string, string> = {
    '#ef4444': 'bg-nb-red',
    '#8b5cf6': 'bg-nb-purple',
    '#f97316': 'bg-nb-orange',
    '#0ea5e9': 'bg-nb-cyan',
    '#3b82f6': 'bg-nb-blue',
    '#6366f1': 'bg-nb-purple',
    '#22c55e': 'bg-nb-green',
  };

  const bgColor = colorMap[service.color] || 'bg-white';
  const serviceUrl = getServiceUrl(service.id);

  return (
    <a href={serviceUrl} target="_blank" rel="noopener noreferrer">
      <div className={`nb-card p-6 ${bgColor} cursor-pointer h-full`}>
        <div className="text-5xl mb-4">{service.icon}</div>
        <h2 className="text-xl font-black text-black mb-2">{service.name}</h2>
        <p className="text-black/70">{service.description}</p>
        {!service.ready && (
          <span className="inline-block mt-4 px-3 py-1 bg-black text-white text-sm font-bold rounded-full">
            Coming Soon
          </span>
        )}
      </div>
    </a>
  );
}
