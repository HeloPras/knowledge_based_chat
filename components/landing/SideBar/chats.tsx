import Link from "next/link"

interface chat {
	id: number
	userId: string
	title: string
	createdAt: Date
	updatedAt: Date
}

const Chats = ({ chats }: { chats: chat[] | null }) => {
	return (
		<>
			<div className="flex flex-col gap-1">


				{
					chats ?
						chats.map((chat) => {
							return (
								<div key={chat.id} className="cursor-pointer hover:bg-[#393936]">
									<Link href={`/c/${chat.id}`}>
										{chat.title}
									</Link>
								</div>
							)
						})
						: <p>No conversations Yet</p>
				}
			</div >
		</>
	)
}

export default Chats

