import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/use-toast";
import { cn } from "~/lib/utils";
import { isAdmin, signUp } from "~/utils/session.server";
import { validateAddUser } from "~/utils/validation.server";
import { db } from "~/utils/db.server";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import type { User } from "@prisma/client";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Admin | Email Manager" },
    { name: "description", content: "Manage Users" },
  ];
};

type LoaderData = {
  users: User[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const isUserAdmin = await isAdmin(request);

  if (!isUserAdmin) {
    return redirect("/");
  }

  const users = await db.user.findMany({});

  return json({ users });
};

type ActionData = {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const action: ActionFunction = async ({ request }) => {
  const isUserAdmin = await isAdmin(request);

  if (!isUserAdmin) {
    return redirect("/");
  }

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parsedRes = validateAddUser(body);

  if (!parsedRes.success) {
    return json({ fieldErrors: parsedRes.errors }, { status: 400 });
  }

  const { email, password, username } = parsedRes.data;
  const res = await signUp(email, username, password);

  if (!res.success) {
    return json({ error: res.error }, { status: 400 });
  }

  return json({ message: "User added successfully" });
};

export default function Admin() {
  const { users } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const addUserFormRef = useRef<HTMLFormElement>(null);

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
      addUserFormRef.current?.reset();
    }
  }, [navigation]);

  return (
    <main className="flex flex-col gap-5 px-10">
      <h1 className="text-4xl font-bold">Manage Users</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="font-semibold w-fit">Add User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new user</DialogTitle>
          </DialogHeader>
          <Form
            className="flex flex-col gap-3"
            method="POST"
            ref={addUserFormRef}
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
              <Label>Username</Label>
              <Input name="username" placeholder="Username" />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
                  actionData?.fieldErrors?.username && "block",
                )}
              >
                {actionData?.fieldErrors?.username}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Password</Label>
              <Input name="password" placeholder="Password" />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
                  actionData?.fieldErrors?.password && "block",
                )}
              >
                {actionData?.fieldErrors?.password}
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
          { accessorKey: "email", header: "Email" },
          {
            accessorKey: "isAdmin",
            header: "Access",
            cell: ({ row }) => (
              <Badge className="font-semibold">
                {row.getValue("isAdmin") ? "Admin" : "User"}
              </Badge>
            ),
          },
          { accessorKey: "username", header: "Username" },
        ]}
        data={users}
      />
    </main>
  );
}
