import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavRootState, NavDispatch } from "../store";
import { updateWorkStatus } from "../store/userSlice";
import { WorkStatus } from "../../shared/types";
import { postAvailabilityEvent, statusLabels, useAvailabilityListener } from "../../shared/events/availabilityEvent";

export const UserAvatar = () => {
  const { profile } = useSelector((state: NavRootState) => state.user);
  const dispatch = useDispatch<NavDispatch>();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useAvailabilityListener(
    useCallback((incomingAvailability:WorkStatus) => {
      if(incomingAvailability === profile.workStatus) return; // Avoid unnecessary updates
      dispatch(updateWorkStatus(incomingAvailability));
  }, [profile.workStatus, dispatch]));

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event:Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = (status: WorkStatus) => {
    // Post event to notify other micro-frontends
    postAvailabilityEvent(status);
    dispatch(updateWorkStatus(status));
    setDropdownOpen(false);
  };

  console.log(statusLabels, profile.workStatus);
  

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
        <div className="absolute mt-2 bottom-[60px] bg-white shadow-lg rounded-md p-4 w-64 z-10 border border-gray-200" ref={dropdownRef}>
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
