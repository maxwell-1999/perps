import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Flex,
  Link,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'

import { AssetMetadata } from '@/constants/assets'
import { ExplorerURLs } from '@/constants/network'
import { useChainId } from '@/hooks/network'
import { Big18Math, formatBig18, formatBig18Percent, formatBig18USDPrice } from '@/utils/big18Utils'
import { formatDateRelative } from '@/utils/timeUtils'

import colors from '@ds/theme/colors'

import { AssetDirectionLabel, Status, TableEmptyScreen } from './components'
import { PositionTableData } from './constants'
import { usePnl, usePositionManagerCopy, useStyles } from './hooks'

export const PositionTable = ({
  positions,
  currentPosition,
  onClick,
  emptyStateMessage,
}: {
  positions: PositionTableData[]
  currentPosition?: boolean
  onClick?: (row: PositionTableData) => void
  emptyStateMessage: string
}) => {
  const { background } = useStyles()
  const copy = usePositionManagerCopy()

  return (
    <Box>
      <Flex alignItems="center" justifyContent="center" py={1} px={4} position="sticky" top={0} background={background}>
        {!currentPosition && (
          <Text variant="label" flex="1">
            {copy.opened}
          </Text>
        )}
        <Text variant="label" flex="3">
          {copy.market}
        </Text>
        {currentPosition && (
          <Text variant="label" flex="2">
            {copy.leverage}
          </Text>
        )}
        <Text variant="label" flex="2">
          {currentPosition ? copy.size : copy.openSize}
        </Text>
        {currentPosition && (
          <Text variant="label" flex="2">
            {copy.openLiq}
          </Text>
        )}
        <Text variant="label" flex="2">
          {copy.pnl}
        </Text>
        {currentPosition && (
          <Text variant="label" flex="2">
            {copy.status}
          </Text>
        )}
        {!currentPosition && (
          <>
            <Text variant="label" flex="2">
              {copy.averageEntry}
            </Text>
            <Text variant="label" flex="2">
              {copy.fees}
            </Text>
          </>
        )}
        {/* Box to take up the same space the accordion icon does */}
        <Box flexShrink="0" w="20px" h="20px" />
      </Flex>
      {Boolean(positions.length) ? (
        <Accordion allowMultiple>
          {positions.map((position, i) => (
            <PositionTableRow key={i} row={position} currentPosition={!!currentPosition} onClick={onClick} />
          ))}
        </Accordion>
      ) : (
        <TableEmptyScreen message={emptyStateMessage} />
      )}
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
  const copy = usePositionManagerCopy()
  const { green, red, borderColor, alpha5 } = useStyles()
  const market = AssetMetadata[row.asset]
  const { pnl, pnlPercentage, isPnlPositive } = usePnl({ positionDetails: row.details, live: currentPosition })
  const subPositionBg = useColorModeValue('white', 'black')
  const leverageColor = useColorModeValue(colors.brand.blackAlpha[70], colors.brand.whiteAlpha[70])
  const hoverColor = useColorModeValue(colors.brand.whiteAlpha[10], colors.brand.blackAlpha[10])
  return (
    <AccordionItem borderBottom="none" _hover={{ bg: hoverColor }}>
      <Box>
        <AccordionButton textAlign="left" _expanded={{ borderBottom: `1px solid ${borderColor}`, background: alpha5 }}>
          {!currentPosition && (
            <Box flex="1">
              <Text fontSize="14px" variant="label">
                {formatDateRelative(new Date(Number((row.details.subPositions?.[0].blockTimestamp ?? 0n) * 1000n)))}
              </Text>
            </Box>
          )}
          <Box flex="3" display="flex">
            <Link
              onClick={() => (onClick ? onClick(row) : undefined)}
              _hover={!onClick ? { textDecoration: 'none' } : undefined}
            >
              <AssetDirectionLabel market={market} direction={row.details.direction} />
            </Link>
          </Box>
          {currentPosition && (
            <Box flex="2">
              <Badge borderRadius="6px" p={1} as="p">
                <Text as="span" fontSize="13px" color={leverageColor}>
                  {row.nextLeverage}
                  {copy.x}
                </Text>
              </Badge>
            </Box>
          )}
          <Box flex="2">
            <Flex flexDirection="column">
              <Text fontSize="14px">
                {currentPosition ? row.nextPosition : row.position} {row.asset.toUpperCase()}
              </Text>
              <Text variant="label" fontSize="12px">
                {currentPosition ? row.nextNotional : row.notional}
              </Text>
            </Flex>
          </Box>
          {currentPosition && (
            <Box flex="2">
              <Flex flexDirection="column">
                <Text fontSize="14px">{row.averageEntry}</Text>
                <Text variant="label" fontSize="12px">
                  {row.liquidationPrice}
                </Text>
              </Flex>
            </Box>
          )}
          <Box flex="2">
            <Flex flexDirection="column">
              <Text fontSize="14px" color={isPnlPositive ? green : red}>
                {pnl}
              </Text>
              <Text variant="label" fontSize="12px">
                {pnlPercentage}
              </Text>
            </Flex>
          </Box>
          {currentPosition && (
            <Box flex="2">
              <Status status={row.details.status} />
            </Box>
          )}
          {!currentPosition && (
            <>
              <Box flex="2">
                <Text fontSize="14px">{row.averageEntry}</Text>
              </Box>
              <Box flex="2">
                <Text fontSize="14px">{row.fees}</Text>
              </Box>
            </>
          )}
          <AccordionIcon />
        </AccordionButton>
      </Box>
      <AccordionPanel pb={4} bg={subPositionBg}>
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
                {formatBig18USDPrice(subPosition.pnl)}
              </Text>
              <Text variant="label" fontSize="11px">
                {formatBig18Percent(Big18Math.div(subPosition.pnl, subPosition.collateral))}
              </Text>
            </Flex>
          </Box>
        </Flex>
      ))}
    </Box>
  )
}
