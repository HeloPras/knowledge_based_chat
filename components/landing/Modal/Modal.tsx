"use client"

import { pdfTextExtract } from "@/utils/pdf/pdfTextExtract";
import { Form } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { extractText } from "unpdf"


const Modal = ({ onClose, conversationId }: { onClose: () => void, conversationId: string }) => {

	const [isDragging, setIsDragging] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const [loading, setLoading] = useState<boolean>(false)


	const fileChanged = (e: ChangeEvent<HTMLInputElement>) => {


		const file = e.currentTarget.files

		if (file && file.length > 0) {
			setFile(file[0])
		}
		setIsDragging(false)

	}


	const chunkFile = async () => {

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


			console.log(message)







		} catch (error) {
			console.error(error)
		}


	}

	const uploadFile = async () => {

		setLoading(true)

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
			chunkFile()

			setLoading(false)
			onClose()


		} catch (error) {
			console.error("Faced Issue", error)
			setLoading(false)
		}

	}



	const close = () => {
		onClose()
		setFile(null)
	}




	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={close}
			/>

			{/* Modal */}
			<div
				className="relative z-10 w-full max-w-lg rounded-2xl bg-[#2c2c2a] p-6 text-white shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">
						Attach PDF
					</h2>

					<button
						onClick={close}
						className="rounded-lg px-3 py-1 text-xl text-gray-400 hover:bg-white/10 hover:text-white"
					>
						×
					</button>
				</div>

				<div className="mt-6">
					<div className={`border border-dashed ${isDragging ? "border-blue-300" : "border-white"} `}>
						<input type="file" multiple={false} onDragEnter={() => setIsDragging(true)} onDragExit={() => setIsDragging(false)}

							onChange={(e) => {
								fileChanged(e)
							}}

						/>
					</div>
				</div>

				<div className="mt-6 flex justify-end gap-3">
					<button
						onClick={close}
						className="rounded-lg px-4 py-2 text-gray-300 hover:bg-white/10"
					>
						Cancel
					</button>

					<button
						disabled={loading}
						className="rounded-lg bg-white px-4 py-2 text-black hover:bg-gray-200"
						onClick={uploadFile}
					>
						{loading ? ". . ." : "Continue"}
					</button>
				</div>
			</div>
		</div >
	);
};

export default Modal;
