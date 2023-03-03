// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { hashSync } from 'bcrypt';
import { getServerSession } from 'next-auth';
import { AuthOption } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const session = await getServerSession(req, res, AuthOption)
    const prisma = new PrismaClient()
    let user
    switch (req.method) {
        case "POST":
            const { username, password } = req.body;
            if (!username || !password) return res.status(400).json({
                message: "用户名或密码不能为空"
            })

            user = await prisma.user.findUnique({
                where: {
                    username
                }
            })
            if (user) return res.status(400).json({
                message: "用户已存在"
            })

            await prisma.user.create({
                data: {
                    username,
                    password: hashSync(password, 10)
                }
            })
            await prisma.$disconnect();
            return res.json({
                success: true
            })

        case "GET":
            if (!session?.user?.name) return res.status(400).json({
                message: "用户未登录"
            })
            user = await prisma.user.findUnique({
                where: {
                    username: session.user.name
                }
            })
            if (!user) return res.status(400).json({
                message: "用户不存在"
            })
            const { key } = user;
            await prisma.$disconnect();
            return res.json({
                key: typeof key !== "undefined" && key
            })

        case "PUT":
            if (!session?.user?.name) return res.status(400).json({
                message: "用户未登录"
            })
            user = await prisma.user.findUnique({
                where: {
                    username: session.user.name
                }
            })
            if (!user) return res.status(400).json({
                message: "用户不存在"
            })
            const { key: newkey } = req.body;
            if (!newkey) return res.status(400).json({
                message: "key不能为空"
            })
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    key: newkey
                }
            })
            await prisma.$disconnect();
            return res.json({
                success: true
            })
        default:
            break;
    }

}
