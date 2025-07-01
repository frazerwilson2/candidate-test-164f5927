import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavRootState, NavDispatch } from "../store";
import { updateWorkStatus } from "../store/userSlice";
import { AVAILABILITY_MESSAGE_TYPE, WorkStatus } from "../../shared/types";

export const UserAvatar = () => {
  const { profile } = useSelector((state: NavRootState) => state.user);
  const dispatch = useDispatch<NavDispatch>();
  const [dropdownOpen, setDropdownOpen] = useState(false);

      useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            console.warn('Received message from unknown origin:', event.origin);
            return;
          }

          if (event.data && event.data.type === AVAILABILITY_MESSAGE_TYPE) {
            const incomingAvailability = event.data.payload.availability;
            // Only dispatch if the incoming availability is different to avoid unnecessary re-renders
            if (incomingAvailability !== profile.workStatus) {
              dispatch(updateWorkStatus(incomingAvailability));
            }
          }
        };

        // Add event listener for messages from other micro-frontends
        window.addEventListener('message', handleMessage);

        // Cleanup the event listener on component unmount
        return () => {
          window.removeEventListener('message', handleMessage);
        };
  }, [profile.workStatus]);

  const statusLabels: Record<WorkStatus, string> = {
    looking: "Currently looking for work",
    passive: "Passively looking for work",
    not_looking: "Don't want to hear about work",
  };

  const handleStatusChange = (status: WorkStatus) => {
    dispatch(updateWorkStatus(status));
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-medium text-sm">{profile.name}</span>
          <span className="text-xs text-gray-600">
            {statusLabels[profile.workStatus]}
          </span>
        </div>
      </div>

      {dropdownOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white shadow-lg rounded-md p-4 w-64 z-10 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Update your work status:
          </h4>
          <ul className="space-y-2">
            <li
              onClick={() => handleStatusChange("looking")}
              className="text-sm py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              Currently looking for work
            </li>
            <li
              onClick={() => handleStatusChange("passive")}
              className="text-sm py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              Passively looking for work
            </li>
            <li
              onClick={() => handleStatusChange("not_looking")}
              className="text-sm py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              Don't want to hear about work
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
