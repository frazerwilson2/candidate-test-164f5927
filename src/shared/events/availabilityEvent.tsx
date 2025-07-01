import { useEffect } from "react";
import { WorkStatus } from "../types";
import toast from "react-hot-toast";

export const AVAILABILITY_MESSAGE_TYPE = 'AVAILABILITY_MESSAGE_TYPE';

export const statusLabels: Record<WorkStatus, string> = {
    looking: "Currently looking for work",
    passive: "Passively looking for work",
    not_looking: "Don't want to hear about work",
};

export const postAvailabilityEvent = (status: WorkStatus) => {
    window.postMessage({
        type: AVAILABILITY_MESSAGE_TYPE,
        payload: { availability: status }
    }, window.location.origin);
};

export const useAvailabilityListener = (callback:(status:WorkStatus)=>void) => {
  useEffect(() => {
    const handleMessage = (event:MessageEvent) => {
      // Security check: Ensure the message comes from the same origin
      if (event.origin !== window.location.origin) {
        console.warn('Received message from unknown origin:', event.origin);
        return;
      }

      let toastDebounce = false;
      // Check if the message type matches the one this listener is interested in
      if (event.data && event.data.type === AVAILABILITY_MESSAGE_TYPE) {
        // Invoke the callback with the payload of the message
        callback(event.data.payload.availability as WorkStatus);

        if (toastDebounce) return; // Prevent multiple toasts in quick succession
        toastDebounce = true;
        toast.dismiss(); // Dismiss any previous toast notifications 
        toast.success(`Availability updated to: ${statusLabels[event.data.payload.availability as WorkStatus]}`, {
            duration: 3000,
            position: "top-right",
        });
        setTimeout(() => {
          toastDebounce = false; // Reset debounce after a short delay
        }, 3000); // Match the duration of the toast
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [callback]);
};