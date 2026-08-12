

import ChatInterface from "@/components/landing/ChatInterface";
import SideBar from "@/components/landing/SideBar";
import { SignOut } from "@/components/login/auth";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";
import { notFound, redirect } from "next/navigation";

const Page = async ({ params }: { params: Promise<{ param: string }> }) => {

	const session = await auth()

	if (!session || !session.user) {
		return redirect("/login")
	}

	const { param } = await params

	const exists = await prisma.conversation.findFirst({
		where: {
			userId: session.user.id,
			id: param[0]
		}
	})

	if (!exists) {
		return notFound()
	}


	return (
		<>
			<div className="bg-[#1E1E1E]">
				<div className="flex ">
					<SideBar></SideBar>
					<div>
						<SignOut></SignOut>
						<ChatInterface conversationId={param} ></ChatInterface>
					</div>
				</div>
			</div>
		</>
	)
}

export default Page
