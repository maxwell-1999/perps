export const LensProductSnapshotAbi = [
  {
    inputs: [
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'snapshot',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'symbol',
                type: 'string',
              },
              {
                components: [
                  {
                    internalType: 'enum PayoffDefinitionLib.PayoffType',
                    name: 'payoffType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'enum PayoffDefinitionLib.PayoffDirection',
                    name: 'payoffDirection',
                    type: 'uint8',
                  },
                  {
                    internalType: 'bytes30',
                    name: 'data',
                    type: 'bytes30',
                  },
                ],
                internalType: 'struct PayoffDefinition',
                name: 'payoffDefinition',
                type: 'tuple',
              },
              {
                internalType: 'contract IOracleProvider',
                name: 'oracle',
                type: 'address',
              },
              {
                internalType: 'UFixed18',
                name: 'maintenance',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'fundingFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'makerFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'takerFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'positionFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'makerLimit',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'PackedFixed18',
                    name: 'minRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedFixed18',
                    name: 'maxRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedFixed18',
                    name: 'targetRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedUFixed18',
                    name: 'targetUtilization',
                    type: 'uint128',
                  },
                ],
                internalType: 'struct JumpRateUtilizationCurve',
                name: 'utilizationCurve',
                type: 'tuple',
              },
            ],
            internalType: 'struct IProduct.ProductInfo',
            name: 'productInfo',
            type: 'tuple',
          },
          {
            internalType: 'address',
            name: 'productAddress',
            type: 'address',
          },
          {
            internalType: 'Fixed18',
            name: 'rate',
            type: 'int256',
          },
          {
            internalType: 'Fixed18',
            name: 'dailyRate',
            type: 'int256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'version',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
              },
              {
                internalType: 'Fixed18',
                name: 'price',
                type: 'int256',
              },
            ],
            internalType: 'struct IOracleProvider.OracleVersion',
            name: 'latestVersion',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'collateral',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'shortfall',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'oracleVersion',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'openPosition',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'closePosition',
                type: 'tuple',
              },
            ],
            internalType: 'struct PrePosition',
            name: 'pre',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'position',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'productFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'protocolFee',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openInterest',
            type: 'tuple',
          },
        ],
        internalType: 'struct IPerennialLens.ProductSnapshot',
        name: '_snapshot',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IProduct[]',
        name: 'productAddresses',
        type: 'address[]',
      },
    ],
    name: 'snapshots',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'symbol',
                type: 'string',
              },
              {
                components: [
                  {
                    internalType: 'enum PayoffDefinitionLib.PayoffType',
                    name: 'payoffType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'enum PayoffDefinitionLib.PayoffDirection',
                    name: 'payoffDirection',
                    type: 'uint8',
                  },
                  {
                    internalType: 'bytes30',
                    name: 'data',
                    type: 'bytes30',
                  },
                ],
                internalType: 'struct PayoffDefinition',
                name: 'payoffDefinition',
                type: 'tuple',
              },
              {
                internalType: 'contract IOracleProvider',
                name: 'oracle',
                type: 'address',
              },
              {
                internalType: 'UFixed18',
                name: 'maintenance',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'fundingFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'makerFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'takerFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'positionFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'makerLimit',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'PackedFixed18',
                    name: 'minRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedFixed18',
                    name: 'maxRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedFixed18',
                    name: 'targetRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedUFixed18',
                    name: 'targetUtilization',
                    type: 'uint128',
                  },
                ],
                internalType: 'struct JumpRateUtilizationCurve',
                name: 'utilizationCurve',
                type: 'tuple',
              },
            ],
            internalType: 'struct IProduct.ProductInfo',
            name: 'productInfo',
            type: 'tuple',
          },
          {
            internalType: 'address',
            name: 'productAddress',
            type: 'address',
          },
          {
            internalType: 'Fixed18',
            name: 'rate',
            type: 'int256',
          },
          {
            internalType: 'Fixed18',
            name: 'dailyRate',
            type: 'int256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'version',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
              },
              {
                internalType: 'Fixed18',
                name: 'price',
                type: 'int256',
              },
            ],
            internalType: 'struct IOracleProvider.OracleVersion',
            name: 'latestVersion',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'collateral',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'shortfall',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'oracleVersion',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'openPosition',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'closePosition',
                type: 'tuple',
              },
            ],
            internalType: 'struct PrePosition',
            name: 'pre',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'position',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'productFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'protocolFee',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openInterest',
            type: 'tuple',
          },
        ],
        internalType: 'struct IPerennialLens.ProductSnapshot[]',
        name: '_snapshots',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const LensUserProductSnapshotAbi = [
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
    name: 'snapshot',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'productAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'userAddress',
            type: 'address',
          },
          {
            internalType: 'UFixed18',
            name: 'collateral',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'oracleVersion',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'openPosition',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'closePosition',
                type: 'tuple',
              },
            ],
            internalType: 'struct PrePosition',
            name: 'pre',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'position',
            type: 'tuple',
          },
          {
            internalType: 'bool',
            name: 'liquidatable',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'liquidating',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openInterest',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'fees',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'exposure',
            type: 'uint256',
          },
        ],
        internalType: 'struct IPerennialLens.UserProductSnapshot',
        name: '_snapshot',
        type: 'tuple',
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
        internalType: 'contract IProduct[]',
        name: 'productAddresses',
        type: 'address[]',
      },
    ],
    name: 'snapshots',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'productAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'userAddress',
            type: 'address',
          },
          {
            internalType: 'UFixed18',
            name: 'collateral',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'oracleVersion',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'openPosition',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'closePosition',
                type: 'tuple',
              },
            ],
            internalType: 'struct PrePosition',
            name: 'pre',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'position',
            type: 'tuple',
          },
          {
            internalType: 'bool',
            name: 'liquidatable',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'liquidating',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openInterest',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'fees',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'exposure',
            type: 'uint256',
          },
        ],
        internalType: 'struct IPerennialLens.UserProductSnapshot[]',
        name: '_snapshots',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const LensProtocolSnapshotAbi = [
  {
    inputs: [],
    name: 'snapshot',
    outputs: [
      {
        components: [
          {
            internalType: 'contract ICollateral',
            name: 'collateral',
            type: 'address',
          },
          {
            internalType: 'contract IIncentivizer',
            name: 'incentivizer',
            type: 'address',
          },
          {
            internalType: 'Token18',
            name: 'collateralToken',
            type: 'address',
          },
          {
            internalType: 'UFixed18',
            name: 'protocolFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'liquidationFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'minCollateral',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'paused',
            type: 'bool',
          },
        ],
        internalType: 'struct IPerennialLens.ProtocolSnapshot',
        name: '_snapshot',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const LensAbi = [
  {
    inputs: [
      {
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
      {
        internalType: 'uint256[]',
        name: 'versions',
        type: 'uint256[]',
      },
    ],
    name: 'atVersions',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'version',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'Fixed18',
            name: 'price',
            type: 'int256',
          },
        ],
        internalType: 'struct IOracleProvider.OracleVersion[]',
        name: 'prices',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
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
    inputs: [],
    name: 'collateral',
    outputs: [
      {
        internalType: 'contract ICollateral',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'controller',
    outputs: [
      {
        internalType: 'contract IController',
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
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'dailyRate',
    outputs: [
      {
        internalType: 'Fixed18',
        name: '',
        type: 'int256',
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
    name: 'exposure',
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
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'fees',
    outputs: [
      {
        internalType: 'UFixed18',
        name: 'protocolFees',
        type: 'uint256',
      },
      {
        internalType: 'UFixed18',
        name: 'productFees',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
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
    name: 'globalPosition',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'oracleVersion',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openPosition',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'closePosition',
            type: 'tuple',
          },
        ],
        internalType: 'struct PrePosition',
        name: '',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'UFixed18',
            name: 'maker',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'taker',
            type: 'uint256',
          },
        ],
        internalType: 'struct Position',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
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
    name: 'info',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            components: [
              {
                internalType: 'enum PayoffDefinitionLib.PayoffType',
                name: 'payoffType',
                type: 'uint8',
              },
              {
                internalType: 'enum PayoffDefinitionLib.PayoffDirection',
                name: 'payoffDirection',
                type: 'uint8',
              },
              {
                internalType: 'bytes30',
                name: 'data',
                type: 'bytes30',
              },
            ],
            internalType: 'struct PayoffDefinition',
            name: 'payoffDefinition',
            type: 'tuple',
          },
          {
            internalType: 'contract IOracleProvider',
            name: 'oracle',
            type: 'address',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'fundingFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'makerFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'takerFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'positionFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'makerLimit',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'PackedFixed18',
                name: 'minRate',
                type: 'int128',
              },
              {
                internalType: 'PackedFixed18',
                name: 'maxRate',
                type: 'int128',
              },
              {
                internalType: 'PackedFixed18',
                name: 'targetRate',
                type: 'int128',
              },
              {
                internalType: 'PackedUFixed18',
                name: 'targetUtilization',
                type: 'uint128',
              },
            ],
            internalType: 'struct JumpRateUtilizationCurve',
            name: 'utilizationCurve',
            type: 'tuple',
          },
        ],
        internalType: 'struct IProduct.ProductInfo',
        name: '_info',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
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
    name: 'latestVersion',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'version',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'Fixed18',
            name: 'price',
            type: 'int256',
          },
        ],
        internalType: 'struct IOracleProvider.OracleVersion',
        name: '',
        type: 'tuple',
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
    name: 'liquidating',
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
    name: 'maintenance',
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
        name: 'positionSize',
        type: 'uint256',
      },
    ],
    name: 'maintenanceRequired',
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
        internalType: 'contract IProduct',
        name: 'product',
        type: 'address',
      },
    ],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
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
    name: 'openInterest',
    outputs: [
      {
        components: [
          {
            internalType: 'UFixed18',
            name: 'maker',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'taker',
            type: 'uint256',
          },
        ],
        internalType: 'struct Position',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
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
    name: 'openInterest',
    outputs: [
      {
        components: [
          {
            internalType: 'UFixed18',
            name: 'maker',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'taker',
            type: 'uint256',
          },
        ],
        internalType: 'struct Position',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
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
    name: 'position',
    outputs: [
      {
        components: [
          {
            internalType: 'UFixed18',
            name: 'maker',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'taker',
            type: 'uint256',
          },
        ],
        internalType: 'struct Position',
        name: '',
        type: 'tuple',
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
    name: 'position',
    outputs: [
      {
        components: [
          {
            internalType: 'UFixed18',
            name: 'maker',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'taker',
            type: 'uint256',
          },
        ],
        internalType: 'struct Position',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
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
    name: 'pre',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'oracleVersion',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openPosition',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'closePosition',
            type: 'tuple',
          },
        ],
        internalType: 'struct PrePosition',
        name: '',
        type: 'tuple',
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
    name: 'pre',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'oracleVersion',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openPosition',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'closePosition',
            type: 'tuple',
          },
        ],
        internalType: 'struct PrePosition',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
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
    name: 'rate',
    outputs: [
      {
        internalType: 'Fixed18',
        name: '',
        type: 'int256',
      },
    ],
    stateMutability: 'view',
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
    name: 'snapshot',
    outputs: [
      {
        components: [
          {
            internalType: 'contract ICollateral',
            name: 'collateral',
            type: 'address',
          },
          {
            internalType: 'contract IIncentivizer',
            name: 'incentivizer',
            type: 'address',
          },
          {
            internalType: 'Token18',
            name: 'collateralToken',
            type: 'address',
          },
          {
            internalType: 'UFixed18',
            name: 'protocolFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'liquidationFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'minCollateral',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'paused',
            type: 'bool',
          },
        ],
        internalType: 'struct IPerennialLens.ProtocolSnapshot',
        name: '_snapshot',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
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
    name: 'snapshot',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'symbol',
                type: 'string',
              },
              {
                components: [
                  {
                    internalType: 'enum PayoffDefinitionLib.PayoffType',
                    name: 'payoffType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'enum PayoffDefinitionLib.PayoffDirection',
                    name: 'payoffDirection',
                    type: 'uint8',
                  },
                  {
                    internalType: 'bytes30',
                    name: 'data',
                    type: 'bytes30',
                  },
                ],
                internalType: 'struct PayoffDefinition',
                name: 'payoffDefinition',
                type: 'tuple',
              },
              {
                internalType: 'contract IOracleProvider',
                name: 'oracle',
                type: 'address',
              },
              {
                internalType: 'UFixed18',
                name: 'maintenance',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'fundingFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'makerFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'takerFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'positionFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'makerLimit',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'PackedFixed18',
                    name: 'minRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedFixed18',
                    name: 'maxRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedFixed18',
                    name: 'targetRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedUFixed18',
                    name: 'targetUtilization',
                    type: 'uint128',
                  },
                ],
                internalType: 'struct JumpRateUtilizationCurve',
                name: 'utilizationCurve',
                type: 'tuple',
              },
            ],
            internalType: 'struct IProduct.ProductInfo',
            name: 'productInfo',
            type: 'tuple',
          },
          {
            internalType: 'address',
            name: 'productAddress',
            type: 'address',
          },
          {
            internalType: 'Fixed18',
            name: 'rate',
            type: 'int256',
          },
          {
            internalType: 'Fixed18',
            name: 'dailyRate',
            type: 'int256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'version',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
              },
              {
                internalType: 'Fixed18',
                name: 'price',
                type: 'int256',
              },
            ],
            internalType: 'struct IOracleProvider.OracleVersion',
            name: 'latestVersion',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'collateral',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'shortfall',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'oracleVersion',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'openPosition',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'closePosition',
                type: 'tuple',
              },
            ],
            internalType: 'struct PrePosition',
            name: 'pre',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'position',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'productFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'protocolFee',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openInterest',
            type: 'tuple',
          },
        ],
        internalType: 'struct IPerennialLens.ProductSnapshot',
        name: '_snapshot',
        type: 'tuple',
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
    name: 'snapshot',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'productAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'userAddress',
            type: 'address',
          },
          {
            internalType: 'UFixed18',
            name: 'collateral',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'oracleVersion',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'openPosition',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'closePosition',
                type: 'tuple',
              },
            ],
            internalType: 'struct PrePosition',
            name: 'pre',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'position',
            type: 'tuple',
          },
          {
            internalType: 'bool',
            name: 'liquidatable',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'liquidating',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openInterest',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'fees',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'exposure',
            type: 'uint256',
          },
        ],
        internalType: 'struct IPerennialLens.UserProductSnapshot',
        name: '_snapshot',
        type: 'tuple',
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
        internalType: 'contract IProduct[]',
        name: 'productAddresses',
        type: 'address[]',
      },
    ],
    name: 'snapshots',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'productAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'userAddress',
            type: 'address',
          },
          {
            internalType: 'UFixed18',
            name: 'collateral',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'oracleVersion',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'openPosition',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'closePosition',
                type: 'tuple',
              },
            ],
            internalType: 'struct PrePosition',
            name: 'pre',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'position',
            type: 'tuple',
          },
          {
            internalType: 'bool',
            name: 'liquidatable',
            type: 'bool',
          },
          {
            internalType: 'bool',
            name: 'liquidating',
            type: 'bool',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openInterest',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'fees',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'exposure',
            type: 'uint256',
          },
        ],
        internalType: 'struct IPerennialLens.UserProductSnapshot[]',
        name: '_snapshots',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IProduct[]',
        name: 'productAddresses',
        type: 'address[]',
      },
    ],
    name: 'snapshots',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'symbol',
                type: 'string',
              },
              {
                components: [
                  {
                    internalType: 'enum PayoffDefinitionLib.PayoffType',
                    name: 'payoffType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'enum PayoffDefinitionLib.PayoffDirection',
                    name: 'payoffDirection',
                    type: 'uint8',
                  },
                  {
                    internalType: 'bytes30',
                    name: 'data',
                    type: 'bytes30',
                  },
                ],
                internalType: 'struct PayoffDefinition',
                name: 'payoffDefinition',
                type: 'tuple',
              },
              {
                internalType: 'contract IOracleProvider',
                name: 'oracle',
                type: 'address',
              },
              {
                internalType: 'UFixed18',
                name: 'maintenance',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'fundingFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'makerFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'takerFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'positionFee',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'makerLimit',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'PackedFixed18',
                    name: 'minRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedFixed18',
                    name: 'maxRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedFixed18',
                    name: 'targetRate',
                    type: 'int128',
                  },
                  {
                    internalType: 'PackedUFixed18',
                    name: 'targetUtilization',
                    type: 'uint128',
                  },
                ],
                internalType: 'struct JumpRateUtilizationCurve',
                name: 'utilizationCurve',
                type: 'tuple',
              },
            ],
            internalType: 'struct IProduct.ProductInfo',
            name: 'productInfo',
            type: 'tuple',
          },
          {
            internalType: 'address',
            name: 'productAddress',
            type: 'address',
          },
          {
            internalType: 'Fixed18',
            name: 'rate',
            type: 'int256',
          },
          {
            internalType: 'Fixed18',
            name: 'dailyRate',
            type: 'int256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'version',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
              },
              {
                internalType: 'Fixed18',
                name: 'price',
                type: 'int256',
              },
            ],
            internalType: 'struct IOracleProvider.OracleVersion',
            name: 'latestVersion',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'maintenance',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'collateral',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'shortfall',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'oracleVersion',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'openPosition',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'UFixed18',
                    name: 'maker',
                    type: 'uint256',
                  },
                  {
                    internalType: 'UFixed18',
                    name: 'taker',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Position',
                name: 'closePosition',
                type: 'tuple',
              },
            ],
            internalType: 'struct PrePosition',
            name: 'pre',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'position',
            type: 'tuple',
          },
          {
            internalType: 'UFixed18',
            name: 'productFee',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'protocolFee',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openInterest',
            type: 'tuple',
          },
        ],
        internalType: 'struct IPerennialLens.ProductSnapshot[]',
        name: '_snapshots',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
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
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
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
    name: 'unclaimedIncentiveRewards',
    outputs: [
      {
        internalType: 'Token18[]',
        name: 'tokens',
        type: 'address[]',
      },
      {
        internalType: 'UFixed18[]',
        name: 'amounts',
        type: 'uint256[]',
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
        internalType: 'uint256[]',
        name: 'programIds',
        type: 'uint256[]',
      },
    ],
    name: 'unclaimedIncentiveRewards',
    outputs: [
      {
        internalType: 'Token18[]',
        name: 'tokens',
        type: 'address[]',
      },
      {
        internalType: 'UFixed18[]',
        name: 'amounts',
        type: 'uint256[]',
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
    name: 'userPosition',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'oracleVersion',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'openPosition',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'UFixed18',
                name: 'maker',
                type: 'uint256',
              },
              {
                internalType: 'UFixed18',
                name: 'taker',
                type: 'uint256',
              },
            ],
            internalType: 'struct Position',
            name: 'closePosition',
            type: 'tuple',
          },
        ],
        internalType: 'struct PrePosition',
        name: '',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'UFixed18',
            name: 'maker',
            type: 'uint256',
          },
          {
            internalType: 'UFixed18',
            name: 'taker',
            type: 'uint256',
          },
        ],
        internalType: 'struct Position',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
