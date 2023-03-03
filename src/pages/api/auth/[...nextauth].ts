import { PrismaClient } from "@prisma/client"
import { compareSync } from "bcrypt"
import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"

type user = {
    username: string,
    password: string
    key?: string
    id: string,
}

export const AuthOption: NextAuthOptions = {
    session: {
        strategy: "jwt"
    },
    providers: [
        CredentialsProvider({
            id: "Account",
            name: "Account",
            type: "credentials",
            credentials: {
                username: { label: "用户名", type: "text", placeholder: "请输入用户名" },
                password: { label: "密码", type: "password", placeholder: "请输入密码" }
            },
            async authorize(credentials: Record<"username" | "password", string> | undefined) {
                if (typeof credentials === "undefined") return null
                const { username, password } = credentials;
                const prisma = new PrismaClient()
                const user = await prisma.user.findUnique({
                    where: {
                        username
                    }
                })
                if (!user) {
                    throw new Error("用户不存在")
                }
                if (!compareSync(password, user.password)) {
                    throw new Error("密码错误")
                }
                await prisma.$disconnect()
                return {
                    name: user.username,
                    id: String(user.id),
                    key: typeof user.key !== "undefined"
                }
            }
        })
    ],
    callbacks: {
        jwt(params) {
            return params.token
        },
    },
    secret: "panda",
    pages: {
        signIn: "/user"
    },
    debug: true
}

export default NextAuth(AuthOption)