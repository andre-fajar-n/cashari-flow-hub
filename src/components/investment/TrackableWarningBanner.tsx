import { AlertTriangle, Info, Trash2, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TrackableWarningBannerProps {
  type: "legacy-data" | "not-trackable";
}

/**
 * Banner peringatan untuk aset yang tidak trackable
 * 
 * - "legacy-data": Aset memiliki data nilai pasar lama tapi instrumen tidak trackable
 * - "not-trackable": Instrumen tidak mendukung pelacakan nilai pasar
 */
const TrackableWarningBanner = ({ type }: TrackableWarningBannerProps) => {
  if (type === "legacy-data") {
    return (
      <Alert variant="default" className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
        <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold">
          Informasi Nilai Pasar Tidak Aktif
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300 space-y-3">
          <p>
            Aset ini memiliki data nilai pasar dari pencatatan sebelumnya, 
            namun instrumen aset ini tidak mendukung pelacakan nilai pasar.
          </p>
          
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-md p-3 space-y-2">
            <p className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Anda masih dapat melihat riwayat nilai pasar yang sudah ada, 
                tetapi tidak dapat menambahkan atau mengubah nilai pasar baru.
              </span>
            </p>
            <p className="text-sm italic">
              Data nilai pasar ini tidak digunakan dalam perhitungan nilai aset dan keuntungan.
            </p>
          </div>

          <div className="border-t border-amber-300 dark:border-amber-700 pt-3">
            <p className="font-medium mb-2">Untuk menghindari kebingungan, Anda dapat:</p>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>Mengubah pengaturan instrumen menjadi Trackable, atau</span>
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                <span>Menghapus data nilai pasar jika memang tidak seharusnya ada</span>
              </li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // type === "not-trackable"
  return (
    <Alert className="border-muted bg-muted/50">
      <Info className="h-5 w-5 text-muted-foreground" />
      <AlertTitle className="text-foreground font-semibold">
        Instrumen Tidak Mendukung Pelacakan Nilai Pasar
      </AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Nilai aset dihitung berdasarkan transaksi yang tercatat.
      </AlertDescription>
    </Alert>
  );
};

export default TrackableWarningBanner;
