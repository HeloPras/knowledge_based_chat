'use client'

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ArrowUp, FileText, Paperclip, Square } from "lucide-react"
import Modal from "./Modal/Modal"

const scrollbar = "[scrollbar-color:rgba(255,255,255,0.15)_transparent] [scrollbar-width:thin]"

const textOf = (parts: { type: string; text?: string }[]) =>
	parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("")

const MessageRow = ({ role, text }: { role: string; text: React.ReactNode }) => {
	if (!text) return null

	if (role.toLowerCase() === "user") {
		return (
			<div className="flex justify-end">
				<div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl bg-[#2c2c2a] px-4 py-2.5 text-[15px] leading-7 text-stone-100">
					<span className="sr-only">You: </span>
					{text}
				</div>
			</div>
		)
	}

	return (
		<div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-stone-200">
			<span className="sr-only">Assistant: </span>
			{text}
		</div>
	)
}

const ThinkingDots = () => (
	<div role="status" className="flex items-center gap-1.5 py-2">
		<span className="sr-only">Assistant is thinking</span>
		{[0, 1, 2].map((i) => (
			<span
				key={i}
				aria-hidden="true"
				className="size-1.5 animate-pulse rounded-full bg-stone-500 motion-reduce:animate-none"
				style={{ animationDelay: `${i * 150}ms` }}
			/>
		))}
	</div>
)

const HistorySkeleton = () => (
	<div role="status" className="flex flex-col gap-6">
		<span className="sr-only">Loading conversation</span>
		<div className="flex justify-end">
			<div className="h-10 w-1/2 animate-pulse rounded-2xl bg-white/[0.06] motion-reduce:animate-none" />
		</div>
		<div className="flex flex-col gap-2.5">
			<div className="h-3.5 w-11/12 animate-pulse rounded bg-white/[0.06] motion-reduce:animate-none" />
			<div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.06] motion-reduce:animate-none" />
			<div className="h-3.5 w-2/3 animate-pulse rounded bg-white/[0.06] motion-reduce:animate-none" />
		</div>
	</div>
)

