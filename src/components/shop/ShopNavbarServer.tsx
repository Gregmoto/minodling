import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { ShopNavbar } from "./ShopNavbar";

interface Props {
  user?: {
    id:           string;
    username:     string;
    displayName?: string | null;
    avatarUrl?:   string | null;
    role?:        string;
  } | null;
}

const getShopNavItems = unstable_cache(
  async () => {
    const items = await prisma.shopNavItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, label: true, href: true },
    }).catch(() => []);
    return items;
  },
  ["shop-nav-items"],
  { tags: ["shop-nav"], revalidate: 60 }
);

export async function ShopNavbarServer({ user }: Props) {
  const navItems = await getShopNavItems();
  return <ShopNavbar user={user} navItems={navItems} />;
}
