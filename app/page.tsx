import ChatInterface from "@/components/landing/ChatInterface";
import { SignOut } from "@/components/login/auth";

export default function Home() {


	return (
		<>
			<div className="bg-[#1E1E1E]">
				<SignOut></SignOut>
				<ChatInterface></ChatInterface>
			</div>
		</>
	);
}






