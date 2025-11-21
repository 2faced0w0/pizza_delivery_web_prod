export function calculatePrice({ basePrice, size, crustModifier = 0, toppingPrices = [], quantity = 1 }) {
  const sizeMultipliers = { small: 1, medium: 1.3, large: 1.6 };
  const multiplier = sizeMultipliers[size] || 1;
  const toppingsTotal = toppingPrices.reduce((a, b) => a + b, 0);
  const perUnit = basePrice * multiplier + crustModifier + toppingsTotal;
  return perUnit * quantity;
}
