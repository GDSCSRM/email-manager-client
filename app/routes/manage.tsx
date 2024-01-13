import { requireUserId } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "~/components/ui/use-toast";
import { validateAddEntry } from "~/utils/validation.server";
import { cn } from "~/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import type { Email } from "@prisma/client";
import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Manage Emails | Email Manager" },
    { name: "description", content: "Manage Emails" },
  ];
};

type LoaderData = {
  page: number;
  emails: Email[];
  pagesCount: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? 1);

  const pagesCount = Math.ceil((await db.email.count()) / 10);

  if (page < 1 || page > pagesCount) {
    return redirect("/manage");
  }

  const emails = await db.email.findMany({
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * 10,
    take: 10,
  });

  return json({ page, emails, pagesCount });
};

type ActionData = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const filteredBody = Object.fromEntries(
    Object.entries(body).filter(([key, value]) => value),
  );
  const parsedRes = validateAddEntry(filteredBody);

  if (parsedRes.success) {
    try {
      const { email, name, registrationNumber } = parsedRes.data;
      await db.email.upsert({
        where: {
          email,
        },
        create: {
          email,
          name,
          registrationNumber,
        },
        update: {
          name,
          registrationNumber,
        },
      });

      return null;
    } catch (error) {
      return json({ error: "Server error, please try again" }, { status: 500 });
    }
  }

  return json({ fieldErrors: parsedRes.errors }, { status: 400 });
};

export default function Manage() {
  const { page, emails, pagesCount } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const addEntryFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.error) {
      toast({
        title: "Something went wrong",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData]);

  useEffect(() => {
    if (
      navigation.state === "loading" &&
      navigation.formData != null &&
      navigation.formAction === navigation.location.pathname
    ) {
      toast({
        title: "Entry added",
        description: "New email entry added successfully",
      });
    }

    addEntryFormRef.current?.reset();
  }, [navigation]);

  return (
    <main className="flex flex-col gap-7 px-10">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="font-semibold w-fit">Add entry</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new entry</DialogTitle>
          </DialogHeader>
          <Form
            className="flex flex-col gap-3"
            method="POST"
            ref={addEntryFormRef}
          >
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input name="email" placeholder="Email" />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
                  actionData?.fieldErrors?.email && "block",
                )}
              >
                {actionData?.fieldErrors?.email}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input name="name" placeholder="Name" />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
                  actionData?.fieldErrors?.name && "block",
                )}
              >
                {actionData?.fieldErrors?.name}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Registration Number</Label>
              <Input
                name="registrationNumber"
                placeholder="Registration Number"
              />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
                  actionData?.fieldErrors?.registrationNumber && "block",
                )}
              >
                {actionData?.fieldErrors?.registrationNumber}
              </p>
            </div>
            <Button type="submit" className="font-semibold w-fit self-end">
              Add
            </Button>
          </Form>
        </DialogContent>
      </Dialog>
      <DataTable
        columns={[
          {
            accessorKey: "email",
            header: "Email",
          },
          {
            accessorKey: "name",
            header: "Name",
          },
          {
            accessorKey: "registrationNumber",
            header: "Registration Number",
          },
          {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) =>
              new Date(row.getValue("createdAt")).toLocaleDateString(),
          },
        ]}
        data={emails}
      />
      <div className="flex items-center mx-auto space-x-2 py-4">
        <Button variant="outline" disabled={page == 1}>
          <Link to={`?page=${page - 1}`}>
            <ChevronLeft className="text-primary" />
          </Link>
        </Button>
        <Button variant="outline" disabled={page == pagesCount}>
          <Link to={`?page=${page + 1}`}>
            <ChevronRight className="text-primary" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
