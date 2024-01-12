import styles from "~/styles/globals.css";
import { Toaster } from "~/components/ui/toaster";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import Navbar from "~/components/navbar";
import { json } from "@remix-run/node";
import { getUserId } from "~/utils/session.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

type LoaderData = {
  isLoggedIn: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const isLoggedIn = !!(await getUserId(request));

  return json({ isLoggedIn });
};

export default function App() {
  const { isLoggedIn } = useLoaderData<LoaderData>();
  const { pathname } = useLocation();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Toaster />
        <Navbar isLoggedIn={isLoggedIn} path={pathname} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
