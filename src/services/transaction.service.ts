import Transaction from "@/models/transaction";

export async function createTransaction(
  payload: any
) {
  return Transaction.create({
    status: "success",
    ...payload,
  });
}