export function calculateDiscount(
  amount: number,
  percentage: number
) {
  const discount = Number(
    ((amount * percentage) / 100).toFixed(2)
  );

  return {
    discount,
    payable: amount - discount,
  };
}