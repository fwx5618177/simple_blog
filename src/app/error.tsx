"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h1>Something went wrong: {error.message}</h1>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