const ChatInterface = ({ conversationId }: { conversationId?: string }) => {

	// function to fetch past history message
	const fetchData = async () => {
		const data = await fetch(`/api/chat/${conversationId}`)
		const { messages } = await data.json()
		return messages
	}

	// function for finding if user has already uploaded file for this current chat
	const fetchAttachment = async () => {

		if (!conversationId) {

			setAttachmentAvailable(false)
			return
		}

		const data = await fetch(`/api/chat/attachment`, { method: 'POST', body: JSON.stringify({ conversationId: conversationId }) })

		const body = await data.json()


		if (body.exists) {
			setAttachmentAvailable(true)
		}

	}

	const [chatMessages, setChatMessages] = useState<messageType[]>()
	const [historyError, setHistoryError] = useState<boolean>(false)
	const [attachmentAvailable, setAttachmentAvailable] = useState<boolean>(false)

	// Fetching Initial Data from database
	useEffect(() => {

		const loadData = async () => {
			try {
				setChatMessages((await fetchData()) ?? [])
				fetchAttachment().catch((error) => console.log("Server Error", error))
			}

			catch (error) {
				console.log("Server Error", error)
				setHistoryError(true)
			}
		}

		loadData()
	}, [])


	const [input, setInput] = useState<string>('')

	const { messages, sendMessage, status, error, stop } = useChat(
		{
			transport: new DefaultChatTransport({
				api: `/api/chat/${conversationId}`
			})
		})


	const [initialReq, setInitialReq] = useState(true)

	const [modalOpen, setModalOpen] = useState(false)

	const scrollRef = useRef<HTMLDivElement>(null)
	const stickToBottom = useRef(true)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const busy = status === "submitted" || status === "streaming"
	const lastMessage = messages[messages.length - 1]
	const awaitingFirstToken =
		status === "submitted" ||
		(status === "streaming" && lastMessage?.role === "assistant" && !textOf(lastMessage.parts))

	const historyLoading = chatMessages === undefined && !historyError
	const isEmpty = !historyLoading && !historyError && (chatMessages?.length ?? 0) === 0 && messages.length === 0

	// Keep the newest content in view, but only while the user is already near the bottom
	const handleScroll = () => {
		const el = scrollRef.current
		if (!el) return
		stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
	}

	useEffect(() => {
		const el = scrollRef.current
		if (el && stickToBottom.current) el.scrollTo({ top: el.scrollHeight })
	}, [messages, chatMessages, status])

	// Auto-grow the composer up to a sensible height
	useEffect(() => {
		const el = textareaRef.current
		if (!el) return
		el.style.height = "auto"
		el.style.height = `${Math.min(el.scrollHeight, 192)}px`
	}, [input])


	const submit = async (e: React.FormEvent<HTMLFormElement>) => {

		e.preventDefault()
		if (!input.trim() || busy) return
		try {
			stickToBottom.current = true
			sendMessage({
				text: `${input}`
			}, { body: { initialReq: initialReq } })
			setInput("")
			setInitialReq(false)
			textareaRef.current?.focus()

		} catch (error) {
			console.log(error)

		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault()
			e.currentTarget.form?.requestSubmit()
		}
	}



	if (!conversationId) {
		return (
			<div className="flex h-dvh min-w-0 flex-1 items-center justify-center bg-[#1e1e1e] px-6 text-center">
				<div>
					<h2 className="text-lg font-medium text-stone-100">New chat</h2>
					<p className="mt-1.5 max-w-xs text-sm text-stone-400">
						Choose a conversation from the sidebar to pick up where you left off.
					</p>
				</div>
			</div>
		)
	}


	return (
		<div className="flex h-dvh min-w-0 flex-1 flex-col bg-[#1e1e1e]">

			<div ref={scrollRef} onScroll={handleScroll} className={`min-h-0 flex-1 overflow-y-auto ${scrollbar}`}>
				<div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">

					{historyLoading && <HistorySkeleton />}

					{historyError && (
						<p role="alert" className="text-sm text-red-300">
							Couldn&apos;t load earlier messages. Refresh the page to try again.
						</p>
					)}

					{isEmpty && (
						<div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
							<h2 className="text-lg font-medium text-stone-100">What would you like to know?</h2>
							<p className="mt-1.5 max-w-sm text-sm text-stone-400">
								{attachmentAvailable
									? "Ask anything about the document attached to this chat."
									: "Attach a document to ask questions about its contents."}
							</p>
						</div>
					)}

					{chatMessages?.map((message) => (
						<MessageRow key={message.id} role={String(message.role)} text={message.content} />
					))}

					{messages.map((message) => (
						<MessageRow key={message.id} role={message.role} text={textOf(message.parts)} />
					))}

					{awaitingFirstToken && <ThinkingDots />}

				</div>
			</div>

			{modalOpen && (
				<Modal
					conversationId={conversationId}
					onClose={() => { setModalOpen(false) }}
					onUploaded={() => { fetchAttachment().catch((error) => console.log("Server Error", error)) }}
				></Modal>
			)}

			<div className="px-4 pb-4 pt-2 sm:px-6">
				<div className="mx-auto w-full max-w-3xl">

					{error && (
						<p role="alert" className="mb-2 px-1 text-sm text-red-300">
							Something went wrong. Try sending your message again.
						</p>
					)}

					<form
						onSubmit={submit}
						className="rounded-2xl border border-white/10 bg-[#2c2c2a] transition-colors focus-within:border-white/25"
					>
						<label htmlFor="chat-input" className="sr-only">Message</label>
						<textarea
							id="chat-input"
							ref={textareaRef}
							rows={1}
							value={input}
							onChange={(e) => { setInput(e.currentTarget.value) }}
							onKeyDown={handleKeyDown}
							placeholder="Ask about your documents"
							className={`block max-h-48 w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[15px] leading-6 text-stone-100 outline-none placeholder:text-stone-500 ${scrollbar}`}
						/>

						<div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
							{!attachmentAvailable ? (
								<button
									type="button"
									onClick={() => { setModalOpen(true) }}
									aria-label="Attach a document"
									title="Attach a document"
									className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-stone-400 outline-none transition-colors hover:bg-white/[0.06] hover:text-stone-100 focus-visible:ring-2 focus-visible:ring-white/30"
								>
									<Paperclip size={18} aria-hidden="true" />
								</button>
							) : (
								<span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1 text-xs text-stone-300">
									<FileText size={14} aria-hidden="true" />
									Document attached
								</span>
							)}

							{busy ? (
								<button
									type="button"
									onClick={() => { stop() }}
									aria-label="Stop generating"
									title="Stop generating"
									className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-stone-100 text-[#1e1e1e] outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-white/40"
								>
									<Square size={12} fill="currentColor" aria-hidden="true" />
								</button>
							) : (
								<button
									type="submit"
									disabled={!input.trim()}
									aria-label="Send message"
									title="Send message"
									className="flex size-8 cursor-pointer items-center justify-center rounded-lg bg-stone-100 text-[#1e1e1e] outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-default disabled:bg-white/10 disabled:text-stone-500"
								>
									<ArrowUp size={16} aria-hidden="true" />
								</button>
							)}
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default ChatInterface
