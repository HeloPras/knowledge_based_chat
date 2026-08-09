
import { getChatHistroy } from "@/utils/prisma/chatHistory"
import NewButton from "./SideBar/newbutton"
import Chats from "./SideBar/chats"
// import { useEffect, useState } from "react"


const loadConversationHistory = async () => {

	try {
		const history = await getChatHistroy()
		return history
	} catch (error) {
		throw Error("Hit an error")
	}
}




const SideBar = async () => {

	// const [history, setHistory] = useState()
	const chatHistroy = await loadConversationHistory() || null

	return (
		<>
			<aside className="sticky left-0 h-dvh  w-1/6 bg-[#2C2C2A]">
				<div className="flex flex-col">
					<div id="top" className=" flex ">
						<NewButton></NewButton>
					</div>
					<div className=" h-px w-full bg-white my-3 "></div>
					<div className="flex flex-col ">
						<Chats chats={chatHistroy}></Chats>
					</div>
				</div>
			</aside>
		</>
	)
}

export default SideBar
