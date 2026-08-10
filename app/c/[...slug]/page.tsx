
import ChatInterface from "@/components/landing/ChatInterface";
import SideBar from "@/components/landing/SideBar";
import { SignOut } from "@/components/login/auth";

const page = async ({ slug }: { slug: Promise<{ param: string }> }) => {

	const { param } = await slug

	return (
		<>
			<div className="bg-[#1E1E1E]">
				<div className="flex ">
					<SideBar></SideBar>
					<div>
						<SignOut></SignOut>
						<ChatInterface></ChatInterface>
					</div>
				</div>
			</div>
		</>
	)
}

export default page
