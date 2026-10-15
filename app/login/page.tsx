import type { Metadata } from "next"
import { SignIn } from "@/components/login/auth"

export const metadata: Metadata = {
	title: "Sign in",
}

const page = () => {
	return (
		<main className="flex min-h-dvh items-center justify-center bg-[#2C2C2A] px-4 py-10 text-stone-200">
			<div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
				<h1 className="text-xl font-semibold tracking-tight text-white">Sign in</h1>
				<p className="mt-2 text-sm leading-relaxed text-stone-400">
					Continue to your knowledge base to upload documents and ask questions about them.
				</p>

				<div className="mt-8">
					<SignIn></SignIn>
				</div>
			</div>
		</main>
	)
}

export default page
