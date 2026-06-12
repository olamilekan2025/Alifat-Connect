export function generateReferralCode(
  name: string
) {
  const clean = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4);

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `${clean || "USER"}${random}`;
}