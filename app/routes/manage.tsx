import { requireUserId } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { convertToObject } from "~/utils/convert.server";
import { cn } from "~/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
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
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  switch (body.action) {
    case "add": {
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

          return json({ message: "Entry added successfully" });
        } catch (error) {
          return json(
            { error: "Server error, please try again" },
            { status: 500 },
          );
        }
      }

      return json({ fieldErrors: parsedRes.errors }, { status: 400 });
    }

    case "bulkAdd": {
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return json({ error: "Invalid file" }, { status: 400 });
      }

      if (!file.size) {
        return json({ error: "Select a file" }, { status: 400 });
      }

      const text = await file.text();
      const entries = convertToObject(text.split("\n"));

      const parsedEntries = entries
        .map((entry) => {
          const parsedRes = validateAddEntry(entry);

          if (parsedRes.success) {
            return parsedRes.data;
          }

          return null;
        })
        .filter(Boolean) as Email[];

      try {
        for (const {email, name, registrationNumber} of parsedEntries) {
          const data = await db.email.upsert({
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
        }
      } catch (error) {
        return json(
          { error: "Server error, please try again" },
          { status: 500 },
        );
      }

      return json({ message: "Entries added successfully" });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function Manage() {
  const { page, emails, pagesCount } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const addEntryFormRef = useRef<HTMLFormElement>(null);
  const bulkAddEntryFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.error) {
      toast({
        title: "Something went wrong",
        description: actionData.error,
        variant: "destructive",
      });
    }

    if (actionData?.message) {
      toast({
        title: "Success",
        description: actionData.message,
      });
    }
  }, [actionData]);

  useEffect(() => {
    if (navigation.state === "idle") {
      addEntryFormRef.current?.reset();
      bulkAddEntryFormRef.current?.reset();
    }
  }, [navigation]);

  return (
    <main className="flex flex-col gap-5 px-10">
      <h1 className="text-4xl font-bold">Manage Emails</h1>
      <section className="flex gap-3">
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
              <input hidden readOnly name="action" value="add" />
              <Button type="submit" className="font-semibold w-fit self-end">
                Add
              </Button>
            </Form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="font-semibold w-fit">Import entries</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk add entries from a CSV</DialogTitle>
              <DialogDescription>
                Import entries from a CSV file: Make sure the CSV file has the
                following columns: email, name, registrationNumber
              </DialogDescription>
            </DialogHeader>
            <Form
              className="flex flex-col gap-3"
              method="POST"
              encType="multipart/form-data"
              ref={bulkAddEntryFormRef}
            >
              <Input type="file" name="file" accept=".csv" />
              <input hidden readOnly name="action" value="bulkAdd" />
              {navigation.state === "submitting" && (
                <p className="flex flex-col gap-2 text-sm items-center">
                  This can take a while depending on the number of entries{" "}
                  <Loader2 className="animate-spin" width={32} height={32} />
                </p>
              )}
              <Button
                type="submit"
                className="font-semibold w-fit self-end"
                disabled={navigation.state === "submitting"}
              >
                Add entries
              </Button>
            </Form>
          </DialogContent>
        </Dialog>
      </section>
      <section className="flex flex-col gap-3">
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
        <p className="text-center text-sm text-gray-500">
          Page {page} of {pagesCount}
        </p>
        <div className="flex items-center mx-auto gap-2 py-4">
          <Button variant="outline" disabled={page === 1}>
            <Link to="/manage">
              <ChevronsLeft className="text-primary" />
            </Link>
          </Button>
          <Button variant="outline" disabled={page === 1}>
            <Link to={`?page=${page - 1}`}>
              <ChevronLeft className="text-primary" />
            </Link>
          </Button>
          <Button variant="outline" disabled={page === pagesCount}>
            <Link to={`?page=${page + 1}`}>
              <ChevronRight className="text-primary" />
            </Link>
          </Button>
          <Button variant="outline" disabled={page === pagesCount}>
            <Link to={`?page=${pagesCount}`}>
              <ChevronsRight className="text-primary" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
