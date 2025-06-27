
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Star, Trash } from "lucide-react";
import { CurrencyModel } from "@/models/currencies";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface CurrencyTableProps {
  currencies: CurrencyModel[] | undefined;
  onEdit: (currency: CurrencyModel) => void;
  onSetDefault: (currencyCode: string) => void;
  onDelete: (currencyCode: string) => void;
  setDefaultLoading: boolean;
  deleteLoading: boolean;
}

const CurrencyTable = ({ 
  currencies, 
  onEdit, 
  onSetDefault, 
  onDelete, 
  setDefaultLoading, 
  deleteLoading 
}: CurrencyTableProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Mata Uang</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus mata uang {currency.name}? 
                            Pastikan mata uang ini tidak digunakan di manapun.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(currency.code)}
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? "Menghapus..." : "Hapus"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
