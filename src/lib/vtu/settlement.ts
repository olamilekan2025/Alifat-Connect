import Transaction from "@/models/transaction";

// NOTE:
// This file is intentionally a minimal scaffold.
// Full settlement requires knowing how your provider API is called and how
// provider failures are represented in your current flow.

export type VTUPurchaseCategory = "airtime" | "data" | "transfer" | "funding" | "withdrawal";

export type VTUSettlementStatus = "success" | "failed" | "pending";

export type VTUPurchaseSettlementInput = {
  purchaseReference: string; // stable idempotency key
  userId: string;
  category: VTUPurchaseCategory;

  // What user pays
  userAmount: number;

  // Provider cost for the same service
  providerCost: number;

  // Profit calculation rule
  platformProfit: number;

  // Provider identifiers (optional)
  providerReference?: string;

  // High-level outcome
  status: VTUSettlementStatus;

  // Optional descriptive fields
  description?: string;

  // Optional links for reconciliation/refund
  reversalOf?: string;
};

export async function settleVTUPurchase(input: VTUPurchaseSettlementInput) {
  // Idempotency: ensure we never post the same purchaseReference twice.
  // This relies on `reference` being a unique identifier for purchase settlement.
  const existing = await Transaction.findOne({ reference: input.purchaseReference }).lean();

  if (existing) {
    return { success: true, alreadySettled: true, transaction: existing };
  }

  const transaction = await Transaction.create({
    userId: input.userId,
    type: input.status === "success" ? "debit" : "debit", // ledger direction remains debit per your current model
    category: input.category,
    amount: input.userAmount,
    status: input.status,
    description: input.description,
    reference: input.purchaseReference,

    // Financial breakdown fields (will require schema updates)
    userAmount: input.userAmount,
    providerCost: input.providerCost,
    platformProfit: input.platformProfit,
    providerReference: input.providerReference,
    reversalOf: input.reversalOf,
  } as any);

  return { success: true, alreadySettled: false, transaction };
}

