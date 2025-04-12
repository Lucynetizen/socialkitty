import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center mt-10 text-2xl text-gray-500 font-medium text-center">
        <p className="mb-4">You must be signed in to view posts from other users.</p>
        <Image
          src="/kittyholderr.png"
          alt="Login required"
          width={400}
          height={400}
          className="object-contain heartbeat mx-auto transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_20px_#fbcfe8]"
        />
      </div>
    );
  }
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}

        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId} />
          ))}
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <WhoToFollow />
      </div>
    </div>
  );
}
