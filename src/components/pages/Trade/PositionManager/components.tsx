import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Link,
  Text,
} from '@chakra-ui/react'

import { AssetIconWithText } from '@/components/shared/components'
import { AssetMetadata } from '@/constants/assets'
import { OrderDirection } from '@/constants/markets'
import { ExplorerURLs } from '@/constants/network'
import { useChainId } from '@/hooks/network'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
import { formatDateRelative } from '@/utils/timeUtils'

import { PositionTableData } from './constants'
import { usePnl, usePositionManagerCopy, useStyles } from './hooks'

export const PositionTable = ({
  positions,
  currentPosition,
  onClick,
}: {
  positions: PositionTableData[]
  currentPosition?: boolean
  onClick?: (row: PositionTableData) => void
}) => {
  const { background } = useStyles()
  const copy = usePositionManagerCopy()
  return (
    <Box>
      <Flex alignItems="center" justifyContent="center" py={1} px={4} position="sticky" top={0} background={background}>
        <Text variant="label" flex="2">
          {copy.market}
        </Text>
        <Text variant="label" flex="1">
          {copy.size}
        </Text>
        <Text variant="label" flex="1">
          {copy.pnl}
        </Text>
        <Text variant="label" flex="1">
          {copy.averageEntry}
        </Text>
        <Text variant="label" flex="1">
          {copy.fees}
        </Text>
        {currentPosition && (
          <Text variant="label" flex="1">
            {copy.liquidationPrice}
          </Text>
        )}
        {/* Box to take up the same space the accordion icon does */}
        <Box flexShrink="0" w="20px" h="20px" />
      </Flex>
      <Accordion allowMultiple>
        {positions.map((position, i) => (
          <PositionTableRow key={i} row={position} currentPosition={!!currentPosition} onClick={onClick} />
        ))}
      </Accordion>
    </Box>
  )
}

const PositionTableRow = ({
  row,
  currentPosition,
  onClick,
}: {
  row: PositionTableData
  currentPosition: boolean
  onClick?: (row: PositionTableData) => void
}) => {
  const { green, red, borderColor } = useStyles()
  const market = AssetMetadata[row.asset]
  const directionColor = row.details.direction === OrderDirection.Long ? green : red
  const { pnl, pnlPercentage, isPnlPositive } = usePnl({ positionDetails: row.details, live: currentPosition })

  return (
    <AccordionItem borderBottom="none">
      <Box>
        <AccordionButton textAlign="left" _expanded={{ borderBottom: `1px solid ${borderColor}` }}>
          <Box flex="2" display="flex">
            <Link onClick={() => (onClick ? onClick(row) : null)}>
              <Flex alignItems="center">
                <AssetIconWithText market={market} fontSize="15px" mr="10px" />
                <Text fontSize="14px" color={directionColor}>
                  {row.details.direction}
                </Text>
              </Flex>
            </Link>
          </Box>
          <Box flex="1">
            <Flex flexDirection="column">
              <Text fontSize="13px">
                {row.position} {row.asset.toUpperCase()}
              </Text>
              <Text variant="label" fontSize="11px">
                {row.notional}
              </Text>
            </Flex>
          </Box>
          <Box flex="1">
            <Flex flexDirection="column">
              <Text fontSize="13px" color={isPnlPositive ? green : red}>
                {pnlPercentage}
              </Text>
              <Text variant="label" fontSize="11px">
                {pnl}
              </Text>
            </Flex>
          </Box>
          <Box flex="1">
            <Text fontSize="13px">{row.averageEntry}</Text>
          </Box>
          <Box flex="1">
            <Text fontSize="13px">{row.fees}</Text>
          </Box>
          {currentPosition && (
            <Box flex="1">
              <Text fontSize="13px">{row.liquidationPrice}</Text>
            </Box>
          )}
          <AccordionIcon />
        </AccordionButton>
      </Box>
      <AccordionPanel pb={4}>
        <SubPositionTable {...row} />
      </AccordionPanel>
    </AccordionItem>
  )
}

const SubPositionTable = (row: PositionTableData) => {
  const chainId = useChainId()
  const { subheaderTextColor, red, green, borderColor } = useStyles()
  const copy = usePositionManagerCopy()
  const {
    asset,
    details: { subPositions },
  } = row

  if (!subPositions) return null

  return (
    <Box>
      <Flex marginBottom={1} alignItems="center" justifyContent="center">
        <Text variant="label" flex="1">
          {copy.date}
        </Text>
        <Text variant="label" flex="1">
          {copy.size}
        </Text>
        <Text variant="label" flex="1">
          {copy.change}
        </Text>
        <Text variant="label" flex="1">
          {copy.collateral}
        </Text>
        <Text variant="label" flex="1">
          {copy.executionPrice}
        </Text>
        <Text variant="label" flex="1">
          {copy.fees}
        </Text>
        <Text variant="label" flex="1">
          {copy.pnl}
        </Text>
      </Flex>
      {subPositions?.map((subPosition, i) => (
        <Flex
          key={`${subPosition.transctionHash}_${i}`}
          paddingTop={2}
          paddingBottom={2}
          alignItems="center"
          justifyContent="center"
          borderBottom={i < subPositions.length - 1 ? `1px solid ${borderColor}` : ''}
        >
          <Box flex="1">
            <Link
              href={`${ExplorerURLs[chainId]}/tx/${subPosition.transctionHash}`}
              isExternal
              textAlign="left"
              fontSize="13px"
              color={subheaderTextColor}
            >
              {formatDateRelative(new Date(Number(subPosition.blockTimestamp * 1000n)))}
            </Link>
          </Box>
          <Box flex="1">
            <Flex flexDirection="column">
              <Text fontSize="13px">
                {formatBig18(subPosition.size)} {asset.toUpperCase()}
              </Text>
              <Text variant="label" fontSize="11px">
                {formatBig18USDPrice(Big18Math.mul(subPosition.size, subPosition.settlePrice))}
              </Text>
            </Flex>
          </Box>
          <Box flex="1">
            <Text fontSize="13px">
              {subPosition.delta >= 0n ? (
                // eslint-disable-next-line formatjs/no-literal-string-in-jsx
                <Text as="span" color={green} verticalAlign="text-bottom">
                  +
                </Text>
              ) : (
                // eslint-disable-next-line formatjs/no-literal-string-in-jsx
                <Text as="span" color={red} verticalAlign="text-bottom">
                  –
                </Text>
              )}
              <Text as="span" marginLeft={1}>
                {formatBig18(Big18Math.abs(subPosition.delta))} {asset.toUpperCase()}
              </Text>
            </Text>
          </Box>
          <Box flex="1">
            <Text fontSize="13px">{formatBig18USDPrice(subPosition.collateral)}</Text>
          </Box>
          <Box flex="1">
            <Text fontSize="13px">{formatBig18USDPrice(subPosition.settlePrice)}</Text>
          </Box>
          <Box flex="1">
            <Text fontSize="13px">{formatBig18USDPrice(subPosition.fee)}</Text>
          </Box>
          <Box flex="1">
            <Flex flexDirection="column">
              <Text fontSize="13px" color={subPosition.pnl >= 0n ? (subPosition.pnl === 0n ? undefined : green) : red}>
                {formatBig18Percent(Big18Math.div(subPosition.pnl, subPosition.collateral))}
              </Text>
              <Text variant="label" fontSize="11px">
                {formatBig18USDPrice(subPosition.pnl)}
              </Text>
            </Flex>
          </Box>
        </Flex>
      ))}
    </Box>
  )
}
