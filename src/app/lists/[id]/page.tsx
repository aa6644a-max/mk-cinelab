import ListDetailClientPage from "@/components/lists/ListDetailClientPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: Props) {
  const { id } = await params;
  return <ListDetailClientPage listId={id} />;
}
