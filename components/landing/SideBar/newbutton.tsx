'use client'

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"

const clicked = async () => {
	const response = await fetch("/api/chat/history", {
		method: "POST"
	})
	const body = await response.json()
	console.log(body.message)
}

const NewButton = () => {
	const [pending, setPending] = useState(false)

	const handleClick = async () => {
		if (pending) return
		setPending(true)
		try {
			await clicked()
		} finally {
			setPending(false)
		}
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={pending}
			aria-busy={pending}
			className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-stone-100 outline-none transition-[background-color,transform] duration-150 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.98] disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
		>
			{pending
				? <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
				: <Plus size={16} aria-hidden="true" />}
			New chat
		</button>
	)
}

export default NewButton
