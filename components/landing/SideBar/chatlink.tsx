'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

const ChatLink = ({ href, title }: { href: string; title: string }) => {
	const pathname = usePathname()
	const active = pathname === href

	return (
		<Link
			href={href}
			title={title}
			aria-current={active ? "page" : undefined}
			className={`block rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/30 ${active
				? "bg-white/10 text-white"
				: "text-stone-400 hover:bg-white/[0.06] hover:text-stone-100"
				}`}
		>
			<span className="block truncate">{title}</span>
		</Link>
	)
}

export default ChatLink
