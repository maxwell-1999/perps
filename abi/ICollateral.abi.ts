export const ICollateralAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'CollateralAccountLiquidatingError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'UFixed18',
        name: 'totalMaintenance',
        type: 'uint256',
      },
      {
        internalType: 'UFixed18',
        name: 'totalCollateral',
        type: 'uint256',
      },
    ],
    name: 'CollateralCantLiquidate',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CollateralInsufficientCollateralError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CollateralUnderLimitError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CollateralZeroAddressError',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'Fixed18',
        name: 'amount',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'newShortfall',
        type: 'uint256',
      },
    ],
    name: 'AccountSettle',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'FeeClaim',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'liquidator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'Liquidation',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'protocolFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'productFee',
        type: 'uint256',
      },
    ],
    name: 'ProductSettle',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ShortfallResolution',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawal',
    type: 'event',
  },
  {
    inputs: [],
    name: 'claimFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'collateral',
    outputs: [
      {
        internalType: 'UFixed18',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'collateral',
    outputs: [
      {
        internalType: 'UFixed18',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'depositTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'fees',
    outputs: [
      {
        internalType: 'UFixed18',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IController',
        name: 'controller_',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'liquidatable',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'liquidatableNext',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'liquidate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'resolveShortfall',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'Fixed18',
        name: 'amount',
        type: 'int256',
      },
    ],
    name: 'settleAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'settleProduct',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'shortfall',
    outputs: [
      {
        internalType: 'UFixed18',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [
      {
        internalType: 'Token18',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        internalType: 'UFixed18',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
