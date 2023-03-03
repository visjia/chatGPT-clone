import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react"

export default function User() {

    const [isReg, setIsReg] = useState(false)
    const [message, setMessage] = useState("")

    const router = useRouter()

    return (
        <>
            <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                        className="mx-auto h-12 w-auto"
                        src="/openai.svg"
                        alt="Workflow"
                    />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">登录</h2>
                </div>


                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    {/* 展示错误提示 */}
                    {message && (
                        <div className="w-full flex justify-center items-center">
                            <div className="mt-4 w-4/5">
                                <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                                    错误
                                </div>
                                <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                                    <p>{message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmitCapture={
                            async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target as HTMLFormElement);
                                const username = formData.get("username");
                                const password = formData.get("password");
                                const confirm_password = formData.get("confirm_password");
                                if (isReg) {
                                    if (password !== confirm_password) {
                                        setMessage("两次输入的密码不一致")
                                        setTimeout(() => {
                                            setMessage("")
                                        }, 3000)
                                        return
                                    }
                                    const res = await fetch("/api/user", {
                                        method: "POST",
                                        headers: { "content-type": "application/json" },
                                        body: JSON.stringify({
                                            username,
                                            password
                                        })
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                        signIn("Account", {
                                            username,
                                            password,
                                            redirect: false
                                        }).then(res => {
                                            if (res?.error) {
                                                setMessage(res.error)
                                                setTimeout(() => {
                                                    setMessage("")
                                                }, 3000)
                                            } else {
                                                router.push("/")
                                            }
                                        })
                                    } else {
                                        setMessage(data.message)
                                        setTimeout(() => {
                                            setMessage("")
                                        }, 3000)
                                    }
                                } else {
                                    signIn("Account", {
                                        username,
                                        password,
                                        redirect: false
                                    }).then(res => {
                                        if (res?.error) {
                                            setMessage(res.error)
                                            setTimeout(() => {
                                                setMessage("")
                                            }, 3000)
                                        } else {
                                            router.push("/")
                                        }
                                    })
                                }
                            }
                        }>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    用户名
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    密码
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            {
                                isReg && (
                                    <div>
                                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                                            确认密码
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="confirm_password"
                                                name="confirm_password"
                                                type="password"
                                                required
                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>)
                            }
                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {!isReg ? "登录" : "注册"}
                                </button>
                            </div>

                            <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                        onClick={() => setIsReg(!isReg)}
                                    >
                                        {isReg ? "登录" : "注册"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
