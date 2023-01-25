import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home, { loader as homeLoader } from './Home';
import NotFound from './404';
import reportWebVitals from './reportWebVitals';
import AccountOnboarding, {action as accountOnboardingAction } from './AccountOnboarding';
import Account, {loader as accountLoader, action as accountUpdateAction } from "./Account"
import About from "./About"
import CardholderOnboard, { action as createCardholderAction } from "./CardholderOnboard"
import CardOnboard, { action as createCardAction, loader as createCardLoader } from "./CardOnboard"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <NotFound />,
    loader: homeLoader,
    children: [
      {
        index: true,
        element: <About />
      },
      {
        path: "/accounts/new",
        element: <AccountOnboarding />,
        action: accountOnboardingAction
      },
      {
        path: "/accounts/:accountId",
        loader: accountLoader,
        action: accountUpdateAction,
        element: <Account />,
      },
      {
        path: "/accounts/:accountId/cardholders/new",
        element: <CardholderOnboard />,
        action: createCardholderAction
      },{
        path: "/accounts/:accountId/cards/new",
        element: <CardOnboard />,
        action: createCardAction,
        loader: createCardLoader
      }
    ]
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
