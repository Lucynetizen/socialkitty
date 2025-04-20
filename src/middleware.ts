import { clerkMiddleware } from "@clerk/nextjs/server";

// public routes:
const publicRoutes = ["/", "/login", "/signup"];

export default clerkMiddleware((auth, req) => {
  // public route = access allowed
  const path = req.nextUrl.pathname;
  
  if (publicRoutes.some(route => path === route || path.startsWith(route + "/"))) {
    return;
  }
  
  // if not, requires authentication from Clerk 
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};