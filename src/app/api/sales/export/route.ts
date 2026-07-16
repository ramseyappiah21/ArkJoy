import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderTotalCents } from "@/lib/money";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "manager") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const fromStr = req.nextUrl.searchParams.get("from");
  const toStr = req.nextUrl.searchParams.get("to");
  const to = toStr ? new Date(toStr) : new Date();
  const from = fromStr
    ? new Date(fromStr)
    : new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      status: "completed",
      completedAt: { gte: from, lte: to },
    },
    include: { items: { include: { modifiers: true } } },
    orderBy: { completedAt: "desc" },
  });

  const header = "order_number,completed_at,type,table,payment,total_cents\n";
  const rows = orders
    .map((o) =>
      [
        o.orderNumber,
        o.completedAt?.toISOString() ?? "",
        o.type,
        o.tableNumber ?? "",
        o.paymentMethod,
        orderTotalCents(o.items),
      ].join(",")
    )
    .join("\n");

  return new NextResponse(header + rows + "\n", {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="arkjoy-sales.csv"`,
    },
  });
}
