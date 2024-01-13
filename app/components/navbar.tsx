import { Button } from "~/components/ui/button";
import { Mail } from "lucide-react";
import { Form, Link } from "@remix-run/react";

interface NavbarProps {
  isLoggedIn: boolean;
  path: string;
}

const navLinks: { [key: string]: { text: string; to: string } } = {
  "/": {
    text: "Add Emails",
    to: "/manage",
  },
  "/manage": {
    text: "Dashboard",
    to: "/",
  },
};

const Navbar = ({ path, isLoggedIn }: NavbarProps) => {
  const { text, to } = navLinks[path in navLinks ? path : "/"];

  return (
    <nav className="flex items-center justify-between px-10 py-7">
      <Link to="/" className="flex items-center gap-3 text-xl font-bold">
        <Mail width={32} height={32} className="text-primary" />
        Email Manager
      </Link>
      {isLoggedIn && (
        <div className="flex gap-3">
          <Button className="font-bold" asChild>
            <Link to={to}>{text}</Link>
          </Button>
          <Form method="POST" action="/sign-out">
            <Button type="submit" variant="outline" className="font-bold">
              Logout
            </Button>
          </Form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
