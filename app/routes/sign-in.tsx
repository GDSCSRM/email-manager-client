import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { createUserSession, getUserId, signIn } from "~/utils/session.server";
import { validateSignIn } from "~/utils/validation.server";
import { cn } from "~/lib/utils";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useToast } from "~/components/ui/use-toast";
import { useEffect } from "react";
import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign In | Email Manager" },
    { name: "description", content: "Sign In into Email Manager" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  return null;
};

type ActionData = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validateSignIn(body);

  if (parseRes.success) {
    const { username, password } = parseRes.data;
    const res = await signIn(username, password);
    if (res.success) {
      const { user } = res.data;
      return createUserSession(user.id, "/");
    } else {
      return json({ error: res.error }, { status: 400 });
    }
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function SignIn() {
  const actionData = useActionData<ActionData>();
  const { toast } = useToast();

  useEffect(() => {
    if (actionData?.error) {
      toast({
        title: "Something went wrong",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData]);

  return (
    <Form
      method="POST"
      className="flex flex-col h-[75vh] gap-5 grow justify-center w-80 mx-auto"
    >
      <h1 className="text-3xl font-bold">Welcome Back!</h1>
      <div className="flex flex-col gap-2">
        <Label>Username</Label>
        <Input placeholder="Username" name="username" />
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
        <Input placeholder="Password" type="password" name="password" />
        <p
          className={cn(
            "text-sm text-destructive hidden",
            actionData?.fieldErrors?.password && "block",
          )}
        >
          {actionData?.fieldErrors?.password}
        </p>
      </div>
      <Button type="submit" className="text-base font-semibold">
        Sign In
      </Button>
    </Form>
  );
}
