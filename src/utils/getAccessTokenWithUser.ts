import { type PrismaClient } from "@prisma/client";
import { decrypt } from "./crypto";

type GetAccessToken = {
  db: PrismaClient;
  userId: string;
};

export const getAccessTokenWithUser = async ({
  db,
  userId,
}: GetAccessToken) => {
  const user = await db.user.findUnique({
    include: { bankAccounts: { include: { bankInstitution: true } } },
    where: { id: userId },
  });
  if (!user?.accessToken) throw new Error("User has no access token.");

  const accessToken = decrypt(user.accessToken);

  if (!accessToken) throw new Error("Decrypted access token is falsy");

  return { accessToken, user };
};
