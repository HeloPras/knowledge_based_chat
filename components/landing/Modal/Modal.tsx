"use client"

import { ChangeEvent, useEffect, useState } from "react";



const Modal = ({ onClose }: { onClose: () => void }) => {

	const [isDragging, setIsDragging] = useState(false)
	const [file, setFile] = useState<FileList | null>()

	// const dropped = (e: React.DragEvent<HTMLInputElement>) => {
	const dropped = (e: ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLInputElement>) => {

		setFile(e.currentTarget.files)
		setIsDragging(false)
	}

	useEffect(() => { console.log(file) }, [file])

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
						<input type="file" multiple={false} onDragEnter={() => setIsDragging(true)} onDragExit={() => setIsDragging(false)} onDrop={(e) => dropped(e)} />
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
						className="rounded-lg bg-white px-4 py-2 text-black hover:bg-gray-200"
					>
						Continue
					</button>
				</div>
			</div>
		</div >
	);
};

export default Modal;
