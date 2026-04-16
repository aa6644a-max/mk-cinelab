import { NextRequest, NextResponse } from "next/server";
import { getPersonDetail } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const personId = Number(id);
    if (isNaN(personId)) {
      return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });
    }

    const person = await getPersonDetail(personId);
    if (!person) {
      return NextResponse.json({ error: "인물 정보를 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (err) {
    console.error("[person/route]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
