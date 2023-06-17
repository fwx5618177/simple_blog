"use server";

import { NextRequest, NextResponse } from "next/server";
import { queryMdDocs } from "../../../../utils/readmd";

type Payload = {
  path: string;
};

export async function POST(req: NextRequest) {
  const body: Payload = await req.json();
  const { path } = body;

  const data = await queryMdDocs(path);

  return new NextResponse(
    JSON.stringify({
      status: "success",
      data,
    })
  );
}
