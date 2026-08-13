'use client'

import { useState } from "react"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

const ChatInterface = ({ conversationId }: { conversationId?: string }) => {

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
			<div className=" flex flex-col w-full h-dvh bg-[#1e1e1e] justify-end  " >
				<div className="max-w-7xl h-[80%] mx-auto overflow-y-auto " >
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
				<div className=" place-content-center   mx-auto max-w-2/3 bottom-3 inline-block   ">
					<div className="bg-[#2c2c2a] rounded-2xl" >
						<form onSubmit={submit}>
							<input value={input} onChange={(e) => { setInput(e.currentTarget.value) }} type="text" className=" w-150 h-35 ">
							</input>
						</form>
					</div>
					<div className="h-10"></div>
				</div>
			</div >
		</>
	)
}

export default ChatInterface
