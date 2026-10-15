import ChatLink from "./chatlink"

export interface chat {
	id: string
	userId: string
	title: string
	createdAt: Date
	updatedAt: Date
}

const Chats = ({ chats }: { chats: chat[] | null }) => {
	if (!chats || chats.length === 0) {
		return (
			<div className="px-3 py-10 text-center">
				<p className="text-sm text-stone-300">No conversations yet</p>
				<p className="mt-1 text-xs text-stone-500">Start a new chat and it will show up here.</p>
			</div>
		)
	}

	return (
		<ul className="flex flex-col gap-0.5">
			{chats.map((chat) => (
				<li key={chat.id}>
					<ChatLink href={`/c/${chat.id}`} title={chat.title || "Untitled chat"} />
				</li>
			))}
		</ul>
	)
}

export default Chats
