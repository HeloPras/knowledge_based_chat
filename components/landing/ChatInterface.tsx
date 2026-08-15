'use client'

import { useEffect, useState } from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

const ChatInterface = ({ conversationId }: { conversationId?: string }) => {

	const fetchData = async () => {

		console.log("fetchdata started")
		const data = await fetch(`/api/chat/${conversationId}`)
		const { messages } = await data.json()
		console.log("FetchData ended")
		return messages
	}

	const [chatMessages, setChatMessages] = useState<messageType[]>()

	useEffect(() => {
		try {

			const loadData = async () => {
				setChatMessages(await fetchData())
			}

			loadData()

		}
		catch (error) {
			console.log("Server Error", error)
		}

	}, [])

	useEffect(() => {
		console.log(chatMessages)
	}, [chatMessages])

	const [input, setInput] = useState<string>('')

	const { messages, sendMessage } = useChat(
		{
			transport: new DefaultChatTransport({
				api: `/api/chat/${conversationId}`
			})
		})


	const submit = async (e: React.FormEvent<HTMLFormElement>) => {

		e.preventDefault()
		try {
			sendMessage({ text: input })
			setInput("")

		} catch (error) {
			console.log(error)

		}
	}



	if (!conversationId) {
		return (
			<>
				New Chat
			</>)
	}


	return (
		<>
			<div className="">
				<div className=" flex pl-20 flex-col max-w-7xl  bg-[#1e1e1e] justify-end  " >

					{
						chatMessages ?

							chatMessages.map((message) => {

								return (
									<div key={message.id}>
										<div className={`text-2xl text-[#d4d4d4]`}>{message.role == 'User' ? 'User:' : 'AI:'}</div>
										<div className="text-[#f5f5dc] text-xl" key={message.id}>
											{message.content}
										</div>

									</div>

								)

							}) : <></>

					}

					{messages.map(message => (
						<div key={message.id}>
							<div className={`text-2xl text-[#d4d4d4] ${message.role == "user" ? "" : ""}`}>{message.role == 'user' ? 'User:' : 'AI:'}</div>
							{
								message.parts.map((part) => {
									switch (part.type) {
										case "text":
											return (<div className="text-[#f5f5dc] text-xl" key={message.id}>
												{part.text}
											</div>)
									}
								})
							}
						</div>
					))}

				</div>
				<div className=" sticky left-[40%] place-content-center   mx-auto max-w-2/3 bottom-3 inline-block   ">
					<div className="bg-[#2c2c2a] rounded-2xl" >
						<form onSubmit={submit}>
							<input value={input} onChange={(e) => { setInput(e.currentTarget.value) }} type="text" className=" w-150 h-25 ">
							</input>
						</form>
					</div>
				</div>
			</div>
		</>
	)
}

export default ChatInterface
