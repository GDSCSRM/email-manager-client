import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import {
  Download,
  Filter,
  GraduationCap,
  Hash,
  Mail,
  Pencil,
  Settings,
  User,
} from "lucide-react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import Section from "~/components/section";

export const meta: MetaFunction = () => {
  return [
    { title: "Email Manager" },
    { name: "description", content: "Manage Emails" },
  ];
};

type LoaderData = {
  emailsCount: number;
  uniEmailsCount: number;
  emailsWithName: number;
  emailsWithRegistrationNumber: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const emailsCount = await db.email.count();
  const uniEmailsCount = await db.email.count({
    where: {
      email: {
        endsWith: "srmist.edu.in",
      },
    },
  });
  const emailsWithName = await db.email.count({
    where: {
      name: {
        not: null,
      },
    },
  });
  const emailsWithRegistrationNumber = await db.email.count({
    where: {
      registrationNumber: {
        not: null,
      },
    },
  });

  return json({
    emailsCount,
    uniEmailsCount,
    emailsWithName,
    emailsWithRegistrationNumber,
  });
};

export default function Index() {
  const {
    emailsCount,
    uniEmailsCount,
    emailsWithName,
    emailsWithRegistrationNumber,
  } = useLoaderData<LoaderData>();

  return (
    <main className="flex flex-col gap-7 px-10">
      <Section title="Stats">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Emails <Mail className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Total number of emails available</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{emailsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Uni Emails <GraduationCap className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>
              Total number of SRM emails available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{uniEmailsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Emails with Name <User className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Total number of emails with name</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{emailsWithName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Emails with Registration Number{" "}
              <Hash className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>
              Total number of emails with registration number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{emailsWithRegistrationNumber}</p>
          </CardContent>
        </Card>
      </Section>
      <Section title="Manage">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Emails
              <Mail className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Add or remove emails</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="flex items-center gap-2 font-semibold w-fit"
              asChild
            >
              <Link to="/manage">
                <Pencil width={20} height={20} /> Manage
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Users
              <User className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Manage Users</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="flex items-center gap-2 font-semibold w-fit"
              asChild
            >
              <Link to="/admin">
                <Settings width={20} height={20} /> Manage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Section>
      <Section title="Download">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              All Emails <Mail className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Download all emails as CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="flex items-center gap-2 font-semibold">
              <Download width={20} height={20} /> Download
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Emails with Name
              <Mail className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>
              Download all emails with name as CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="flex items-center gap-2 font-semibold">
              <Download width={20} height={20} /> Download
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Advanced
              <Filter className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Download emails with filter</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="flex items-center gap-2 font-semibold w-fit"
              asChild
            >
              <Link to="/manage">
                <Filter width={20} height={20} /> Download
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
