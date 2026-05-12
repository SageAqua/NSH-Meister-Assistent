export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <section><h2 className="text-3xl font-bold">Baustelle {id}</h2></section>;
}
