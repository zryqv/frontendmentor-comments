import { prisma } from '../../server/db/client';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PUT') {
    const { userId, content, commentId } = req.body;
    console.log('content:>>>', content);
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (userId === comment?.userId) {
      const result = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });
      res.json(result);
    }
    // remove extra space
    //   req.body.title = req.body.title.replace(/\s+/g, " ").trim();
    //   req.body.categoryName = req.body.categoryName.replace(/\s+/g, " ").trim();
    //   req.body.description = req.body.description?.replace(/\s+/g, " ").trim();
    //   req.body.author = req.body.author?.replace(/\s+/g, " ").trim();
  } else if (req.method === 'Patch') {
    const { userId, content, commentId } = req.body;
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (userId === comment?.userId) {
      const result = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });
      res.json(result);
    }
  } else if (req.method === 'DELETE') {
    const { userId, commentId } = req.body;
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (userId === comment?.userId) {
      const result = await prisma.comment.delete({ where: { id: commentId } });
      res.json({ message: 'deleted' });
    }
  } else {
    res.status(500).json({ message: 'nothing to see here' });
  }
}
