import { validPosition } from "./responseUtils.js";

// One cycle every 10 seconds. Slow cycles skip ticks rather than overlap.
export function startPositionPolling({ readPosition, updateLocation, onUpdate, onError }) {
  let stopped = false;
  let pending = null;
  let controller = null;
  const timer = setInterval(() => {
    if (stopped || pending) return;
    controller = new AbortController();
    const signal = controller.signal;
    pending = (async () => {
      try {
        const position = await readPosition(signal);
        if (stopped) return;
        if (!validPosition(position)) throw new Error("The simulator returned invalid coordinates.");
        const execution = await updateLocation(position, signal);
        if (!stopped) onUpdate(execution);
      } catch (error) {
        if (!stopped) onError(error);
      }
    })().finally(() => { pending = null; controller = null; });
  }, 10000);

  return {
    // Finish actions drain an existing update before changing execution status.
    // Navigation aborts the request and ignores any late response.
    stop(abort = false) {
      stopped = true;
      clearInterval(timer);
      if (abort) controller?.abort();
      return pending || Promise.resolve();
    },
  };
}