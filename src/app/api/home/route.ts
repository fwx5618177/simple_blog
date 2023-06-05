"use server";

import { NextRequest, NextResponse } from "next/server";
import { queryDesc } from "../../../../utils/readmd";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || 1;
  const data = await queryDesc();
  const total = data.length;

  return new NextResponse(
    JSON.stringify({
      status: "success",
      data,
      total,
      current: page,
    })
  );
}
