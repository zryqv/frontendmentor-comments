import { prisma } from "../../server/db/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId, content, replyingToId } = req.body;
    const result = await prisma.comment.create({
      data: { content, userId, replyingToId },
    });
    res.status(200).json(result);
    // remove extra space
    //   req.body.title = req.body.title.replace(/\s+/g, " ").trim();
    //   req.body.categoryName = req.body.categoryName.replace(/\s+/g, " ").trim();
    //   req.body.description = req.body.description?.replace(/\s+/g, " ").trim();
    //   req.body.author = req.body.author?.replace(/\s+/g, " ").trim();
  } else {
    res.status(500).json({ message: "nothing to see here" });
  }
}
