import { requireUserId } from "~/utils/session.server";
import { convertToCSV } from "~/utils/convert.server";
import { db } from "~/utils/db.server";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const filters = params.get("filters")?.split(",");

  let select: Record<string, boolean> = { email: true };
  let where = {};

  if (filters?.includes("name")) {
    select = {
      ...select,
      name: true,
    };
    where = {
      ...where,
      name: {
        not: null,
      },
    };
  }

  if (filters?.includes("regNo")) {
    select = {
      ...select,
      registrationNumber: true,
    };
    where = {
      ...where,
      registrationNumber: {
        not: null,
      },
    };
  }

  if (filters?.includes("uni")) {
    where = {
      ...where,
      email: {
        endsWith: "@srmist.edu.in",
      },
    };
  }

  const emails = await db.email.findMany({
    select,
    where,
  });

  const data = convertToCSV(emails);

  return new Response(data, {
    headers: {
      "content-type": "text/csv;charset=UTF-8",
    },
  });
};
