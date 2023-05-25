import { Table } from '@ds/Table'

import { OpenPositionTableData } from '../constants'
import { useOpenPositionTableData } from '../hooks'
import { useOpenPositionColumns } from './hooks'

function AllPositions() {
  const tableData = useOpenPositionTableData()
  const columns = useOpenPositionColumns()
  return <Table<OpenPositionTableData> columns={columns} data={tableData} />
}

export default AllPositions
