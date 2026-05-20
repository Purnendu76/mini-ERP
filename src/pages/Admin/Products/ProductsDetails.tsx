import { useParams, useNavigate } from "react-router-dom";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";
import { 
  ChevronLeft, 
  Package, 
  Tag, 
  Boxes, 
  IndianRupee, 
  Calendar, 
  Edit3, 
  Trash2,
  Info,
  ImagePlus,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProductsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const rolePrefix = user?.role.toLowerCase() || "admin";
  const { getProductById } = useProductStore();
  const product = getProductById(id || "");

  if (!product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Button onClick={() => navigate(`/${rolePrefix}/products`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/${rolePrefix}/products`)}
            className="-ml-2 mb-2"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <Badge variant={product.status === "In Stock" ? "default" : "destructive"}>
              {product.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">SKU: {product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Product Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-500" />
                  <p>{product.category}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <p>{product.createdAt}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-blue-500" />
                  <p className="font-semibold">₹{product.price.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-blue-500" />
                  <p className="font-semibold">{product.stock} units</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                No description available for this product. Add a description to provide more information about its features and specifications.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Product Media */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Product Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden relative group">
              {product.image ? (
                <>
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Change Image
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground p-4 text-center">
                  <div className="p-3 bg-muted rounded-full">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                  <p className="font-medium text-sm">No image uploaded</p>
                </div>
              )}
            </div>
            
            {/* Upload Placeholder UI based on user request */}
            <div className="mt-auto p-4 rounded-lg bg-muted/50 border flex items-center gap-4">
               <div className="p-2 bg-background rounded-md border shadow-sm">
                 <ImagePlus className="h-5 w-5 text-muted-foreground" />
               </div>
               <div>
                 <p className="font-semibold text-sm">Product Image</p>
                 <p className="text-xs text-muted-foreground mt-0.5">Image upload UI placeholder only. You can connect upload logic later.</p>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
