"use client";

import { SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/actions/group.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function CreateGroupPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (image) {
      formData.set("image", image);
    }

    const result = await createGroup(formData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      router.push(`/groups/${result.groupId}`);
    } else {
      setError(result.error || "Failed to create group");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Group</h1>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md mb-6 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="image">Group Image (Optional)</Label>
          <div className="mt-2">
            <ImageUpload 
              value={image}
              onChange={(url: SetStateAction<string | null>) => setImage(url)}
              label="Upload group image" endpoint={"postImage"}            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="name" className="required">Group Name</Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="Enter group name"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea 
            id="description" 
            name="description" 
            placeholder="What's this group about?"
            rows={4}
            className="mt-1 resize-none"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Group"
          )}
        </Button>
      </form>
    </div>
  );
}