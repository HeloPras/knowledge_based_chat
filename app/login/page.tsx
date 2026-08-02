import { SignIn, SignOut } from "@/components/login/auth"

const page = () => {
	return (
		<div>
			This is login page
			<SignIn></SignIn>
			<SignOut />

		</div>
	)
}

export default page
