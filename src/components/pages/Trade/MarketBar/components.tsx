import { Divider, Flex, FlexProps, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { useState } from 'react'

import colors from '@/components/design-system/theme/colors'
import { useMarketContext } from '@/contexts/marketContext'
import { formatBig6Percent } from '@/utils/big6Utils'
import { calcFundingRates } from '@/utils/positionUtils'

import { breakpoints } from '@ds/theme/styles'

import { useMarketBarCopy } from './hooks'

export const MarketContainer: React.FC<FlexProps> = ({ children, ...props }) => (
  <Flex height="100%" alignItems="center" mr={8} {...props}>
    {children}
  </Flex>
)

export const Stat: React.FC<{
  label: string | React.ReactNode
  value: string | React.ReactNode
  valueColor?: string
}> = ({ label, value, valueColor }) => (
  <Flex flexDirection="column">
    {typeof label === 'string' ? (
      <Text whiteSpace="nowrap" fontSize="12px" color={colors.brand.whiteAlpha[50]}>
        {label}
      </Text>
    ) : (
      label
    )}
    {typeof value === 'string' ? (
      <Text color={valueColor} whiteSpace="nowrap">
        {value}
      </Text>
    ) : (
      value
    )}
  </Flex>
)

export const ResponsiveFlex = styled(Flex)`
  height: 100%;
  justify-content: space-between;
  width: 100%;
  @media (min-width: ${breakpoints.md}) {
    width: initial;
    justify-content: flex-start;
  }
`

export const DesktopContainer = styled(Flex)`
  overflow-x: auto;
  display: none;
  @media (min-width: ${breakpoints.md}) {
    display: flex;
  }
`

export const PriceContainer = styled(MarketContainer)`
  margin-right: 14px;
  @media (min-width: ${breakpoints.md}) {
    margin-right: 32px;
  }
`

export const MobileMarketContainer = styled(MarketContainer)`
  overflow-x: auto;
  display: flex;
  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`

export const DividerStyled = styled(Divider)`
  margin-right: 14px;
  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`

export const PriceText = styled(Text)`
  font-size: 15px;
  @media (min-width: ${breakpoints.xs}) {
    font-size: 18px;
  }
  @media (min-width: ${breakpoints.md}) {
    font-size: 20px;
  }
`

enum FundingRateOption {
  hourlyFunding = 'hourlyFunding',
  eightHourFunding = 'eightHourFunding',
  dailyFunding = 'dailyFunding',
  yearlyFunding = 'yearlyFunding',
}

const FundingRateDropdown = ({
  onClick,
  selectedTimeFrame,
  options,
}: {
  onClick: (fundingTimeFrame: FundingRateOption) => void
  selectedTimeFrame: FundingRateOption
  options: FundingRateOption[]
}) => {
  const labels = useMarketBarCopy().fundingRateOption
  return (
    <Menu gutter={0}>
      {({ isOpen }) => (
        <>
          <MenuButton
            fontSize="11px"
            borderRadius="5px"
            borderBottomLeftRadius={isOpen ? '0' : '5px'}
            borderBottomRightRadius={isOpen ? '0' : '5px'}
            border={`1px solid ${colors.brand.whiteAlpha[30]}`}
            p={0}
            height="fit-content"
            width="30px"
          >
            {labels[selectedTimeFrame]}
          </MenuButton>
          <MenuList
            p={0}
            width="30px"
            minWidth="30px"
            borderTopRightRadius="0"
            borderTopLeftRadius="0"
            border="none"
            borderBottomLeftRadius="5px"
            borderBottomRightRadius="5px"
          >
            {options.map((option) => {
              return (
                <MenuItem
                  key={option}
                  onClick={() => onClick(option)}
                  py="2px"
                  pl="6px"
                  fontSize="11px"
                  color={colors.brand.whiteAlpha[70]}
                  bg={colors.brand.gray[360]}
                  _hover={{ color: 'white' }}
                  borderBottom={`1px solid ${colors.brand.whiteAlpha[10]}`}
                  _last={{ borderBottom: 'none', borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }}
                >
                  {labels[option]}
                </MenuItem>
              )
            })}
          </MenuList>
        </>
      )}
    </Menu>
  )
}

export const FundingRateStat = () => {
  const { selectedMarketSnapshot2: snapshot } = useMarketContext()
  const copy = useMarketBarCopy()
  const options = Object.keys(FundingRateOption) as FundingRateOption[]
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<FundingRateOption>(FundingRateOption.hourlyFunding)
  const longRate = calcFundingRates(snapshot?.fundingRate?.long)
  const shortRate = calcFundingRates(snapshot?.fundingRate?.short)
  const isLongNegative = longRate[selectedTimeFrame] < 0n
  const isShortNegative = shortRate[selectedTimeFrame] < 0n

  return (
    <Stat
      label={
        <Flex gap={1}>
          <Text variant="label">{copy.hourlyFunding}</Text>
          <FundingRateDropdown options={options} selectedTimeFrame={selectedTimeFrame} onClick={setSelectedTimeFrame} />
        </Flex>
      }
      value={
        <Flex gap={1}>
          <Text color={isLongNegative ? colors.brand.green : colors.brand.red}>
            {formatBig6Percent(longRate[selectedTimeFrame], { numDecimals: 4 })}
          </Text>
          <Text>{copy.slash}</Text>
          <Text color={isShortNegative ? colors.brand.green : colors.brand.red}>
            {formatBig6Percent(shortRate[selectedTimeFrame], { numDecimals: 4 })}
          </Text>
        </Flex>
      }
    />
  )
}
