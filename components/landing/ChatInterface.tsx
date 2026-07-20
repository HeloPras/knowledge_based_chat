'use client'

import { useEffect, useState } from "react"

const ChatInterface = () => {

	const [message, setMessage] = useState<string>("")

	const submit = async () => {
		try {
			const response = await fetch("")
		} catch (error) {

		}
	}

	useEffect(() => {
		console.log(message)
	}, [message])

	return (
		<>
			<div className=" flex flex-col w-full h-screen bg-[#1f1f1e] justify-end  " >
				<div className="max-w-7xl h-[80%] mx-auto overflow-y-auto " >
					This is the converstaion part
				</div>
				<div className="place-content-center   mx-auto max-w-1/3 bottom-3 inline-block   ">
					<div className="bg-[#2c2c2a] rounded-2xl" >
						<form onSubmit={submit}>
							<input onChange={(e) => { setMessage(e.currentTarget.value) }} type="text" className=" w-80 h-35 ">
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
