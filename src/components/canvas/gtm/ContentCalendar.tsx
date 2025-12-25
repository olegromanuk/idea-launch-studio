import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Calendar,
  Clock,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  FileText,
  CheckCircle2,
  Circle,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  postType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "draft" | "scheduled" | "published";
  hashtags: string[];
  notes: string;
}

interface ContentCalendarProps {
  posts: ContentPost[];
  onChange: (posts: ContentPost[]) => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
}

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-500" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "from-blue-500 to-blue-600" },
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "from-sky-400 to-sky-500" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-blue-700" },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "from-red-500 to-red-600" },
  { value: "email", label: "Email", icon: Mail, color: "from-emerald-500 to-teal-500" },
  { value: "blog", label: "Blog", icon: FileText, color: "from-orange-500 to-amber-500" },
];

const POST_TYPES = [
  "Educational",
  "Promotional",
  "Engagement",
  "Behind-the-Scenes",
  "User-Generated",
  "Product Update",
  "Case Study",
  "Tips & Tricks",
  "Announcement",
  "Story/Reel",
];

export const ContentCalendar = ({
  posts,
  onChange,
  onAIGenerate,
  isGenerating = false,
}: ContentCalendarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const addPost = () => {
    const newPost: ContentPost = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      platform: "instagram",
      postType: "Educational",
      scheduledDate: "",
      scheduledTime: "09:00",
      status: "draft",
      hashtags: [],
      notes: "",
    };
    onChange([...posts, newPost]);
    setEditingId(newPost.id);
  };

  const updatePost = (id: string, updates: Partial<ContentPost>) => {
    onChange(posts.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePost = (id: string) => {
    onChange(posts.filter(p => p.id !== id));
  };

  const addHashtag = (postId: string, tag: string) => {
    const post = posts.find(p => p.id === postId);
    if (post && tag.trim()) {
      const formattedTag = tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`;
      updatePost(postId, {
        hashtags: [...post.hashtags, formattedTag],
      });
    }
  };

  const removeHashtag = (postId: string, index: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      updatePost(postId, {
        hashtags: post.hashtags.filter((_, i) => i !== index),
      });
    }
  };

  const getPlatformInfo = (platform: string) => {
    return PLATFORMS.find(p => p.value === platform) || PLATFORMS[0];
  };

  const groupPostsByDate = () => {
    const grouped: Record<string, ContentPost[]> = {};
    posts.forEach(post => {
      const date = post.scheduledDate || "Unscheduled";
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(post);
    });
    return grouped;
  };

  const sortedDates = Object.keys(groupPostsByDate()).sort((a, b) => {
    if (a === "Unscheduled") return 1;
    if (b === "Unscheduled") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Plan and schedule your content across all platforms
        </p>
        <div className="flex items-center gap-2">
          {onAIGenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              Generate Ideas
            </Button>
          )}
          <Button onClick={addPost} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Post
          </Button>
        </div>
      </div>

      {/* Stats */}
      {posts.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap">
          {PLATFORMS.map(platform => {
            const count = posts.filter(p => p.platform === platform.value).length;
            if (count === 0) return null;
            return (
              <Badge key={platform.value} variant="outline" className="gap-1">
                <platform.icon className="w-3 h-3" />
                {count} {platform.label}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Posts grouped by date */}
      <div className="space-y-6">
        {sortedDates.map(date => {
          const datePosts = groupPostsByDate()[date];
          const isUnscheduled = date === "Unscheduled";
          
          return (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">
                  {isUnscheduled ? "Unscheduled" : new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {datePosts.length} posts
                </Badge>
              </div>
              
              <div className="space-y-3">
                {datePosts.map((post) => {
                  const platformInfo = getPlatformInfo(post.platform);
                  const PlatformIcon = platformInfo.icon;
                  const isEditing = editingId === post.id;

                  return (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="flex">
                        {/* Platform indicator */}
                        <div className={cn(
                          "w-1.5 bg-gradient-to-b flex-shrink-0",
                          platformInfo.color
                        )} />
                        
                        <div className="flex-1 p-4">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                  "bg-gradient-to-br",
                                  platformInfo.color
                                )}>
                                  <PlatformIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <Input
                                    value={post.title}
                                    onChange={(e) => updatePost(post.id, { title: e.target.value })}
                                    placeholder="Post title"
                                    className="font-medium mb-2"
                                  />
                                  <Textarea
                                    value={post.content}
                                    onChange={(e) => updatePost(post.id, { content: e.target.value })}
                                    placeholder="Write your post content..."
                                    className="min-h-[100px]"
                                  />
                                </div>
                              </div>

                              {/* Post Settings */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <Select
                                  value={post.platform}
                                  onValueChange={(v) => updatePost(post.id, { platform: v })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Platform" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PLATFORMS.map((p) => (
                                      <SelectItem key={p.value} value={p.value}>
                                        <div className="flex items-center gap-2">
                                          <p.icon className="w-4 h-4" />
                                          {p.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={post.postType}
                                  onValueChange={(v) => updatePost(post.id, { postType: v })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {POST_TYPES.map((type) => (
                                      <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="date"
                                  value={post.scheduledDate}
                                  onChange={(e) => updatePost(post.id, { scheduledDate: e.target.value })}
                                />
                                <Input
                                  type="time"
                                  value={post.scheduledTime}
                                  onChange={(e) => updatePost(post.id, { scheduledTime: e.target.value })}
                                />
                              </div>

                              {/* Hashtags */}
                              <div>
                                <label className="text-xs text-muted-foreground mb-2 block">Hashtags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {post.hashtags.map((tag, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="gap-1 cursor-pointer hover:bg-destructive/10"
                                      onClick={() => removeHashtag(post.id, i)}
                                    >
                                      {tag}
                                      <Trash2 className="w-3 h-3" />
                                    </Badge>
                                  ))}
                                </div>
                                <Input
                                  placeholder="Add hashtag and press Enter..."
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      addHashtag(post.id, e.currentTarget.value);
                                      e.currentTarget.value = "";
                                    }
                                  }}
                                />
                              </div>

                              {/* Status & Actions */}
                              <div className="flex items-center justify-between pt-2 border-t border-border">
                                <Select
                                  value={post.status}
                                  onValueChange={(v) => updatePost(post.id, { status: v as ContentPost["status"] })}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingId(null)}
                                  >
                                    Done
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deletePost(post.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="flex items-start gap-3 cursor-pointer"
                              onClick={() => setEditingId(post.id)}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                "bg-gradient-to-br",
                                platformInfo.color
                              )}>
                                <PlatformIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-foreground truncate">
                                    {post.title || "Untitled Post"}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      post.status === "published" && "bg-success/10 text-success border-success/30",
                                      post.status === "scheduled" && "bg-blue-500/10 text-blue-500 border-blue-500/30",
                                      post.status === "draft" && "bg-muted"
                                    )}
                                  >
                                    {post.status === "published" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {post.status === "scheduled" && <Clock className="w-3 h-3 mr-1" />}
                                    {post.status === "draft" && <Circle className="w-3 h-3 mr-1" />}
                                    {post.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {post.content || "No content yet"}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.scheduledTime}
                                  </span>
                                  <span>{post.postType}</span>
                                  {post.hashtags.length > 0 && (
                                    <span>{post.hashtags.length} hashtags</span>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 rounded-lg bg-muted/30 border border-dashed border-border">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Content Scheduled</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start planning your content calendar
          </p>
          <Button onClick={addPost} className="gap-2">
            <Plus className="w-4 h-4" />
            Create First Post
          </Button>
        </div>
      )}
    </div>
  );
};
