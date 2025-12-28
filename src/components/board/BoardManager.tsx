import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, FolderOpen } from "lucide-react";

interface Board {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface BoardManagerProps {
  userId: string;
  currentBoardId: string | null;
  onBoardChange: (boardId: string | null) => void;
  onBoardCreated: (board: Board) => void;
}

export const BoardManager = ({
  userId,
  currentBoardId,
  onBoardChange,
  onBoardCreated,
}: BoardManagerProps) => {
  const { toast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBoards();
  }, [userId]);

  const loadBoards = async () => {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading boards:", error);
      return;
    }

    setBoards(data || []);
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("boards")
      .insert({
        user_id: userId,
        name: newBoardName.trim(),
        description: newBoardDescription.trim() || null,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create board",
        variant: "destructive",
      });
      return;
    }

    setBoards((prev) => [data, ...prev]);
    onBoardCreated(data);
    setNewBoardName("");
    setNewBoardDescription("");
    setShowNewDialog(false);

    toast({
      title: "Board created",
      description: `"${data.name}" has been created`,
    });
  };

  const deleteBoard = async (boardId: string) => {
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;

    const { error } = await supabase.from("boards").delete().eq("id", boardId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete board",
        variant: "destructive",
      });
      return;
    }

    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    if (currentBoardId === boardId) {
      onBoardChange(null);
    }

    toast({
      title: "Board deleted",
      description: `"${board.name}" has been deleted`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentBoardId || "all"}
        onValueChange={(v) => onBoardChange(v === "all" ? null : v)}
      >
        <SelectTrigger className="w-[200px]">
          <FolderOpen className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Select board" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Elements</SelectItem>
          {boards.map((board) => (
            <SelectItem key={board.id} value={board.id}>
              {board.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={() => setShowNewDialog(true)} title="New Board">
        <Plus className="w-4 h-4" />
      </Button>

      {currentBoardId && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => deleteBoard(currentBoardId)}
          title="Delete Board"
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Board Name</Label>
              <Input
                id="board-name"
                placeholder="e.g., Project Planning"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="board-description">Description (optional)</Label>
              <Input
                id="board-description"
                placeholder="Brief description..."
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createBoard} disabled={!newBoardName.trim() || loading}>
              {loading ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
