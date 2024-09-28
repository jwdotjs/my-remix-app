import { ActionFunctionArgs } from "@remix-run/node";
import { Form, json, redirect } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const response = await fetch(
    "https://api.staging.hungryroot.com/api/v2/auth/login/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    }
  );

  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  const value = cookie?.split("=")[1];

  if (response.status !== 202 || !value) {
    return json({ message: "Invalid login" }, { status: 401 });
  }

  return redirect("/quiz/hello", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
}

export default function Login() {
  return (
    <Form method="POST" className="m-4 flex flex-col gap-4 items-center">
      <h1 className="text-xl">Login Form (Staging)</h1>
      <div className="flex flex-col gap-4">
        <label>
          Email:
          <input
            type="text"
            className="border ml-2 p-1 text-sm"
            name="email"
            autoComplete="email"
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            className="border ml-2 p-1 text-sm"
            name="password"
            autoComplete="current-password"
          />
        </label>
      </div>
      <button
        type="submit"
        className="button border rounded-full py-2 px-6 text-white"
        style={{ backgroundColor: "#4b69c4" }}
      >
        Login
      </button>
    </Form>
  );
}
