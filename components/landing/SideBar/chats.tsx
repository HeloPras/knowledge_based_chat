
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
								<div key={chat.id}>
									{chat.title}
								</div>
							)
						})
						: <p>No conversations Yet</p>
				}
			</div>
		</>
	)
}

export default Chats

