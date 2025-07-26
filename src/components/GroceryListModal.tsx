import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Trash2, ShoppingCart } from 'lucide-react';

interface GroceryListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groceryListId: string | null;
  groceryListTitle: string;
  onListUpdated: () => void;
}

interface GroceryListItem {
  id: string;
  amount: number;
  unit: string;
  is_checked: boolean;
  notes: string;
  ingredients: {
    id: string;
    name: string;
    category: string;
  };
}

const GroceryListModal = ({ 
  open, 
  onOpenChange, 
  groceryListId, 
  groceryListTitle,
  onListUpdated 
}: GroceryListModalProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<GroceryListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && groceryListId) {
      fetchGroceryListItems();
    }
  }, [open, groceryListId]);

  const fetchGroceryListItems = async () => {
    if (!groceryListId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grocery_list_items')
        .select(`
          *,
          ingredients (
            id,
            name,
            category
          )
        `)
        .eq('grocery_list_id', groceryListId);

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching grocery items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from('grocery_list_items')
        .update({ is_checked: checked })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, is_checked: checked } : item
      ));
    } catch (error: any) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('grocery_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
      onListUpdated();

      toast({
        title: "Item deleted",
        description: "Grocery item has been removed from your list.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportList = () => {
    const checkedItems = items.filter(item => !item.is_checked);
    const listContent = checkedItems.map(item => {
      const amount = item.amount ? `${item.amount} ${item.unit || ''}` : '';
      return `• ${item.ingredients.name} ${amount}`.trim();
    }).join('\n');

    const content = `${groceryListTitle}\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n${listContent}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${groceryListTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "List exported",
      description: "Your grocery list has been downloaded as a text file.",
    });
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.ingredients.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryListItem[]>);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>{groceryListTitle}</span>
          </DialogTitle>
          <DialogDescription>
            Manage your grocery list items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {items.filter(item => !item.is_checked).length} remaining, {items.filter(item => item.is_checked).length} completed
            </div>
            <Button onClick={handleExportList} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>

          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items in this grocery list
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category} className="space-y-3">
                  <Badge variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                  <div className="space-y-2 pl-4">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            checked={item.is_checked}
                            onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                          />
                          <div className={`flex-1 ${item.is_checked ? 'line-through text-muted-foreground' : ''}`}>
                            <div className="font-medium">{item.ingredients.name}</div>
                            {item.amount && (
                              <div className="text-sm text-muted-foreground">
                                {item.amount} {item.unit || ''}
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-sm text-muted-foreground italic">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroceryListModal;