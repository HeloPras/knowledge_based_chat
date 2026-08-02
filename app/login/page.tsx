import { SignIn, SignOut } from "@/components/login/auth"
import { auth } from "@/lib/auth/auth"

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
