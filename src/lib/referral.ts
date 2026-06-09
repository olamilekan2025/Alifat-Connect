export function generateReferralCode(name: string) {
  const clean = name
    ?.replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4);

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${clean || "USER"}-${random}`;
}