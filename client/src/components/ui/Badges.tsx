import { getStatusColor, getPriorityColor, statusLabel } from '../../utils/helpers';
import type { ComplaintStatus, Priority } from '../../types';

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span className={`badge border ${getStatusColor(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge border ${getPriorityColor(priority)}`}>
      {priority}
    </span>
  );
}
