import createChallenge from "../../actions/challenge";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
	return (
		<div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-sm">
				<h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
					Register
				</h2>
			</div>

			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<RegisterForm createChallenge={createChallenge} />

				<p className="mt-10 text-center text-sm text-gray-500">
					<a
						href="/login"
						className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
					>
						Login
					</a>
				</p>
			</div>
		</div>
	);
}
