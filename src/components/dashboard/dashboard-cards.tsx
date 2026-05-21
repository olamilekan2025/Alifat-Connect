import { Wallet, ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    title: "Wallet Balance",
    value: "₦50,000",
    icon: Wallet,
  },
  {
    title: "Transactions",
    value: "1,240",
    icon: ArrowUpRight,
  },
  {
    title: "Successful",
    value: "1,180",
    icon: CheckCircle2,
  },
  {
    title: "Pending",
    value: "60",
    icon: Clock3,
  },
];

export function DashboardCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 bg-red-400">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="
            rounded-3xl border-0
            bg-gradient-to-br from-background to-muted/40
            shadow-sm transition-all duration-300
            hover:-translate-y-1 hover:shadow-xl
          "
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  {card.value}
                </h2>
              </div>

              <div className="rounded-2xl bg-primary/10 p-3">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
