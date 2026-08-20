import { Dispatch, SetStateAction } from "react"
const Modal = ({ funk }: { funk: Dispatch<SetStateAction<boolean>> }) => {
	return (
		<>
			<div className=" relative h-screen w-full bg-blue-400"></div>
			<div className="bg-red-500 inset-0  " onClick={() => funk(false)}> this is the background</div>
			<div className="bg-green-500 inline-block absolute " >
				<div>This is the modal</div>
			</div>
		</>
	)
}

export default Modal
