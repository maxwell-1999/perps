export enum OrderSide {
  Long = "Long",
  Short = "Short",
}

export const orderSides: [OrderSide, OrderSide] = [OrderSide.Long, OrderSide.Short];

export const formIds = {
  collateral: "collateral-input",
  amount: "amount-input",
  leverage: "leverage-input",
};
