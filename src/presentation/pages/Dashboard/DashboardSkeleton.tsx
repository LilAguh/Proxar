import { Card } from '@presentation/atoms';
import { Skeleton } from '@presentation/atoms';
import './Dashboard.scss';

const MetricCardSkeleton = () => (
  <Card className="dashboard__metric">
    <div className="dashboard__metric-header">
      <Skeleton width={36} height={36} borderRadius={8} />
      <Skeleton width={80} height={14} />
    </div>
    <div className="dashboard__metric-content">
      <Skeleton width={120} height={42} borderRadius={6} />
      <div className="dashboard__metric-breakdown">
        <Skeleton width={70} height={12} />
        <Skeleton width={90} height={12} />
        <Skeleton width={80} height={12} />
      </div>
    </div>
  </Card>
);

export const DashboardSkeleton = () => (
  <div className="dashboard">
    <div className="dashboard__header">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton width={160} height={32} borderRadius={6} />
        <Skeleton width={220} height={16} />
      </div>
    </div>

    <div className="dashboard__metrics">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>

    <Card className="dashboard__recent">
      <div className="dashboard__recent-header">
        <Skeleton width={160} height={20} />
        <Skeleton width={80} height={14} />
      </div>
      <div className="dashboard__recent-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="dashboard__recent-item" style={{ cursor: 'default' }}>
            <div className="dashboard__recent-info">
              <Skeleton width={40} height={24} borderRadius={4} />
              <Skeleton width={200} height={16} />
            </div>
            <Skeleton width={100} height={14} />
          </div>
        ))}
      </div>
    </Card>
  </div>
);
