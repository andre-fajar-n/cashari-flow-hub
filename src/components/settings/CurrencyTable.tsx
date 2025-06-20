
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Star, Trash } from "lucide-react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  is_default: boolean;
}

interface CurrencyTableProps {
  currencies: Currency[] | undefined;
  onEdit: (currency: Currency) => void;
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
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[80px]">Kode</TableHead>
            <TableHead className="min-w-[120px]">Nama</TableHead>
            <TableHead className="min-w-[80px]">Symbol</TableHead>
            <TableHead className="min-w-[80px]">Default</TableHead>
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
                  {currency.is_default ? "Ya" : "Tidak"}
                  {!currency.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefault(currency.code)}
                      disabled={setDefaultLoading}
                      className="h-6 w-6 p-0"
                    >
                      <Star className="w-3 h-3" />
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
                            Pastikan mata uang ini tidak digunakan di transaksi atau dompet manapun.
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
