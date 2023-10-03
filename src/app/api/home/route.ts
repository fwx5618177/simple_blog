"use server";

import { NextRequest, NextResponse } from "next/server";
import { queryDesc } from "@/utils/readmd";
import dayjs from "dayjs";
import { BigNumber } from "bignumber.js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageNumber: number = new BigNumber(
    searchParams.get("pageNumber") || 1
  ).toNumber();
  const pageSize: number = new BigNumber(
    searchParams.get("pageSize") || 10
  ).toNumber();
  const data = await queryDesc();
  const sortData = data?.sort((pre, cur) => {
    const timePre = dayjs(pre.time);
    const timeCur = dayjs(cur.time);

    return timeCur.diff(timePre);
  });
  const total = data.length;

  return new NextResponse(
    JSON.stringify({
      status: "success",
      data: sortData.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
      total,
      current: pageNumber,
    })
  );
}
