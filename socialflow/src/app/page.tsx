"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex space-x-4 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
          <Facebook className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
          <Instagram className="h-5 w-5 text-secondary-foreground" />
        </div>
      </div>
      <h1 className="text-3xl font-black font-serif text-primary mb-2">SocialFlow</h1>
      <p className="text-muted-foreground mb-10">Manage your social media presence</p>

      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">Sign in or sign up to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Link href="/sign-in" passHref>
            <Button className="w-full">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up" passHref>
            <Button variant="outline" className="w-full">
              Sign Up
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
