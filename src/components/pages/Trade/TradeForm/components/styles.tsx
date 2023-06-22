import { Flex, IconButton, Text } from '@chakra-ui/react'
import CloseX from '@public/icons/close-x.svg'

import { useStyles, useTradeFormCopy } from '../hooks'

export const FormOverlayHeader = ({ title, onClose }: { title: string; onClose: () => void }) => {
  const copy = useTradeFormCopy()
  const { dashedBorderColor } = useStyles()

  return (
    <Flex
      justifyContent="space-between"
      px="16px"
      py="14px"
      mb="19px"
      alignItems="center"
      borderBottom={`1px dashed ${dashedBorderColor}`}
    >
      <Text fontSize="17px">{title}</Text>
      <IconButton variant="text" icon={<CloseX />} aria-label={copy.closePosition} onClick={onClose} />
    </Flex>
  )
}
