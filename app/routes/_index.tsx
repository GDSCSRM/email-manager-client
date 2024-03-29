import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { db } from "~/utils/db.server";
import { isAdmin, requireUserId } from "~/utils/session.server";
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
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import Section from "~/components/section";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { useState } from "react";

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
  isAdmin: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const isUserAdmin = await isAdmin(request);

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
    isAdmin: isUserAdmin,
  });
};

export default function Index() {
  const {
    emailsCount,
    uniEmailsCount,
    emailsWithName,
    emailsWithRegistrationNumber,
    isAdmin,
  } = useLoaderData<LoaderData>();

  const [filters, setFilters] = useState({
    uni: false,
    name: false,
    regNo: false,
  });

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
        {isAdmin && (
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
        )}
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
            <Button
              asChild
              className="flex items-center gap-2 font-semibold w-fit"
            >
              <a href="/api/download/emails" download>
                <Download width={20} height={20} /> Download
              </a>
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
            <Button
              asChild
              className="flex items-center gap-2 font-semibold w-fit"
            >
              <a href="/api/download/emails-with-name" download>
                <Download width={20} height={20} /> Download
              </a>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 font-semibold w-fit">
                    <Filter width={20} height={20} /> Download
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Advanced download</DialogTitle>
                    <DialogDescription>
                      Download emails with filter
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="uni"
                          checked={filters.uni}
                          onCheckedChange={() =>
                            setFilters((prevState) => {
                              return {
                                ...prevState,
                                uni: !prevState.uni,
                              };
                            })
                          }
                        />
                        <Label htmlFor="uni">Only SRM Emails</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="name"
                          checked={filters.name}
                          onCheckedChange={() =>
                            setFilters((prevState) => {
                              return {
                                ...prevState,
                                name: !prevState.name,
                              };
                            })
                          }
                        />
                        <Label htmlFor="name">Include Name</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="regNo"
                          checked={filters.regNo}
                          onCheckedChange={() =>
                            setFilters((prevState) => {
                              return {
                                ...prevState,
                                regNo: !prevState.regNo,
                              };
                            })
                          }
                        />
                        <Label htmlFor="regNo">
                          Include Registration Number
                        </Label>
                      </div>
                    </div>
                    <Button asChild className="font-semibold w-fit self-end">
                      <a
                        href={`/api/download/emails-with-filters?filters=${Object.entries(
                          filters,
                        )
                          .map(([key, value]) => {
                            if (value) {
                              return key;
                            }
                          })
                          .filter(Boolean)
                          .join(",")}`}
                        download
                      >
                        Download
                      </a>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Button>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}
