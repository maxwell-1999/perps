import { Column } from '../index'

export interface UserData {
  id: number
  name: string
  email: string
  role: string
}

export const data: UserData[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'user',
  },
]

export const columns: Column<UserData>[] = [
  {
    Header: 'ID',
    accessor: 'id',
  },
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Role',
    accessor: 'role',
    renderer: (row: UserData) => <strong>{row.role.toUpperCase()}</strong>,
  },
]
