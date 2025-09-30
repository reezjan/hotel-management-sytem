import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const passwordResetSchema = z.object({
  securityAnswer1: z.string().min(1, "Security answer is required"),
  securityAnswer2: z.string().min(1, "Security answer is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordResetData = z.infer<typeof passwordResetSchema>;

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      securityAnswer1: "",
      securityAnswer2: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: PasswordResetData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          securityAnswer1: data.securityAnswer1,
          securityAnswer2: data.securityAnswer2,
          newPassword: data.newPassword
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully.",
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Password Reset Failed",
        description: "Please check your security answers and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-password-reset">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="securityAnswer1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security Question 1</FormLabel>
                  <p className="text-sm text-muted-foreground mb-1">What was your first pet's name?</p>
                  <FormControl>
                    <Input {...field} placeholder="Your answer" data-testid="input-security-answer-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="securityAnswer2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security Question 2</FormLabel>
                  <p className="text-sm text-muted-foreground mb-1">What city were you born in?</p>
                  <FormControl>
                    <Input {...field} placeholder="Your answer" data-testid="input-security-answer-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Enter new password" data-testid="input-new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Confirm new password" data-testid="input-confirm-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting}
                data-testid="button-reset-password"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1" 
                onClick={onClose}
                data-testid="button-cancel-reset"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
