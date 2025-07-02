import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardOverview from './DashboardOverview';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}