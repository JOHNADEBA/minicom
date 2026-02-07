const SIMULATE = process.env.NEXT_PUBLIC_SIMULATE_NETWORK === "true";

const FAILURE_RATE = Number(process.env.NEXT_PUBLIC_FAILURE_RATE ?? 0.2);

export const simulateNetwork = () => {
  if (!SIMULATE) return true;
  return Math.random() > FAILURE_RATE;
};
