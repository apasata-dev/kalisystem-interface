import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { SupplierForm } from '@/components/forms/SupplierForm';
import { ItemForm } from '@/components/forms/ItemForm';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Package, Tag, Users, CheckCircle, ShoppingCart, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STORE_TAGS } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Home() {
  const { items, categories, suppliers, tags, currentOrder, completedOrders, addItem, addCategory, addSupplier, addTag } = useApp();
  const navigate = useNavigate();
  
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);
  
  const [newItemData, setNewItemData] = useState({
    name: '',
    category: categories[0]?.name || '',
    supplier: suppliers[0]?.name || '',
  });
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newTagData, setNewTagData] = useState({
    name: '',
    color: '#3b82f6',
    category: '',
  });
  const [newTagCategory, setNewTagCategory] = useState('');

  const stats = [
    { label: 'Items', value: items.length, icon: Package, color: 'text-primary' },
    { label: 'Categories', value: categories.length, icon: Tag, color: 'text-secondary' },
    { label: 'Suppliers', value: suppliers.length, icon: Users, color: 'text-accent' },
  ];

  const storeOrders = useMemo(() => {
    const orders: Record<string, { count: number; storeTag: string }> = {};
    
    STORE_TAGS.forEach(storeTag => {
      const itemsForStore = currentOrder.filter(oi => oi.storeTag === storeTag);
      if (itemsForStore.length > 0) {
        orders[storeTag] = { count: itemsForStore.length, storeTag };
      }
    });
    
    return orders;
  }, [currentOrder]);

  const handleCardClick = (label: string) => {
    if (label === 'Items') {
      navigate('/items');
    } else if (label === 'Categories') {
      navigate('/items?groupBy=category');
    } else if (label === 'Suppliers') {
      navigate('/items?groupBy=supplier');
    }
  };

  const handleAddItem = () => {
    if (!newItemData.name.trim()) {
      toast.error('Please enter item name');
      return;
    }
    addItem({
      name: newItemData.name,
      category: newItemData.category,
      supplier: newItemData.supplier,
      tags: [],
    });
    toast.success('Item added successfully');
    setIsNewItemOpen(false);
    setNewItemData({
      name: '',
      category: categories[0]?.name || '',
      supplier: suppliers[0]?.name || '',
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter category name');
      return;
    }
    addCategory({
      name: newCategoryName,
      emoji: '📁',
    });
    toast.success('Category added successfully');
    setIsNewCategoryOpen(false);
    setNewCategoryName('');
  };

  const handleAddSupplier = () => {
    if (!newSupplierName.trim()) {
      toast.error('Please enter supplier name');
      return;
    }
    addSupplier({
      name: newSupplierName,
    });
    toast.success('Supplier added successfully');
    setIsNewSupplierOpen(false);
    setNewSupplierName('');
  };

  const handleAddTag = () => {
    if (!newTagData.name.trim()) {
      toast.error('Please enter tag name');
      return;
    }
    
    let categoryToUse = newTagData.category;
    
    if (newTagData.category === 'create-new' && newTagCategory.trim()) {
      addCategory({
        name: newTagCategory,
        emoji: '📁',
      });
      categoryToUse = newTagCategory;
    }
    
    addTag({
      name: newTagData.name,
      color: newTagData.color,
      category: categoryToUse || undefined,
    });
    toast.success('Tag added successfully');
    setIsNewTagOpen(false);
    setNewTagData({
      name: '',
      color: '#3b82f6',
      category: '',
    });
    setNewTagCategory('');
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            KaliSystem 
          </h1>
          <p className="text-muted-foreground">Scalable Ordering Sytem</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card 
              key={label} 
              className="p-4 bg-card border-border cursor-pointer hover:border-primary/30 transition-colors relative group"
              onClick={() => handleCardClick(label)}
              data-testid={`card-${label.toLowerCase()}`}
            >
              <div className="space-y-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
              <Button
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  if (label === 'Items') setIsNewItemOpen(true);
                  else if (label === 'Categories') setIsNewCategoryOpen(true);
                  else if (label === 'Suppliers') setIsNewSupplierOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>

        {/* Tags and Orders Row */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-4 bg-card border-border cursor-pointer hover:border-primary/30 transition-colors relative group"
            onClick={() => navigate('/tags')}
            data-testid="card-tags"
          >
            <div className="space-y-2">
              <Tag className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{tags.length}</p>
                <p className="text-xs text-muted-foreground">Tags</p>
              </div>
            </div>
            <Button
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsNewTagOpen(true);
              }}
              data-testid="button-add-tags"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </Card>

          <Card 
            className="p-4 bg-card border-border cursor-pointer hover:border-primary/30 transition-colors relative group"
            onClick={() => navigate('/bulk')}
            data-testid="card-orders-completed"
          >
            <div className="space-y-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <Button
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/bulk');
              }}
              data-testid="button-add-order"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </Card>
        </div>

        {/* Current Order Preview */}
        {currentOrder.length > 0 && (
          <Card 
            className="p-6 bg-card border-border cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate('/order')}
            data-testid="card-current-order"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Current Order</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentOrder.length} items
                </span>
              </div>
              <div className="space-y-2">
                {currentOrder.slice(0, 3).map(({ item, quantity, storeTag }) => (
                  <div key={`${item.id}-${storeTag}`} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {storeTag && (
                        <span className="text-xs text-muted-foreground">({storeTag})</span>
                      )}
                    </span>
                    <span className="text-muted-foreground">×{quantity}</span>
                  </div>
                ))}
                {currentOrder.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{currentOrder.length - 3} more
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Store Orders Cards */}
        {Object.keys(storeOrders).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Orders by Store</h2>
            <div className="grid grid-cols-2 gap-3">
              {STORE_TAGS.map(storeTag => {
                const order = storeOrders[storeTag];
                if (!order) return null;
                
                return (
                  <Card
                    key={storeTag}
                    className="p-4 bg-card border-border cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => navigate('/order')}
                    data-testid={`card-store-${storeTag}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase">{storeTag}</span>
                        <ShoppingCart className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{order.count}</p>
                      <p className="text-xs text-muted-foreground">items</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Order History Table */}
        {completedOrders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Order History</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/order?tab=completed')}
                className="text-xs"
              >
                View All
              </Button>
            </div>
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Stores</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedOrders.slice(0, 5).map((order) => (
                    <TableRow 
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate('/order?tab=completed')}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(order.completedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {order.storeTags.map((tag) => (
                            <span 
                              key={tag} 
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium">{order.items.length}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {completedOrders.length > 5 && (
                <div className="p-2 text-center border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/order?tab=completed')}
                    className="text-xs text-muted-foreground"
                  >
                    +{completedOrders.length - 5} more orders
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* New Item Dialog */}
      <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <ItemForm
            data={newItemData}
            setData={setNewItemData}
            onSave={handleAddItem}
            onCancel={() => setIsNewItemOpen(false)}
            categories={categories}
            suppliers={suppliers}
          />
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            data={{ name: newCategoryName, emoji: '📁', parentCategory: '' }}
            setData={d => setNewCategoryName(d.name)}
            onSave={handleAddCategory}
            onCancel={() => setIsNewCategoryOpen(false)}
            parentCategories={[]}
          />
        </DialogContent>
      </Dialog>

      {/* New Supplier Dialog */}
      <Dialog open={isNewSupplierOpen} onOpenChange={setIsNewSupplierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm
            data={{ name: newSupplierName, contact: '', defaultPaymentMethod: 'COD', defaultOrderType: 'Delivery' }}
            setData={d => setNewSupplierName(d.name)}
            onSave={handleAddSupplier}
            onCancel={() => setIsNewSupplierOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* New Tag Dialog */}
      <Dialog open={isNewTagOpen} onOpenChange={setIsNewTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newTagData.name}
                onChange={(e) => setNewTagData({ ...newTagData, name: e.target.value })}
                placeholder="Enter tag name"
                data-testid="input-new-tag-name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category (recommended)</label>
              <Select
                value={newTagData.category}
                onValueChange={(value) => setNewTagData({ ...newTagData, category: value })}
              >
                <SelectTrigger data-testid="select-new-tag-category">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.emoji} {cat.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="create-new">+ Create New Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newTagData.category === 'create-new' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">New Category Name</label>
                <Input
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value)}
                  placeholder="Enter category name"
                  data-testid="input-new-tag-category-name"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTagOpen(false)} data-testid="button-cancel-new-tag">
              Cancel
            </Button>
            <Button onClick={handleAddTag} data-testid="button-save-new-tag">
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
