export enum OrderSide {
  Long = "Long",
  Short = "Short",
}

export const orderSides: [OrderSide, OrderSide] = [OrderSide.Long, OrderSide.Short];

export const formIds = {
  collateral: "collateral-input",
  amount: "amount-input",
  leverage: "leverage-input",
  closeAmount: "close-amount-input",
  receiveInput: "receive-input",
  withdrawAmount: "withdraw-amount-input",
};

export const buttonPercentValues = [10, 20, 50, 75, 100];
