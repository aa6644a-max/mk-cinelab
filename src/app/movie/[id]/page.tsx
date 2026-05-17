import { notFound } from "next/navigation";
import { getMovieDetail } from "@/lib/api";
import MovieDetailClient from "@/components/movie/MovieDetailClient";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;

  const tmdbId = Number(id.replace("tmdb-", ""));
  if (isNaN(tmdbId)) notFound();

  const movie = await getMovieDetail(tmdbId);
  if (!movie) notFound();

  return <MovieDetailClient movie={movie} />;
}