"use server";

import { NextRequest, NextResponse } from "next/server";
import { BigNumber } from "bignumber.js";
import { queryDocs } from "@/utils/readmd";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageNumber: number = new BigNumber(
    searchParams.get("pageNumber") || 1
  ).toNumber();
  const pageSize: number = new BigNumber(
    searchParams.get("pageSize") || 10
  ).toNumber();
  const data = await queryDocs();
  const total = data.length;

  return new NextResponse(
    JSON.stringify({
      status: "success",
      data: data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
      total,
      current: pageNumber,
    })
  );
}
