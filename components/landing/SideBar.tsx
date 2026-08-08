'use client'

import { Plus } from "lucide-react"

const clicked = async () => {
	const something = await fetch("/api/chat/history")
}


const SideBar = () => {

	// const chatHistroy = await fetch()


	return (
		<>
			<aside className="sticky left-0 h-dvh  w-1/6 bg-[#2C2C2A]">
				<div className="flex flex-col">
					<div id="top" className=" flex ">
						<button className=" cursor-pointer " onClick={() => { clicked() }}><Plus /></button>
					</div>
					<div className=" h-[1px] w-full bg-white my-3 "></div>
					<div className="flex flex-col ">
						this is the side bar
					</div>
				</div>
			</aside>
		</>
	)
}

export default SideBar
