
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TransactionForm = ({ onAddTransaction }) => {
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    category: "",
    description: ""
  });
  
  const { toast } = useToast();

  const categories = {
    income: ["Gaji", "Freelance", "Investasi", "Hadiah", "Lainnya"],
    expense: ["Makanan", "Transportasi", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Lainnya"]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.amount || !formData.category) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const transaction = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    onAddTransaction(transaction);
    
    setFormData({
      type: "",
      amount: "",
      category: "",
      description: ""
    });

    toast({
      title: "Berhasil!",
      description: `Transaksi ${formData.type === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil ditambahkan`,
    });
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-green-600" />
          <span>Tambah Transaksi</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Jenis Transaksi *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value, category: ""})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis transaksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Jumlah (Rp) *</Label>
            <Input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="Masukkan jumlah"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <Label htmlFor="category">Kategori *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({...formData, category: value})}
              disabled={!formData.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {formData.type && categories[formData.type].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Deskripsi transaksi (opsional)"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
