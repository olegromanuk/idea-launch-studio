import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

interface AddElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (element: {
    section_key: string;
    section_title: string;
    content: string;
    color: string;
    width: number;
    height: number;
  }) => void;
}

export const AddElementDialog = ({
  open,
  onOpenChange,
  onAdd,
}: AddElementDialogProps) => {
  const [sectionKey, setSectionKey] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = () => {
    if (!sectionKey.trim() || !sectionTitle.trim()) return;

    onAdd({
      section_key: sectionKey.trim(),
      section_title: sectionTitle.trim(),
      content: content.trim(),
      color,
      width: 300,
      height: 200,
    });

    // Reset form
    setSectionKey("");
    setSectionTitle("");
    setContent("");
    setColor(COLORS[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Element</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="section-key">Section Key</Label>
            <Input
              id="section-key"
              placeholder="e.g., IDEA, GOAL, NOTE"
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              placeholder="Enter a title for this element"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter the content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!sectionKey.trim() || !sectionTitle.trim()}>
            Add Element
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
