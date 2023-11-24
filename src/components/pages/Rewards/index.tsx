import dynamic from 'next/dynamic'

import { BodyGridItem, HeaderGridItem, SingleColumnLayout } from '@/components/layout/SingleColumnLayout'
import NavBar from '@/components/shared/NavBar'

const Claim = dynamic(() => import('@/components/pages/Rewards/Claim'), { ssr: false })

export default function Rewards() {
  return (
    <SingleColumnLayout>
      <NavBar />
      {/* <HeaderGridItem></HeaderGridItem> */}
      <BodyGridItem>
        <Claim />
      </BodyGridItem>
    </SingleColumnLayout>
  )
}
