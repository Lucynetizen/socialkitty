"use client";

import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action";
import { toggleFollow, updateUserBadge } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  EditIcon,
  FileTextIcon,
  HeartIcon,
  LinkIcon,
  MapPinIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";
import CustomBadge from "@/components/CustomBadge";
import ChatButton from "@/components/ChatButton";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
}

const BADGE_COLORS = [
  "blue", "green", "red", "yellow", "purple", 
  "pink", "indigo", "orange", "teal", "gray"
];

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  likedPosts,
  posts,
  user,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    image: user.image,
    badgeText: user.badgeText || "",
    badgeColor: user.badgeColor || "blue",
    badgeEnabled: user.badgeEnabled || false,
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();
    
    // Handle basic profile fields (string values)
    formData.append("name", editForm.name);
    formData.append("bio", editForm.bio);
    formData.append("location", editForm.location);
    formData.append("website", editForm.website);
    
    // Handle image separately - only append if it's not null
    if (editForm.image) {
      formData.append("image", editForm.image);
    }
  
    const result = await updateProfile(formData);
    
    try {
      // Update badge separately
      await updateUserBadge({
        badgeText: editForm.badgeText,
        badgeColor: editForm.badgeColor,
        badgeEnabled: editForm.badgeEnabled
      });
      
      if (result.success) {
        setShowEditDialog(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update badge settings");
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.image ?? "/avatar.png"} />
                </Avatar>
                <h1 className="mt-4 text-2xl font-bold">
                  {user.name ?? user.username}
                  {/* Display badge if enabled - added null check and default for color */}
                  {user.badgeEnabled && user.badgeText && (
                    <div className="inline-block ml-2">
                      <CustomBadge text={user.badgeText} color={user.badgeColor || "blue"} />
                    </div>
                  )}
                </h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2 text-sm">{user.bio}</p>

                {/* PROFILE STATS */}
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="font-semibold">{user._count.following.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold">{user._count.followers.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      <div className="font-semibold">{user._count.posts.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                  </div>
                </div>

                {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full mt-4">Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <Button className="w-full mt-4" onClick={() => setShowEditDialog(true)}>
                    <EditIcon className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="w-full mt-4 flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleFollow}
                      disabled={isUpdatingFollow}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <ChatButton userId={user.id} className="flex-none" />
                  </div>
                )}

                {/* LOCATION & WEBSITE */}
                <div className="w-full mt-6 space-y-2 text-sm">
                  {user.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="size-4 mr-2" />
                      {user.location}
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center text-muted-foreground">
                      <LinkIcon className="size-4 mr-2" />
                      <a
                        href={
                          user.website.startsWith("http") ? user.website : `https://${user.website}`
                        }
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="size-4 mr-2" />
                    Joined {formattedDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Profile picture */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <ImageUpload
                  endpoint="profileImage"
                  value={editForm.image}
                  onChange={(url) => setEditForm({ ...editForm, image: url })}
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Where are you based?"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="Your personal website"
                />
              </div>

              {/* Badge settings */}
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="badgeText">Badge Text (max 30 characters)</Label>
                <Input
                  id="badgeText"
                  value={editForm.badgeText}
                  onChange={(e) => setEditForm({ ...editForm, badgeText: e.target.value })}
                  maxLength={30}
                  placeholder="Enter badge text"
                />
                <p className="text-sm text-muted-foreground">
                  {editForm.badgeText.length}/30 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Badge Color</Label>
                <div className="flex flex-wrap gap-2">
                  {BADGE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, badgeColor: color })}
                      className={`w-8 h-8 rounded-full border transition-all 
                        bg-${color}-100 border-${color}-300 
                        ${editForm.badgeColor === color ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                      aria-label={`${color} color`}
                    />
                  
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="badgeEnabled">Display Badge</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to show or hide your badge
                  </p>
                </div>
                <Switch
                  id="badgeEnabled"
                  checked={editForm.badgeEnabled}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, badgeEnabled: checked })}
                />
              </div>

              <div className="pt-4">
                <Label>Badge Preview</Label>
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  {editForm.badgeEnabled && editForm.badgeText ? (
                    <CustomBadge text={editForm.badgeText} color={editForm.badgeColor || "blue"} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {!editForm.badgeEnabled 
                        ? "Badge is disabled" 
                        : "Enter badge text to preview"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default ProfilePageClient;