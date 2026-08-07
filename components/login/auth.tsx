import { signIn, signOut } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export function SignIn() {
	return (
		<form
			action={async () => {
				"use server"
				await signIn("github")
				redirect("/")
			}}
		>
			<button type="submit">Signin with GitHub</button>
		</form>
	)
}


export function SignOut() {
	return (
		<form
			action={async () => {
				"use server"
				await signOut()
			}}
		>
			<button type="submit">Sign Out</button>
		</form>
	)
}
