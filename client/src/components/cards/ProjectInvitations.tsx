"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, Plus, X, Loader2, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface Invitation {
  _id: string;
  email: string;
  status: "pending" | "accepted" | "expired" | "rejected";
  createdAt: string;
  expiresAt: string;
}

interface InvitationResult {
  email: string;
  success: boolean;
  message: string;
  invited?: boolean;
  added?: boolean;
}

interface ProjectInvitationsProps {
  projectId: string;
  projectName: string;
}

export default function ProjectInvitations({ projectId, projectName }: ProjectInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [inviteResults, setInviteResults] = useState<InvitationResult[]>([]);

  useEffect(() => {
    fetchInvitations();
  }, [projectId]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invitations/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setInvitations(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch invitations:", error);
      // Don't show error toast on initial load if there are no invitations
      if (error.response?.status !== 404) {
        toast.error("Failed to load invitations");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const email = currentEmail.trim().toLowerCase();

    if (!email) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (emails.includes(email)) {
      setEmailError("This email has already been added");
      return;
    }

    // Check if email already has a pending invitation
    const existingInvitation = invitations.find(
      (inv) => inv.email.toLowerCase() === email && inv.status === "pending"
    );
    if (existingInvitation) {
      setEmailError("This email already has a pending invitation");
      return;
    }

    setEmails((prev) => [...prev, email]);
    setCurrentEmail("");
    setEmailError("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSendInvitations = async () => {
    if (emails.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    try {
      setSending(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invitations/send`,
        {
          projectId,
          emails,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const results: InvitationResult[] = response.data.data.results;
        setInviteResults(results);
        setShowConfirmDialog(true);

        // Clear the email list
        setEmails([]);

        // Refresh invitations list
        await fetchInvitations();

        // Show summary toast
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        if (failed === 0) {
          toast.success(`Successfully sent ${successful} invitation(s)!`);
        } else if (successful === 0) {
          toast.error(`Failed to send all invitations`);
        } else {
          toast(`Sent ${successful} invitation(s), ${failed} failed`, {
            icon: "⚠️",
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to send invitations";
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      setCancellingId(invitationId);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invitations/${invitationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Invitation cancelled");
        await fetchInvitations();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to cancel invitation";
      toast.error(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: Invitation["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "accepted":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "expired":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: Invitation["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "accepted":
        return <CheckCircle className="w-3 h-3" />;
      case "expired":
        return <XCircle className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Send Invitations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Team Members
          </CardTitle>
          <CardDescription>
            Send email invitations to add members to {projectName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="invitation-email">Email Address</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="invitation-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={currentEmail}
                  onChange={(e) => {
                    setCurrentEmail(e.target.value);
                    setEmailError("");
                  }}
                  onKeyPress={handleKeyPress}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEmail}
                disabled={!currentEmail.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Added Emails List */}
          {emails.length > 0 && (
            <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{email}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmail(email)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendInvitations}
            disabled={emails.length === 0 || sending}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Invitations...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send {emails.length} Invitation{emails.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Invitations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Manage outstanding project invitations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No pending invitations
            </p>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{invitation.email}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Sent {formatDate(invitation.createdAt)}</span>
                      <span>Expires {formatDate(invitation.expiresAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1 ${getStatusColor(invitation.status)}`}
                    >
                      {getStatusIcon(invitation.status)}
                      {invitation.status}
                    </Badge>
                    {invitation.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation._id)}
                        disabled={cancellingId === invitation._id}
                      >
                        {cancellingId === invitation._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Invitation Results</AlertDialogTitle>
            <AlertDialogDescription>
              Here's the status of each invitation sent:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            {inviteResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success ? "bg-green-50 border-green-200 dark:bg-green-950/20" : "bg-red-50 border-red-200 dark:bg-red-950/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{result.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">{result.message}</p>
                    {result.added && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Added Directly (Existing User)
                      </Badge>
                    )}
                    {result.invited && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Invitation Sent
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
