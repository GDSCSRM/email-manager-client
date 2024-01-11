import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/session.server";
import { Mail } from "lucide-react";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {Form} from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Email Manager" },
    { name: "description", content: "Manage Emails" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  return null;
}

export default function Index() {
  return (
    <>
      <nav className="flex items-center justify-between px-10 py-7">
        <p className="flex items-center gap-3 text-xl font-bold"><Mail width={32} height={32} className="text-primary" />Email Manager</p>
        <Form method="POST" action="/sign-out">
          <Button type="submit" className="font-bold">Logout</Button>
        </Form>
      </nav>
    </>
  );
}
