import type { Metadata } from "next";
import { GuestNav } from "@/components/GuestNav";
import { GuestFooter } from "@/components/GuestFooter";
import "../guest.css";

export const metadata: Metadata = {
  title: {
    default: "ArkJoy Restaurant",
    template: "%s · ArkJoy",
  },
  description:
    "Seasonal plates and warm hospitality. Reserve a table at ArkJoy Restaurant.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="guest-site">
      <GuestNav />
      {children}
      <GuestFooter />
    </div>
  );
}
