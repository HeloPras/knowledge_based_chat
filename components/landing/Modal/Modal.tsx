"use client"

import { pdfTextExtract } from "@/utils/pdf/pdfTextExtract";
import { ChangeEvent, DragEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react"

const formatSize = (bytes: number) => {
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const isPdf = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")

const Modal = ({ onClose, onUploaded, conversationId }: { onClose: () => void, onUploaded?: () => void, conversationId: string }) => {

	const [isDragging, setIsDragging] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [shown, setShown] = useState(false)
	const dialogRef = useRef<HTMLDivElement>(null)

	// Fade in, move focus into the dialog, and hand focus back to the trigger on close
	useEffect(() => {
		const previouslyFocused = document.activeElement as HTMLElement | null
		setShown(true)
		dialogRef.current?.focus()
		return () => previouslyFocused?.focus()
	}, [])


	const selectFile = (picked: File) => {
		if (!isPdf(picked)) {
			setError("That file isn't a PDF. Choose a .pdf file instead.")
			return
		}
		setError(null)
		setFile(picked)
	}

	const fileChanged = (e: ChangeEvent<HTMLInputElement>) => {

		const files = e.currentTarget.files

		if (files && files.length > 0) {
			selectFile(files[0])
		}
		// allow picking the same file again after removing it
		e.currentTarget.value = ""
		setIsDragging(false)

	}

	const fileDropped = (e: DragEvent<HTMLLabelElement>) => {
		e.preventDefault()
		setIsDragging(false)
		const dropped = e.dataTransfer.files
		if (dropped && dropped.length > 0) {
			selectFile(dropped[0])
		}
	}


	const chunkFile = async (): Promise<boolean> => {

		try {
			if (!file) {
				throw Error("No File Provided for chunking")
			}

			const texts = await pdfTextExtract(file)

			if (!texts) throw Error("Can't extract text from pdf")

			const response = await fetch("/api/chat/modal", {
				method: "POST", body: JSON.stringify({ texts, "conversationId": conversationId })
			})

			const { message } = await response.json()

			if (!response.ok) throw Error(message)

			return true

		} catch (error) {
			console.error(error)
			return false
		}


	}

	const uploadFile = async () => {

		if (loading) return
		setLoading(true)
		setError(null)

		try {
			if (!file) {
				throw Error("No file Uploaded")
			}
			//
			// const formdata = new FormData()
			// formdata.set("file", file)
			// formdata.set("conversationId", conversationId)
			//
			// const response = await fetch("/api/chat/uploadFile",
			// 	{ method: "POST", body: formdata })
			// const { error } = await response.json()
			//
			// if (!response.ok) {
			// 	throw Error(error)
			// }

			//after uploading file, start the chunking of the file
			const processed = await chunkFile()

			if (!processed) {
				throw Error("Processing failed")
			}

			onUploaded?.()
			onClose()


		} catch (error) {
			console.error("Faced Issue", error)
			setError("We couldn't process that PDF. Try again, or use a different file.")
		} finally {
			setLoading(false)
		}

	}



	const close = () => {
		onClose()
		setFile(null)
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Escape") {
			close()
			return
		}
		if (e.key !== "Tab") return

		const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
			'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
		)
		if (!focusable || focusable.length === 0) return

		const first = focusable[0]
		const last = focusable[focusable.length - 1]
		const active = document.activeElement

		if (e.shiftKey && (active === first || active === dialogRef.current)) {
			e.preventDefault()
			last.focus()
		} else if (!e.shiftKey && active === last) {
			e.preventDefault()
			first.focus()
		}
	}




	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
			{/* Backdrop */}
			<div
				aria-hidden="true"
				className={`absolute inset-0 bg-black/60 transition-opacity duration-150 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
				onClick={close}
			/>

			{/* Modal */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="attach-title"
				tabIndex={-1}
				className={`relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#2c2c2a] p-6 text-stone-100 shadow-2xl outline-none transition duration-150 motion-reduce:transition-none ${shown ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 id="attach-title" className="text-lg font-semibold tracking-tight">
							Attach a PDF
						</h2>
						<p className="mt-1 text-sm text-stone-400">
							Ask questions about its contents in this chat.
						</p>
					</div>

					<button
						type="button"
						onClick={close}
						aria-label="Close"
						className="-mr-2 -mt-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-stone-400 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
					>
						<X size={18} aria-hidden="true" />
					</button>
				</div>

				<div className="mt-5">
					{file ? (
						<div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
							<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-stone-300">
								<FileText size={18} aria-hidden="true" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm text-stone-100" title={file.name}>{file.name}</p>
								<p className="text-xs text-stone-400">{formatSize(file.size)}</p>
							</div>
							<button
								type="button"
								onClick={() => { setFile(null); setError(null) }}
								disabled={loading}
								aria-label="Remove file"
								title="Remove file"
								className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-stone-400 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-default disabled:opacity-40"
							>
								<X size={16} aria-hidden="true" />
							</button>
						</div>
					) : (
						<label
							onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
							onDragOver={(e) => { e.preventDefault() }}
							onDragLeave={(e) => {
								if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false)
							}}
							onDrop={fileDropped}
							className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors focus-within:ring-2 focus-within:ring-white/30 ${isDragging ? "border-stone-300 bg-white/[0.07]" : "border-white/20 hover:border-white/35 hover:bg-white/[0.03]"}`}
						>
							<Upload size={20} aria-hidden="true" className="text-stone-400" />
							<span className="text-sm text-stone-200">
								{isDragging ? "Drop to attach" : "Drag a PDF here, or click to browse"}
							</span>
							<span className="text-xs text-stone-500">PDF files only</span>
							<input
								type="file"
								accept="application/pdf,.pdf"
								multiple={false}
								onChange={fileChanged}
								className="sr-only"
							/>
						</label>
					)}

					{error && (
						<p role="alert" className="mt-3 text-sm text-red-300">{error}</p>
					)}

					{loading && (
						<p role="status" className="mt-3 text-sm text-stone-400">
							Reading your document. This can take a moment for larger files.
						</p>
					)}
				</div>

				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={close}
						className="h-9 cursor-pointer rounded-lg px-4 text-sm text-stone-300 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
					>
						{loading ? "Close" : "Cancel"}
					</button>

					<button
						type="button"
						disabled={!file || loading}
						aria-busy={loading}
						className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-stone-100 px-4 text-sm font-medium text-[#2c2c2a] outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-default disabled:bg-white/10 disabled:text-stone-500"
						onClick={uploadFile}
					>
						{loading && <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
						{loading ? "Processing" : "Attach"}
					</button>
				</div>
			</div>
		</div >
	);
};

export default Modal;
