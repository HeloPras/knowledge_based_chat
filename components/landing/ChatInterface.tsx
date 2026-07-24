'use client'

import { useState } from "react"

import { useChat } from "@ai-sdk/react"

const ChatInterface = () => {

	const [input, setInput] = useState<string>('')
	const { messages, sendMessage } = useChat()

	const submit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			sendMessage({ text: input })
			setInput("")

		} catch (error) {
			console.log(error)
		}
	}


	return (
		<>
			<div className=" flex flex-col w-full h-screen bg-[#1e1e1e] justify-end  " >
				<div className="max-w-7xl h-[80%] mx-auto overflow-y-auto " >
					{messages.map(message => (
						<div key={message.id}>
							<div className="text-2xl text-[#d4d4d4]">{message.role == 'user' ? 'User:' : 'AI:'}</div>
							{message.parts.map((part, i) => {
								switch (part.type) {
									case "text":
										return (<div className="text-[#f5f5dc] text-xl" key={message.id}>
											{part.text}
										</div>)
								}
							})}
						</div>
					))}
				</div>
				<div className="place-content-center   mx-auto max-w-1/3 bottom-3 inline-block   ">
					<div className="bg-[#2c2c2a] rounded-2xl" >
						<form onSubmit={submit}>
							<input value={input} onChange={(e) => { setInput(e.currentTarget.value) }} type="text" className=" w-80 h-35 ">
							</input>
						</form>
					</div>
					<div className="h-10"></div>
				</div>
			</div>
		</>
	)
}

export default ChatInterface
