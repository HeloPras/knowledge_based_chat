'use client'

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

const base =
	"inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg text-sm outline-none transition-colors duration-150 focus-visible:ring-2 disabled:cursor-default disabled:opacity-60"

const variants = {
	primary: "h-10 w-full bg-stone-100 font-medium text-[#2C2C2A] hover:bg-white focus-visible:ring-white/40",
	ghost: "h-9 px-3 text-stone-400 hover:bg-white/[0.06] hover:text-stone-100 focus-visible:ring-white/30",
}

export function SubmitButton({
	children,
	icon,
	variant = "primary",
}: {
	children: React.ReactNode
	icon?: React.ReactNode
	variant?: keyof typeof variants
}) {
	const { pending } = useFormStatus()

	return (
		<button type="submit" disabled={pending} aria-busy={pending} className={`${base} ${variants[variant]}`}>
			{pending
				? <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
				: icon}
			{children}
		</button>
	)
}
