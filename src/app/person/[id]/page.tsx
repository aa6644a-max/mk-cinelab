import { notFound } from "next/navigation";
import { getPersonDetail } from "@/lib/api";
import PersonPageClient from "@/components/person/PersonPageClient";
import { User } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;
  const personId = Number(id);
  if (isNaN(personId)) notFound();

  const person = await getPersonDetail(personId);

  if (!person) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <User className="w-12 h-12 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">인물 정보를 찾을 수 없습니다</p>
        <Link href="/" className="text-red-500 text-xs mt-2 inline-block hover:text-red-400">
          홈으로
        </Link>
      </div>
    );
  }

  return <PersonPageClient person={person} />;
}
