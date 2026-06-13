import { useParams, Navigate } from 'react-router-dom'
import { findSlot } from '../data/slots'
import Slot from '../games/Slot'

export default function SlotRoute() {
  const { slug } = useParams()
  const cfg = slug ? findSlot(slug) : undefined
  if (!cfg) return <Navigate to="/slots" replace />
  return <Slot cfg={cfg} />
}
