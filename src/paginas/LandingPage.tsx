import { AppLayout, Button } from '../componentes';

export default function LandingPage() {
  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold mb-4">DailySet</h1>
        <p className="text-neutral-400 text-center mb-8">
          La app definitiva para tus entrenamientos de fuerza
        </p>
        <Button variant="primary">Comenzar ahora</Button>
      </div>
    </AppLayout>
  );
}