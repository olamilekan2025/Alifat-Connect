# TODO - VTU Profit/Ledger & Refund Consistency

## Phase 0 - Repo discovery (done/ongoing)
- [x] Inspect current Transaction model & admin/system wallet ledger usage
- [x] Inspect airtime/data/electricity purchase routes and existing reports aggregation
- [x] Identify that current routes debit wallet + write Transaction without provider cost/profit/refund

## Phase 1 - Data model changes (required)
- [ ] Extend `src/models/transaction.ts` with:
  - userAmount
  - providerCost
  - platformProfit
  - providerReference
  - reversalOf
  - (optionally) purchaseCategory/serviceType fields
- [ ] Add indexes/uniqueness guidance for idempotency using `reference` or a dedicated `purchaseReference`

## Phase 2 - Settlement helper (scaffold)
- [ ] Replace scaffold in `src/lib/vtu/settlement.ts` with real logic once provider call points are identified

## Phase 3 - Refactor purchase flow (required)
- [ ] Refactor airtime purchase route to:
  - check wallet
  - deduct/queue debit
  - call provider API
  - on success: write providerCost/platformProfit
  - on failure: refund user and write reversal
- [ ] Refactor data purchase route similarly
- [ ] Ensure payment/gateway webhook finalization triggers the same settlement path (idempotent)

## Phase 4 - Admin reporting
- [ ] Update admin reporting endpoints to aggregate:
  - totalRevenue = Σ(userAmount)
  - totalProviderCost = Σ(providerCost)
  - totalProfit = Σ(platformProfit)

## Phase 5 - Reconciliation safeguards
- [ ] Ensure all webhook/payment completion handlers are idempotent by purchaseReference
- [ ] Ensure refund postings reference the original purchase (reversalOf)

## Phase 6 - Validate
- [ ] Run build
- [ ] Run targeted “simulate success then simulate provider failure” checks

