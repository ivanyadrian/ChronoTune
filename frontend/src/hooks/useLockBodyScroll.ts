import { useEffect } from "react";

/**
 * Custom hook to lock body scrolling when a modal or overlay is open.
 * @param isLocked Whether the scrolling should be locked.
 */
export const useLockBodyScroll = (isLocked: boolean = true) => {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLocked]);
};
