import { convertToCSV } from "~/utils/convert.server";
import { db } from "~/utils/db.server";

export const loader = async () => {
  const emails = await db.email.findMany({ select: { email: true } });

  const data = convertToCSV(emails);

  return new Response(data, {
    headers: {
      "content-type": "text/csv;charset=UTF-8",
    },
  });
};
