import { lazy } from 'react';

const Auth = lazy(() => import('./components/screens/Login'));
const Chat = lazy(() => import('./components/Chat'));
import { CHAT_ROUTE, LOGIN_ROUTE } from "./utils/consts";

export const publickRoutes = [
  {
    path: LOGIN_ROUTE,
    component: Auth
  }
]

export const privateRoutes = [
  {
    path: CHAT_ROUTE,
    component: Chat
  }
]