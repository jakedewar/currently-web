"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [organizationType, setOrganizationType] = useState<"create" | "join">("create");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const totalSteps = 2;

  // Generate slug from organization name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOrganizationNameChange = (name: string) => {
    setOrganizationName(name);
    setOrganizationSlug(generateSlug(name));
  };

  const validateStep1 = () => {
    if (!fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (organizationType === "create" && !organizationName.trim()) {
      setError("Organization name is required");
      return false;
    }
    if (organizationType === "join" && !inviteCode.trim()) {
      setError("Invite code is required");
      return false;
    }
    if (organizationType === "create" && organizationSlug.length < 3) {
      setError("Organization URL must be at least 3 characters");
      return false;
    }
    if (organizationType === "create" && !/^[a-z0-9-]+$/.test(organizationSlug)) {
      setError("Organization URL can only contain lowercase letters, numbers, and hyphens");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      // Check if user was created successfully
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      console.log('User created:', authData.user.id);

      // Note: User profile is automatically created by database trigger `on_auth_user_created`

      // 2. Handle organization creation or joining
      try {
        if (organizationType === "create") {
          // Create a unique slug by adding timestamp
          const uniqueSlug = `${organizationSlug}-${Date.now()}`;
          
          // Create new organization
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: organizationName,
              slug: uniqueSlug,
            })
            .select()
            .single();

          if (orgError) {
            console.error('Organization creation error:', orgError);
            throw orgError;
          }

          // Add user as organization owner
          const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
              organization_id: orgData.id,
              user_id: authData.user.id,
              role: 'owner',
            });

          if (memberError) {
            console.error('Member creation error:', memberError);
            throw memberError;
          }
        } else {
          // Join existing organization using invitation code
          const response = await fetch('/api/invitations/accept', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ invitationCode: inviteCode.trim() }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to join organization');
          }

          console.log('Successfully joined organization:', data.organization.name);
        }

        // Success - redirect to success page
        router.push("/auth/sign-up-success");
      } catch (orgError) {
        console.error('Organization setup failed:', orgError);
        // Even if organization setup fails, the user account was created
        // We can redirect to success and handle organization setup later
        router.push("/auth/sign-up-success");
      }

    } catch (error: unknown) {
      console.error('Sign-up error:', error);
      
      // Handle specific Supabase errors
      if (error instanceof Error) {
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please try logging in instead.');
        } else if (error.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else if (error.message.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.');
        } else if (error.message.includes('duplicate key value violates unique constraint')) {
          setError('This organization name or URL is already taken. Please choose a different one.');
        } else if (error.message.includes('new row violates row-level security policy')) {
          setError('Access denied. Please contact support if this issue persists.');
        } else {
          setError(error.message);
        }
      } else {
        setError("An error occurred during sign-up. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="repeat-password">Repeat Password</Label>
        <Input
          id="repeat-password"
          type="password"
          required
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="organizationType">Organization Type</Label>
        <Select value={organizationType} onValueChange={(value: "create" | "join") => setOrganizationType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select organization type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create">Create new organization</SelectItem>
            <SelectItem value="join">Join existing organization</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {organizationType === "create" && (
        <>
          <div className="grid gap-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              type="text"
              placeholder="Acme Corp"
              value={organizationName}
              onChange={(e) => handleOrganizationNameChange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="organizationSlug">Organization URL</Label>
            <Input
              id="organizationSlug"
              type="text"
              placeholder="acme-corp"
              value={organizationSlug}
              onChange={(e) => setOrganizationSlug(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This will be used in your organization URL
            </p>
          </div>
        </>
      )}

      {organizationType === "join" && (
        <div className="grid gap-2">
          <Label htmlFor="inviteCode">Invite Code</Label>
          <Input
            id="inviteCode"
            type="text"
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter the invite code provided by your organization admin
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>
            {currentStep === 1 ? "Step 1: Personal Information" : "Step 2: Organization Setup"}
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={currentStep === 2 ? handleSignUp : (e) => { e.preventDefault(); handleNext(); }}>
            <div className="space-y-6">
              {/* Step Content */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}

              {error && <p className="text-sm text-red-500">{error}</p>}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {currentStep === 1 ? (
                  <Button
                    type="submit"
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                )}
              </div>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
