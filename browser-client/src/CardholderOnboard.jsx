import {
    Form,
    redirect,
  } from "react-router-dom";
import DotObject from "dot-object";
import { createCardholder } from "./apiClient";

export async function action({ request, params }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const shapedData = DotObject.object(data);
    await createCardholder(params.accountId, shapedData);
    return redirect(`/accounts/${params.accountId}`);
}


const CardholderOnboard = () => {
    return (
        <div>
            <h2>Add a new cardholder</h2>
            <Form method="POST">
                <p>
                    <label>Name
                        <input name="name" required autoComplete="name"></input>
                    </label>
                </p>
                <p>
                    <label>Email
                        <input type="email" name="email" required autoComplete="email"></input>
                    </label>
                </p>
                <p>
                    <label>Phone Number
                        <input name="phone_number" required autoComplete="tel"></input>
                    </label>
                </p>
                <p>
                    <label>Street Address
                        <input name="billing.address.line1" required autoComplete="address-line1"></input>
                    </label>
                </p>
                <p>
                    <label>City
                        <input name="billing.address.city" required autoComplete="city"></input>
                    </label>
                </p>
                <p>
                    <label>State
                        <input name="billing.address.state" required autoComplete="state"></input>
                    </label>
                </p>
                <p>
                    <label>Postal Code
                        <input name="billing.address.postal_code" required autoComplete="postal-code"></input>
                    </label>
                </p>
                <p>
                    <button type="submit">Create</button>
                </p>
            </Form>
        </div>
    );
}

export default CardholderOnboard;