'use client'

import { Plus } from "lucide-react"

const clicked = async () => {
	const response = await fetch("/api/chat/history", {
		method: "POST"
	})
	const body = await response.json()
	console.log(body.message)
}

const NewButton = () => {
	return (
		<div>
			<button className=" cursor-pointer " onClick={() => { clicked() }}><Plus /></button>
		</div>
	)
}

export default NewButton
