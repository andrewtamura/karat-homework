import {
  Form,
  Link,
  redirect,
  useLoaderData
} from 'react-router-dom'
import DotObject from 'dot-object'
import { createCard, getCardholders } from './apiClient'

export async function action ({ request, params }) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const shapedData = DotObject.object(data)
  await createCard(params.accountId, shapedData)
  return redirect(`/accounts/${params.accountId}`)
}

export async function loader ({ params }) {
  const cardholders = await getCardholders(params.accountId)
  return { cardholders, accountId: params.accountId }
}

const CardOnboard = () => {
  const { cardholders, accountId } = useLoaderData()
  console.log(cardholders)
  if (!cardholders?.length) {
    return (
      <div>
        <h2>No cardholders</h2>
        <p>You need to add a cardholder before you can add a card.</p>
        <Link to={`/accounts/${accountId}/cardholders/new`}>Add a cardholder</Link>
      </div>
    )
  }
  return (
    <div>
      <h2>Create a new card</h2>
      <Form method='POST'>
        <p>
          <label>Cardholder
            <select name='cardholder' required>
              {cardholders.map(({ data }) => <option key={data.id} value={data.id}>{data.id}</option>)}
            </select>
          </label>
        </p>
        <p>
          <button type='submit'>Create</button>
        </p>
      </Form>
    </div>

  )
}
export default CardOnboard
