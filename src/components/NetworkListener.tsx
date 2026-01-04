import { useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { processSyncQueue } from "../store/plantsSlice";
import { toast } from "sonner";

export default function NetworkListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleOnline = () => {
      console.log("Back Online");
      toast.success("Online: Syncing pending plants...");
      dispatch(processSyncQueue());
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [dispatch]);

  return null;
}
