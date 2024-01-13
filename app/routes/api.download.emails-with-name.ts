import { convertToCSV } from "~/utils/convert.server";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const emails = await db.email.findMany({
    where: {
      name: {
        not: null,
      },
    },
    select: { email: true, name: true },
  });

  const data = convertToCSV(emails);

  return new Response(data, {
    headers: {
      "content-type": "text/csv;charset=UTF-8",
    },
  });
};
