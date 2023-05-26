import {
  Box,
  Table as ChakraTable,
  Flex,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { Row, TableOptions, UseSortByOptions, useSortBy, useTable } from 'react-table'

import DownArrow from '../../../../public/icons/downArrow.svg'
import UpArrow from '../../../../public/icons/upArrow.svg'

export interface Column<T = any> {
  Header: string
  accessor: keyof T
  renderer?: (row: T) => JSX.Element
  isSorted?: boolean
  isSortedDesc?: boolean
  disableSortBy?: boolean
  sortType?: (rowA: Row, rowB: Row, id: string, desc: boolean) => number
}

interface ExtendedTableOptions<T extends object> extends TableOptions<T>, UseSortByOptions<T> {
  autoResetSortBy?: boolean
}

export interface TableProps<T extends object> {
  data: T[]
  columns: Column<T>[]
  caption?: string
  handleRowClick?: (row: T) => void
}

export const Table = <T extends object = any>({ data, columns, caption, handleRowClick }: TableProps<T>) => {
  const memoData = useMemo(() => data, [data])
  const memoColumns = useMemo(() => columns, [columns])

  const theme = useTheme()
  const thColor = useColorModeValue(theme.colors.brand.whiteAlpha[50], theme.colors.brand.whiteAlpha[50])
  const thActiveColor = useColorModeValue(theme.colors.black, theme.colors.white)
  const trHoverColor = useColorModeValue(theme.colors.brand.blackAlpha[5], theme.colors.brand.whiteAlpha[5])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns: memoColumns, data: memoData, autoResetSortBy: false } as ExtendedTableOptions<T>,
    useSortBy,
  )
  const lastRow = rows.length - 1
  const borderColor = useColorModeValue(theme.colors.brand.blackAlpha[10], theme.colors.brand.whiteAlpha[10])

  return (
    <Box overflowX="auto" height="194px">
      <ChakraTable {...getTableProps()} size="sm">
        {caption && <TableCaption>{caption}</TableCaption>}
        <Thead height="35px">
          {headerGroups.map((headerGroup, groupIndex) => (
            <Tr {...headerGroup.getHeaderGroupProps()} key={groupIndex}>
              {headerGroup.headers.map((column, headerIndex) => (
                <Th
                  {...column.getHeaderProps()}
                  {...(column as any).getSortByToggleProps()}
                  key={`th-${headerIndex}`}
                  color={(column as any).isSorted ? thActiveColor : thColor}
                  textTransform="none"
                  borderBottom={`1px solid ${borderColor}`}
                >
                  <Flex alignItems="center">
                    {column.render('Header')}
                    <span style={{ marginLeft: '4px' }}>
                      {(column as any).isSorted ? (column as any).isSortedDesc ? <DownArrow /> : <UpArrow /> : ''}
                    </span>
                  </Flex>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row, rowIndex) => {
            prepareRow(row)
            return (
              <Tr
                {...row.getRowProps()}
                key={`tr-${rowIndex}`}
                onClick={() => {
                  if (handleRowClick) {
                    handleRowClick(row.original)
                  }
                }}
                _hover={{ background: trHoverColor }}
                cursor={handleRowClick ? 'pointer' : 'initial'}
              >
                {row.cells.map((cell, cellIndex) => {
                  return (
                    <Td
                      {...cell.getCellProps()}
                      key={cellIndex}
                      borderBottom={rowIndex === lastRow ? 'none' : `1px solid ${borderColor}}`}
                    >
                      {'renderer' in cell.column && typeof cell.column['renderer'] === 'function'
                        ? cell.column['renderer'](cell.row.original)
                        : cell.render('Cell')}
                    </Td>
                  )
                })}
              </Tr>
            )
          })}
        </Tbody>
      </ChakraTable>
    </Box>
  )
}
