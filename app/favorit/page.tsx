import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { FavoritesContent } from "@/app/favorit/favorites-content";
import { authOptions } from "@/lib/auth";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session.user.role !== "user") redirect("/dashboard");
  return <FavoritesContent />;
}
