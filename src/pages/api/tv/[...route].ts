import { NextRequest } from 'next/server'

const PythUrlBase = process.env.PYTH_DATAFEED_URL
const AllowedPythEndpoints = ['config', 'symbol_info', 'history']

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET' || !req.url) {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(req.url, `http://${req.headers.get('host')}`)
  const pythPath = url.pathname.replace('/api/tv/', '')
  if (!AllowedPythEndpoints.includes(pythPath)) return new Response('Method not allowed', { status: 405 })

  if (pythPath === 'config') {
    return new Response(
      JSON.stringify({
        supported_resolutions: ['1', '5', '15', '30', '60', '120', '240', '480', '720'],
        supports_group_request: true,
        supports_marks: true,
        supports_search: false,
        supports_timescale_marks: false,
        exchanges: [{ value: 'PYTH', name: 'PYTH', desc: 'PYTH' }],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
        },
      },
    )
  }

  const pythUrl = `${PythUrlBase}/${pythPath}${pythPath !== 'symbol_info' ? url.search : ''}`
  const pythResponse = await fetch(pythUrl)
  if (!pythResponse.ok) {
    console.error(`Error fetching ${pythUrl}. Status: ${pythResponse.status}. Status Text: ${pythResponse.statusText}`)
    return new Response(await pythResponse.text(), { status: 500 })
  }

  return new Response(JSON.stringify(await pythResponse.json()), {
    status: pythResponse.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
    },
  })
}
