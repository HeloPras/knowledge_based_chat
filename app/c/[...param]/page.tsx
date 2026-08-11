

import ChatInterface from "@/components/landing/ChatInterface";
import SideBar from "@/components/landing/SideBar";
import { SignOut } from "@/components/login/auth";

const Page = async ({ params }: { params: Promise<{ param: string }> }) => {

	const { param } = await params


	return (
		<>
			<div className="bg-[#1E1E1E]">
				<div className="flex ">
					<SideBar></SideBar>
					<div>
						<SignOut></SignOut>
						<ChatInterface chatId={param} conversationId={param} ></ChatInterface>
					</div>
				</div>
			</div>
		</>
	)
}

export default Page
