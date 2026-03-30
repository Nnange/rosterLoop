import RosterClient from './RosterClient'

export default function RosterPage({ params }: { params: Promise<{ id: string }> }) {
  return <RosterClient params={params} />
}

