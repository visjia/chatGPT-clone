import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { AuthOption } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getServerSession(req, res, AuthOption)

    if (!session?.user?.name) return res.status(400).json({
        message: "用户未登录"
    })

    const prisma = new PrismaClient()

    switch (req.method) {
        case "GET":
            const conversations = await prisma.conversation.findMany({
                where: {
                    user: {
                        username: session.user.name
                    }
                },
                include: {
                    messages: true
                }
            })

            await prisma.$disconnect()

            return res.json({
                conversations
            })

        case "DELETE":
            const id = req.body.id
            console.log(id);
            await prisma.message.deleteMany({
                where: {
                    conversationId: id
                }
            })
            await prisma.conversation.delete({
                where: {
                    id
                }
            })


            await prisma.$disconnect()
            return res.json({
                message: "删除成功"
            })
        default:
            break;
    }

}