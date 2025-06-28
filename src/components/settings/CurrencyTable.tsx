
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Star, Trash } from "lucide-react";
import { CurrencyModel } from "@/models/currencies";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useState } from "react";

interface CurrencyTableProps {
  currencies: CurrencyModel[] | undefined;
  onEdit: (currency: CurrencyModel) => void;
  onSetDefault: (currencyCode: string) => void;
  onDelete: (currencyCode: string) => void;
  setDefaultLoading: boolean;
}

const CurrencyTable = ({ 
  currencies, 
  onEdit, 
  onSetDefault, 
  onDelete, 
  setDefaultLoading, 
}: CurrencyTableProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);

  const handleDeleteClick = (currencyId: string) => {
    setCurrencyToDelete(currencyId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currencyToDelete) {
      onDelete(currencyToDelete);
    }
  };

  return (
    <div className="overflow-x-auto">
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Mata Uang"
        description="Apakah Anda yakin ingin menghapus mata uang ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[80px]">Kode</TableHead>
            <TableHead className="min-w-[120px]">Nama</TableHead>
            <TableHead className="min-w-[80px]">Symbol</TableHead>
            <TableHead className="min-w-[100px]">Default</TableHead>
            <TableHead className="min-w-[120px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies?.map((currency) => (
            <TableRow key={currency.code}>
              <TableCell className="font-medium">{currency.code}</TableCell>
              <TableCell>{currency.name}</TableCell>
              <TableCell>{currency.symbol}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {currency.is_default ? (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">Default</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetDefault(currency.code)}
                      disabled={setDefaultLoading}
                      className="h-8 px-3 text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Set Default
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col sm:flex-row gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(currency)}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!currency.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => handleDeleteClick(currency.code)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CurrencyTable;
