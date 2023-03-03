/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'




function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
export default function Home() {

  const session = useSession()

  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [notice, setNotice] = useState<string>("请先设置您的openai密钥，否则无法使用本站服务。")

  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
  const [hasKey, setHasKey] = useState<boolean>(false)

  const [loadingResponse, setLoadingResponse] = useState<boolean>(false)

  const [conversations, setConversations] = useState<{ id: number, name: string, current: boolean, messages: { role: string, content: string }[] }[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const div = document.getElementById("messageContainer")
    if (div) {
      div.scrollTop = div.scrollHeight
    }
  }, [messages])

  useEffect(() => {

    if (session.status === "unauthenticated") {
      router.push("/user")
    }

    if (session.status === "authenticated") {
      fetch("/api/user")
        .then(res => res.json())
        .then(res => {
          console.log(res);
          setHasKey(res.key)
        })
        .catch(err => {

          console.log(err);
        })
    }
    if (hasKey && session.status === "authenticated") {
      fetch("/api/conversations")
        .then(res => res.json())
        .then(res => {
          setConversations(res.conversations)
        })
    }
  }, [session, hasKey])

  async function handlerSendMessage(_message: string) {
    if(!_message) return
    if(!hasKey) return
    setMessages([...messages, { role: "user", content: _message }])
    setLoadingResponse(true)
    const res = await fetch("/api/message", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, { role: "user", content: _message }],
        conversationId: conversations.find(cov => cov.current)?.id
      })
    }).then(res => res.json())
      .catch(err => {
        console.log(err);
      })

    const { message, conversationId } = res

    setLoadingResponse(false)
    setMessages(message)
    if (conversations.find(cov => cov.id === conversationId)) {
      setConversations(conversations.map(cov => {
        if (cov.id === conversationId) {
          return {
            ...cov,
            message: message
          }
        }
        return cov
      }))
    } else {
      fetch("/api/conversations")
        .then(res => res.json())
        .then(res => {
          setConversations(res.conversations.map((cov: any) => {
            if (cov.id === conversationId) {
              return {
                ...cov,
                current: true
              }
            } else {
              return cov
            }
          }))
        })
    }


  }


  if (session.status === 'loading') {
    return (<div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
      <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
      <span className="sr-only">Loading...</span>
    </div>)
  }


  return (
    <div className='max-h-screen'>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 text-white">
                  <img
                    className="h-8 w-auto text-white"
                    src="/openai.svg"
                    alt="Workflow"
                  />
                  <h1>chatGPT</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1 max-h-[90%]">
                  {/* 建立一个新建对话的按钮 */}
                  <div
                    className={classNames(
                      'hover:bg-indigo-600 hover:bg-opacity-75 text-white',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md justify-between'
                    )}
                  >
                    <div className='w-3/4'
                      onClick={() => {
                        setConversations(conversations.map(c => {
                          c.current = false
                          return c
                        }))
                        setMessages([])
                      }}
                    >
                      <span>新对话</span>
                    </div>
                    <div className='hover:scale-150' onClick={(e) => {
                      e.preventDefault();
                      setConversations(conversations.filter(c => c.name !== 'New Conversation'))
                      setSidebarOpen(false)
                    }}>
                      <PlusIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>

                  {conversations.map((item) => (
                    <div
                      key={item.id}
                      className={classNames(
                        item.current ? 'bg-indigo-800 text-white' : 'text-white hover:bg-indigo-600 hover:bg-opacity-75',
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md justify-between'
                      )}

                    >
                      <div className='w-3/4'
                        onClick={() => {
                          const conv = conversations.find(c => c.id === item.id)
                          if (conv === undefined) return
                          setMessages(conv.messages)
                          setConversations(conversations.map(c => {
                            if (c.id === item.id) {
                              c.current = true
                            } else {
                              c.current = false
                            }
                            return c
                          }))
                          setSidebarOpen(false)
                        }}
                      >
                        <span>{item.name}</span>
                      </div>
                      <div className='hover:scale-150' onClick={(e) => {
                        e.preventDefault();
                        setConversations(conversations.filter(c => c.id !== item.id))
                        setMessages([])
                        fetch("/api/conversations", {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            id: item.id
                          }),
                        })
                        setSidebarOpen(false)
                      }}>
                        <TrashIcon className='w-4 h-4' />
                      </div>
                    </div>
                  ))}
                </nav>
                <div>
                  {/* 退出登录按钮 */}
                  <button
                    type="button"
                    className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-indigo-600 hover:bg-opacity-75"
                    onClick={() => {
                      signOut({
                        redirect: false
                      })
                    }}
                  >
                    <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3 text-indigo-200" aria-hidden="true" />
                    <span>退出登录</span>
                  </button>

                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="h-8 w-auto"
                src="/openai.svg"
                alt="Workflow"
              />
              <h1 className='text-white ml-2 font-bold'>chatGPT</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1 max-h-[90%]">
              {/* 建立一个新建对话的按钮 */}
              <div
                className={classNames(
                  'hover:bg-indigo-600 hover:bg-opacity-75 text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md justify-between'
                )}
              >
                <div className='w-3/4'
                  onClick={() => {
                    setConversations(conversations.map(c => {
                      c.current = false
                      return c
                    }))
                    setMessages([])
                  }}
                >
                  <span>新对话</span>
                </div>
                <div className='hover:scale-150' onClick={(e) => {
                  e.preventDefault();
                  setConversations(conversations.filter(c => c.name !== 'New Conversation'))
                }}>
                  <PlusIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>

              {conversations.map((item) => (
                <div
                  key={item.id}
                  className={classNames(
                    item.current ? 'bg-indigo-800 text-white' : 'text-white hover:bg-indigo-600 hover:bg-opacity-75',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md justify-between'
                  )}

                >
                  <div className='w-3/4'
                    onClick={() => {
                      const conv = conversations.find(c => c.id === item.id)
                      if (conv === undefined) return
                      setMessages(conv.messages)
                      setConversations(conversations.map(c => {
                        if (c.id === item.id) {
                          c.current = true
                        } else {
                          c.current = false
                        }
                        return c
                      }))
                    }}
                  >
                    <span>{item.name}</span>
                  </div>
                  <div className='hover:scale-150' onClick={(e) => {
                    e.preventDefault();
                    setConversations(conversations.filter(c => c.id !== item.id))
                    setMessages([])
                    fetch("/api/conversations", {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        id: item.id
                      }),
                    })
                  }}>
                    <TrashIcon className='w-4 h-4' />
                  </div>
                </div>
              ))}
            </nav>
            <div>
              {/* 退出登录按钮 */}
              <button
                type="button"
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-indigo-600 hover:bg-opacity-75"
                onClick={() => {
                  signOut({
                    redirect: false
                  })
                }}
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3 text-indigo-200" aria-hidden="true" />
                <span>退出登录</span>
              </button>

            </div>
          </div>
        </div>
      </div>
      <div className="md:pl-64 flex flex-col h-screen">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex flex-col h-3/4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full h-full">
            {/* Replace with your content */}
            <div className="py-4 h-screen w-full">

              <div id='messageContainer' className="w-full h-3/5 md:h-4/5 border-4 border-dashed border-gray-200 rounded-lg  overflow-auto " >
                {
                  messages.map((msg, idx) => {
                    return (
                      <div key={idx} className="flex py-3 px-4 justify-start" >
                        <div className='w-8 h-8 rounded-full font-bold text-lg bg-green-600 flex items-center justify-center mr-1'>
                          <div className='w-6 h-6 flex justify-center items-center '>
                            {msg.role === "user" ?
                              (<span>{session.data?.user?.name?.slice(0, 1)}</span>)
                              :
                              (<img
                                className="h-5 w-5"
                                src="/openai.svg"
                                alt="Workflow"
                              />)
                            }
                          </div>
                        </div>
                        <div className={`py-2 px-2 text-white ${msg.role === "user" ? "bg-green-900" : "bg-green-500"} mb-1 rounded-lg max-w-[85%]`}>
                          <span>{msg.content}</span>
                        </div>
                      </div>
                    )
                  })
                }
                {
                  loadingResponse && (<div className="flex items-center justify-center">
                    <div
                      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status">
                      <span
                        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                      >Loading...</span
                      >
                    </div>
                  </div>)
                }
                {
                  messages.length === 0 && hasKey && (
                    <div className='py-2 px-4 bg-slate-200 mb-1 rounded-lg '>
                      <p className='text-center'>你可以提出你的问题……</p>
                    </div>
                  )
                }
                {
                  !hasKey && (
                    <div className='py-2 px-4 bg-slate-200 mb-1 rounded-lg '>
                      <p className='text-center'>{notice}</p>
                      <form onSubmitCapture={e => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        const key = formData.get("key");
                        if (!key) {
                          setNotice('请输入 API Key')
                        } else {

                          const reg = new RegExp(/^sk\-[a-zA-Z0-9]{48}$/, "ig")
                          if (!reg.test(key as string)) {
                            setNotice('API Key 格式不正确')
                            return
                          }

                          setNotice('正在保存 API Key')
                          fetch("/api/user", {
                            method: "PUT",
                            body: JSON.stringify({
                              key
                            }),
                            headers: {
                              "Content-Type": "application/json"
                            }
                          })
                            .then(res => res.json())
                            .then(res => {
                              if (res.success) {
                                setNotice('保存成功')
                                setHasKey(true)
                              } else {
                                setNotice(res.message)
                              }
                            })
                        }
                      }}>
                        <input
                          type="text"
                          name="key"
                          id="key"
                          className='w-full border-2 border-gray-200 rounded-lg p-2'
                          placeholder='OpenAI API Key'
                        />
                        <button
                          type="submit"
                          className='w-full bg-blue-500 text-white rounded-lg p-2 mt-2'
                        >
                          提交
                        </button>
                      </form>
                    </div>
                  )
                }
              </div>
              <div className="flex mt-5 flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                <form onSubmitCapture={e => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const prompt = formData.get("prompt");
                  if (!prompt) {
                    return
                  }



                  handlerSendMessage(prompt as string)
                  if (inputRef.current) {
                    inputRef.current.value = ''
                  }
                }}>
                  <input
                    ref={inputRef}
                    type="text"
                    name="prompt"
                    id="prompt"
                    autoComplete='off'
                    className="h-[24px] m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:pl-0"
                    placeholder="开始输入……"
                  />
                  <button className='absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent'>
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              </div>
            </div>
            {/* /End replace */}

          </div>
        </main>
      </div>
    </div>
  )
}
