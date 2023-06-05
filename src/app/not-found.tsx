"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full h-[90vh] text-center">
      <h1 className="text-title">Not Found</h1>
      <p>Could not find requested resource</p>
      <p>
        View{" "}
        <Link href={"/"} className="text">
          Home Page.
        </Link>
      </p>
    </div>
  );
}
