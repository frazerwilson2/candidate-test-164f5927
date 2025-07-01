import { useSelector, useDispatch } from "react-redux";
import { DashboardRootState, DashboardDispatch } from "../store";
import { updateWorkStatus } from "../store/userSlice";
import { WorkStatus } from "../../shared/types";
import { useCallback } from "react";
import { postAvailabilityEvent, useAvailabilityListener } from "../../shared/events/availabilityEvent";

export const WorkStatusCard = ({ className = "" }: { className?: string }) => {
  const { profile } = useSelector((state: DashboardRootState) => state.user);
  const dispatch = useDispatch<DashboardDispatch>();

  const statusLabels: Record<WorkStatus, string> = {
    looking: "Currently looking for work",
    passive: "Passively looking for work",
    not_looking: "Don't want to hear about work",
  };

  useAvailabilityListener(useCallback((incomingAvailability: WorkStatus) => {
    if (incomingAvailability === profile.workStatus) return; // Avoid unnecessary updates
    dispatch(updateWorkStatus(incomingAvailability));
  }, [profile.workStatus, dispatch]));

  const handleStatusChange = (newStatus:WorkStatus) => {
    // Post event to notify other micro-frontends
    postAvailabilityEvent(newStatus);
    dispatch(updateWorkStatus(newStatus));
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 h-full ${className}`}>
      <h3 className="text-lg font-medium mb-4 pb-3 border-b border-gray-200">
        Your Work Status
      </h3>
      <div className="py-2">
        <p className="mb-4">Update your availability for new opportunities:</p>
        <div className="grid gap-3 mb-6">
        {Object.keys(statusLabels).map((option) => (
          <button
            key={statusLabels[option as WorkStatus]}
            onClick={() => handleStatusChange(option as WorkStatus)}
            disabled={profile.workStatus === option}
            className={`
              py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
              ${profile.workStatus === option
                ? 'active text-white shadow-md transform scale-105'
                : 'hover:shadow-sm'
              }
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50
            `}
          >
            {statusLabels[option as WorkStatus]}
          </button>
        ))}
        </div>
      </div>
    </div>
  );
};
