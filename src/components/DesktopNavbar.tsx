"use client";

import { BellIcon, BookmarkIcon, HomeIcon, UserIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import SearchBar from "./SearchBar";

function DesktopNavbar() {
  const { user } = useUser();

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />
      

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      

      {user ? (
        <>
        <SearchBar />
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/bookmarks">
              <BookmarkIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Bookmarks</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/groups">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Groups</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/profile/${
                user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white hover:opacity-90 animate-gradient">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;