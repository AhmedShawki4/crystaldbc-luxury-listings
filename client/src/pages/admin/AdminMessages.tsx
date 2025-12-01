import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ContactMessage } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const fetchMessages = async () => {
  const { data } = await apiClient.get<{ messages: ContactMessage[] }>("/messages");
  return data.messages;
};

const AdminMessages = () => {
  const { data } = useQuery({ queryKey: ["messages"], queryFn: fetchMessages });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.patch(`/messages/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast({ title: "Message status updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast({ title: "Message deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Messages</h1>
        <p className="text-muted-foreground">Contact form submissions from the site.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data?.map((message) => (
          <Card key={message._id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{message.name}</h3>
                  <p className="text-sm text-muted-foreground">{message.email}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(message._id)}>
                  Delete
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{message.phone}</p>
              <p className="text-sm">{message.message}</p>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={message.status}
                  onValueChange={(value) => updateMutation.mutate({ id: message._id, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminMessages;
