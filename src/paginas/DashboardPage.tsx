import { AppLayout, Header, WorkoutCard } from '../componentes';

export default function DashboardPage() {
  return (
    <AppLayout>
      <Header />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-6">Mis Rutinas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkoutCard />
          <WorkoutCard />
          <WorkoutCard />
        </div>
      </main>
    </AppLayout>
  );
}