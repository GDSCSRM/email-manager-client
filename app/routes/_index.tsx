import { Button } from "~/components/ui/button";
import { Mail } from "lucide-react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Email Manager" },
    { name: "description", content: "Manage Emails" },
  ];
};

export default function Index() {
  return (
    <>
      <nav className="flex items-center justify-between px-10 py-7">
        <p className="flex gap-3 text-xl font-bold"><Mail className="text-primary" /> Email Manager</p>
        <Button>Logout</Button>
      </nav>
    </>
  );
}
