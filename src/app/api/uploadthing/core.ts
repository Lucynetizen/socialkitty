import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // define routes for different upload types
  postImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // this code runs on the server before upload
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        return { fileUrl: file.url };
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        throw error;
      }
    }),

  // route for profile image uploads
  profileImage: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        return { fileUrl: file.url };
      } catch (error) {
        console.error("Error in onUploadComplete for profile image:", error);
        throw error;
      }
    }),
    
  // route for group message image uploads
  messageImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        return { fileUrl: file.url };
      } catch (error) {
        console.error("Error in onUploadComplete for message image:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;