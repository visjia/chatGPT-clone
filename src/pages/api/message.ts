import { PrismaClient } from ".prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { AuthOption } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session = await getServerSession(req, res, AuthOption)

    if (!session?.user?.name) return res.status(400).json({
        message: "用户未登录"
    })

    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({
        where: {
            username: session.user.name
        }
    })

    if (!user) return res.status(400).json({
        message: "用户不存在"
    })

    if (!user.key) return res.status(400).json({
        message: "尚未设置api key"
    })

    const messages: { role: "user" | "assistant", content: string, conversationId?: number }[] = req.body.messages
    const conversationId: number = req.body.conversationId
    let _conversation


    console.log(req.body)

    if (!conversationId && !messages[0].conversationId) {
        // 如果是第一次对话，则建立一个新的会话
        _conversation = await prisma.conversation.create({
            data: {
                messages: {
                    create: {
                        ...messages[0]
                    }
                },
                userId: user.id,
                name: messages[0].content
            }
        })

    } else {
        // 如果不是第一次对话，则在已有的会话中添加消息
        _conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId || messages[0].conversationId
            }
        })

        if (!_conversation) return res.status(400).json({
            message: "会话不存在"
        })

        await prisma.message.create({
            data: {
                role: "user",
                content: messages[messages.length - 1].content,
                conversationId: _conversation.id
            }
        })
    }


    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.key}`
        },
        body: JSON.stringify({
            messages: messages.map(msg => {
                return {
                    role: msg.role,
                    content: msg.content
                }
            }),
            model: "gpt-3.5-turbo"
        })
    }).then(res => res.json())

    await prisma.message.create({
        data: {
            role: "assistant",
            content: response.choices[0].message.content,
            conversationId: _conversation.id
        }
    })


    const message = await prisma.message.findMany({
        where: {
            conversationId: _conversation.id
        },
        orderBy: {
            id: "asc"
        }
    })

    await prisma.$disconnect()

    return res.json({
        message,
        conversationId: _conversation.id
    })



}