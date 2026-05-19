import { SignIn } from "@clerk/nextjs";

export default function Login() {
  return (
    <main className="h-full flex items-center justify-center px-4">
      <SignIn />
    </main>
  );
}
