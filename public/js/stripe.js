/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51OSja4EwmnYQB7P1uIpVOzvb42zBqJTL2HaVN2QK8Y0OtBIU5aV9WeVF6ubW7uDYGMYL5l12kyaaFv7Vg4Yu6miJ00ACMC9ZmA');
 
export const bookTour = async tourId => {
  try {
    // 1.- Get Checkout session
    const response = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    const session = response.data.session;
 
    // 2.- Redirect to checkout form
    await stripe.redirectToCheckout({
      sessionId: session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error');
  }
};
