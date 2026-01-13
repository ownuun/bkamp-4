import { OrderProvider } from '@/context/OrderContext';
import Header from '@/components/Header';

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrderProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </OrderProvider>
  );
}
