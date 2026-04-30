export const revalidate = 60;
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { LikeButton } from "@/components/forum/LikeButton";
import { SaveButton } from "@/components/forum/SaveButton";
import { FollowButton } from "@/components/forum/FollowButton";
import { CommentForm } from "@/components/forum/CommentForm";
import { ReplyToggle } from "@/components/forum/ReplyToggle";
import { DeletePostButton } from "@/components/forum/DeletePostButton";
import { formatRelativeDate } from "@/lib/utils";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { title: true, content: true },
  });
  if (!post) return { title: "Inlägg saknas" };
  return {
    title: post.title,
    description: post.content.slice(0, 160).replace(/<[^>]+>/g, ""),
  };
}

const POST_TYPE_LABELS: Record<string, string> = {
  general:  "💬 Diskussion",
  question: "❓ Fråga",
  tip:      "💡 Tips",
  harvest:  "🌾 Skörd",
  photo:    "📸 Bild",
};

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [post, profile] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            bio: true,
            points: true,
            _count: { select: { posts: true, followers: true } },
          },
        },
        comments: {
          where: { parentId: null, status: { in: ["published"] } },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
            replies: {
              where: { status: { in: ["published"] } },
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    }),
    user
      ? prisma.profile.findUnique({
          where: { userId: user.id },
          select: { id: true, username: true, fullName: true, avatarUrl: true, role: true },
        })
      : null,
  ]);

  if (!post || post.status === "hidden" || post.status === "deleted") notFound();

  // Fetch current user's like/save/follow status
  const [likeRecord, saveRecord, followRecord] = profile
    ? await Promise.all([
        prisma.postLike.findUnique({
          where: { postId_userId: { postId: id, userId: profile.id } },
        }),
        prisma.savedPost.findUnique({
          where: { postId_userId: { postId: id, userId: profile.id } },
        }),
        post.author.id !== profile.id
          ? prisma.follow.findUnique({
              where: {
                followerId_followingId: { followerId: profile.id, followingId: post.author.id },
              },
            })
          : null,
      ])
    : [null, null, null];

  const isOwner = profile?.id === post.author.id;
  const isMod = profile && ["admin", "moderator"].includes(profile.role);

  const navUser = profile
    ? {
        id: profile.id,
        username: profile.username,
        displayName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={navUser} />

      <main className="flex-1 bg-cream-50 py-8">
        <div className="container-main">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Inlägg + kommentarer */}
            <div className="flex-1 min-w-0">
              <Link
                href="/forum"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" /> Tillbaka till forumet
              </Link>

              {/* Inläggskort */}
              <Card className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {post.status === "pinned" && <Badge variant="warning">Fastnålad</Badge>}
                  {post.postType && post.postType !== "general" && (
                    <Badge variant="outline">{POST_TYPE_LABELS[post.postType] ?? post.postType}</Badge>
                  )}
                  {post.category && <Badge variant="success">{post.category}</Badge>}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

                <div className="flex items-center gap-3 mb-6">
                  <Link href={`/profil/${post.author.username}`}>
                    <Avatar
                      src={post.author.avatarUrl}
                      fallback={post.author.fullName ?? post.author.username}
                      size="sm"
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/profil/${post.author.username}`}
                      className="text-sm font-medium text-gray-900 hover:text-green-700 transition-colors"
                    >
                      {post.author.fullName ?? post.author.username}
                    </Link>
                    <p className="text-xs text-gray-400">{formatRelativeDate(post.createdAt)}</p>
                  </div>
                </div>

                {/* Bild */}
                {post.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full max-h-[480px] object-cover rounded-xl mb-6 border border-gray-100"
                  />
                )}

                {/* Innehåll */}
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
                  {post.content}
                </div>

                {/* Åtgärder */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    {profile ? (
                      <LikeButton
                        postId={id}
                        initialLiked={!!likeRecord}
                        initialCount={post.likesCount}
                      />
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        ❤️ {post.likesCount}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                      {post.commentsCount}
                    </span>

                    {profile && <SaveButton postId={id} initialSaved={!!saveRecord} />}
                  </div>

                  <div className="flex items-center gap-2">
                    {(isOwner || isMod) && (
                      <DeletePostButton postId={id} isMod={!!isMod} />
                    )}
                  </div>
                </div>
              </Card>

              {/* Kommentarer */}
              <div id="kommentarer">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {post.commentsCount} {post.commentsCount === 1 ? "kommentar" : "kommentarer"}
                </h2>

                {/* Kommentarsformulär */}
                {profile ? (
                  <Card className="mb-5">
                    <CommentForm
                      postId={id}
                      currentUserAvatar={profile.avatarUrl}
                      currentUsername={profile.username}
                    />
                  </Card>
                ) : (
                  <Card className="mb-5 text-center bg-green-50 border-green-100 py-4">
                    <p className="text-sm text-green-700">
                      <Link
                        href={`/auth/login?redirect=/forum/${id}`}
                        className="font-medium underline"
                      >
                        Logga in
                      </Link>{" "}
                      för att kommentera
                    </p>
                  </Card>
                )}

                {/* Kommentarslista */}
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id}>
                      <Card padding="sm">
                        <div className="flex gap-3">
                          <Link href={`/profil/${comment.author.username}`} className="shrink-0">
                            <Avatar
                              src={comment.author.avatarUrl}
                              fallback={comment.author.fullName ?? comment.author.username}
                              size="sm"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/profil/${comment.author.username}`}
                                className="text-sm font-medium text-gray-900 hover:text-green-700"
                              >
                                {comment.author.fullName ?? comment.author.username}
                              </Link>
                              <span className="text-xs text-gray-400">
                                {formatRelativeDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Svar */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 mt-2 space-y-2">
                          {comment.replies.map((reply) => (
                            <Card key={reply.id} padding="sm" className="border-l-2 border-green-200">
                              <div className="flex gap-3">
                                <Link href={`/profil/${reply.author.username}`} className="shrink-0">
                                  <Avatar
                                    src={reply.author.avatarUrl}
                                    fallback={reply.author.fullName ?? reply.author.username}
                                    size="xs"
                                  />
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Link
                                      href={`/profil/${reply.author.username}`}
                                      className="text-sm font-medium text-gray-900 hover:text-green-700"
                                    >
                                      {reply.author.fullName ?? reply.author.username}
                                    </Link>
                                    <span className="text-xs text-gray-400">
                                      {formatRelativeDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Svara på kommentar */}
                      {profile && (
                        <div className="ml-8 mt-2">
                          <ReplyToggle
                            postId={id}
                            parentId={comment.id}
                            currentUserAvatar={profile.avatarUrl}
                            currentUsername={profile.username}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {post.comments.length === 0 && (
                    <Card className="text-center py-10">
                      <p className="text-gray-400 text-sm">
                        Inga kommentarer ännu. Bli den första!
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar – Författare */}
            <aside className="lg:w-72 shrink-0 space-y-5">
              <Card>
                <div className="text-center">
                  <Link href={`/profil/${post.author.username}`}>
                    <Avatar
                      src={post.author.avatarUrl}
                      fallback={post.author.fullName ?? post.author.username}
                      size="lg"
                      className="mx-auto mb-3 ring-2 ring-white shadow"
                    />
                  </Link>
                  <Link
                    href={`/profil/${post.author.username}`}
                    className="block font-semibold text-gray-900 hover:text-green-700 transition-colors"
                  >
                    {post.author.fullName ?? post.author.username}
                  </Link>
                  <p className="text-xs text-gray-400 mb-3">@{post.author.username}</p>

                  {post.author.bio && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {post.author.bio}
                    </p>
                  )}

                  <div className="flex justify-center gap-6 text-sm mb-4">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{post.author._count.posts}</div>
                      <div className="text-xs text-gray-400">inlägg</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{post.author._count.followers}</div>
                      <div className="text-xs text-gray-400">följare</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{post.author.points}</div>
                      <div className="text-xs text-gray-400">poäng</div>
                    </div>
                  </div>

                  {profile && !isOwner && (
                    <FollowButton
                      targetProfileId={post.author.id}
                      initialFollowing={!!followRecord}
                      size="md"
                    />
                  )}
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
