"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { CheckCircle, XCircle, Mail, User, Calendar, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface InvitationDetails {
  email: string;
  project: {
    _id: string;
    name: string;
    description: string;
  };
  invitedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  expiresAt: string;
}

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const { user, isAuthenticated } = useAuthStore();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const user_token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    fetchInvitationDetails();
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8500/api/invitations/token/${token}`
      );
      
      if (response.data.success) {
        setInvitation(response.data.data);
      } else {
        setError(response.data.error || "Failed to load invitation");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to load invitation";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!isAuthenticated) {
      // Store token and redirect to login
      localStorage.setItem("pending_invitation", token || "");
      router.push("/login?redirect=/accept-invitation");
      return;
    }

    if (user?.email.toLowerCase() !== invitation?.email.toLowerCase()) {
      toast.error("This invitation was sent to a different email address");
      return;
    }

    try {
      setAccepting(true);
      const response = await axios.post(
        `http://localhost:8500/api/invitations/accept`,
        { token },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        }
      );

      if (response.data.success) {
        setAccepted(true);
        toast.success("Successfully joined the project!");
        
        // Redirect to project/dashboard after 2 seconds
        setTimeout(() => {
          router.push("/member-dashboard");
        }, 2000);
      } else {
        toast.error(response.data.error || "Failed to accept invitation");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to accept invitation";
      toast.error(errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-destructive" />
              <CardTitle>Invitation Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/")}>
                Go Home
              </Button>
              {isAuthenticated && (
                <Button onClick={() => router.push("/member-dashboard")}>
                  Go to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <CardTitle>Welcome to the Team!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You&apos;ve successfully joined <strong>{invitation.project.name}</strong>!
                Redirecting to your dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">You&apos;ve Been Invited!</CardTitle>
          <CardDescription>
            Join the project and start collaborating with your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Details */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{invitation.project.name}</h3>
              {invitation.project.description && (
                <p className="text-sm text-muted-foreground">
                  {invitation.project.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Invited by</p>
                  <p className="font-medium">
                    {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium">{formatDate(invitation.expiresAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Alert */}
          {isAuthenticated ? (
            <Alert>
              <Mail className="w-4 h-4" />
              <AlertDescription>
                This invitation is for <strong>{invitation.email}</strong>
                {user?.email.toLowerCase() !== invitation.email.toLowerCase() && (
                  <span className="block mt-2 text-destructive">
                    ⚠️ You are currently logged in as {user?.email}. Please log in with the
                    correct account to accept this invitation.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Mail className="w-4 h-4" />
              <AlertDescription>
                This invitation is for <strong>{invitation.email}</strong>. Please log in or
                create an account to accept.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {isAuthenticated ? (
              <Button
                onClick={handleAcceptInvitation}
                disabled={
                  accepting ||
                  user?.email.toLowerCase() !== invitation.email.toLowerCase()
                }
                className="flex-1"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  localStorage.setItem("pending_invitation", token || "");
                  router.push(`/login?redirect=/accept-invitation?token=${token}`);
                }}
                className="flex-1"
              >
                Log In to Accept
              </Button>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-muted-foreground">
            By accepting this invitation, you agree to join this project and collaborate
            with the team members.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
