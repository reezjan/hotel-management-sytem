import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Hotel, LogIn } from "lucide-react";
import { ROLE_DASHBOARDS } from "@/lib/constants";
import { useEffect } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const role = user.role?.name;
      if (role && ROLE_DASHBOARDS[role as keyof typeof ROLE_DASHBOARDS]) {
        setLocation(ROLE_DASHBOARDS[role as keyof typeof ROLE_DASHBOARDS]);
      }
    }
  }, [user, setLocation]);

  const onLogin = async (data: LoginData) => {
    try {
      const result = await loginMutation.mutateAsync({
        username: data.username,
        password: data.password
      });
      
      // Redirect to appropriate dashboard based on user's role
      if (result && result.role?.name) {
        const dashboardPath = ROLE_DASHBOARDS[result.role.name as keyof typeof ROLE_DASHBOARDS];
        setLocation(dashboardPath || '/');
      } else {
        setLocation('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Hotel className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-bold text-foreground">Hotel Management</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your username" 
                          className="h-11"
                          autoComplete="username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Enter your password" 
                          className="h-11"
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 mt-6" 
                  disabled={loginMutation.isPending}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
            
            {loginMutation.error && (
              <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                Invalid username or password. Please try again.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
