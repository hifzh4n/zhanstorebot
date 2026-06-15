"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Input, Label} from "@/components/ui/field";
import {useAuth} from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const {login, user, isAdmin, loading, error} = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {register, handleSubmit, formState: {errors}} = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace("/admin/dashboard");
    }
    if (!loading && user && !isAdmin && error) {
      toast.error("This account does not have admin access.");
    }
  }, [error, isAdmin, loading, router, user]);

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success("Logged in successfully.");
    } catch {
      toast.error("Wrong email or password.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Zhan Store Admin</h1>
          <p className="text-sm text-[var(--muted)]">Login with your admin account.</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <Button className="w-full" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
