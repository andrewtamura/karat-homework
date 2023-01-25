
import { getCardholders } from './apiClient'

export const loader = async ({ params }) => {
  return await getCardholders(params.accountId)
}

const Cardholders = () => {
  return null
}
export default Cardholders
