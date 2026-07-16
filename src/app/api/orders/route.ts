import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextOrderNumber } from "@/lib/orders";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const where =
    status === "kitchen"
      ? { status: { in: ["sent", "preparing", "ready"] } }
      : { status: { in: ["open", "sent", "preparing", "ready"] } };

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { modifiers: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      type: o.type,
      tableNumber: o.tableNumber,
      guestName: o.guestName,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        notes: i.notes,
        modifiers: i.modifiers.map((m) => m.name),
      })),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["cashier", "manager"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const type = body.type === "takeout" ? "takeout" : "dine_in";
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "Order has no items" }, { status: 400 });
  }

  const menuIds = items.map((i: { menuItemId: string }) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuIds } },
    include: { modifiers: { include: { modifiers: true } } },
  });
  const byId = new Map(menuItems.map((m) => [m.id, m]));

  for (const line of items) {
    const mi = byId.get(line.menuItemId);
    if (!mi || !mi.available) {
      return NextResponse.json(
        { error: `Item unavailable: ${line.menuItemId}` },
        { status: 400 }
      );
    }
  }

  const orderNumber = await nextOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      type,
      status: body.sendToKitchen ? "sent" : "open",
      tableNumber: type === "dine_in" ? Number(body.tableNumber) || null : null,
      guestName: type === "takeout" ? body.guestName || null : null,
      notes: body.notes ? String(body.notes) : null,
      createdById: session.user.id,
      items: {
        create: items.map(
          (line: {
            menuItemId: string;
            quantity: number;
            modifierIds?: string[];
          }) => {
            const mi = byId.get(line.menuItemId)!;
            const allMods = mi.modifiers.flatMap((g) => g.modifiers);
            const chosen = (line.modifierIds ?? [])
              .map((id: string) => allMods.find((m) => m.id === id))
              .filter(Boolean);
            return {
              menuItemId: mi.id,
              name: mi.name,
              unitPriceCents: mi.priceCents,
              quantity: Math.max(1, Number(line.quantity) || 1),
              modifiers: {
                create: chosen.map((m) => ({
                  modifierId: m!.id,
                  name: m!.name,
                  priceCents: m!.priceCents,
                })),
              },
            };
          }
        ),
      },
    },
    include: { items: { include: { modifiers: true } } },
  });

  return NextResponse.json({ order });
}
