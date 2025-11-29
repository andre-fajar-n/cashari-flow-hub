import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Coins, AlertCircle, CheckCircle, Info, ChevronDown, ChevronRight } from "lucide-react";
import { calculateZakatMal, formatZakatInfo } from "@/lib/zakat";
import { useGoldPrice } from "@/hooks/queries/use-exchange-rates";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";

interface ZakatInfoProps {
  totalWealth: number;
  baseCurrency: string;
  canCalculateWealth: boolean;
}

export const ZakatInfo = ({ totalWealth, baseCurrency, canCalculateWealth }: ZakatInfoProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: goldPrice, isLoading: isLoadingGoldPrice } = useGoldPrice(baseCurrency);

  // Calculate zakat
  const zakatCalculation = calculateZakatMal(
    totalWealth,
    baseCurrency,
    goldPrice?.rate || null,
    goldPrice?.date
  );

  const zakatInfo = formatZakatInfo(zakatCalculation);

  // Loading state
  if (isLoadingGoldPrice) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="p-6">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold">Informasi Zakat Mal</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  // Cannot calculate wealth
  if (!canCalculateWealth) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="p-6">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold">Informasi Zakat Mal</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-200 text-amber-800">
                  Tidak dapat dihitung
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Tidak dapat menghitung zakat karena ada mata uang yang tidak memiliki kurs
              </span>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  // Cannot get gold price
  if (!zakatCalculation.canCalculate) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="p-6">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold">Informasi Zakat Mal</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-200 text-amber-800">
                  Harga emas tidak tersedia
                </Badge>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Tidak dapat menghitung zakat karena harga emas tidak tersedia
              </span>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="p-6">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold">Informasi Zakat Mal</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              {zakatCalculation.isAboveNisab ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  Wajib Zakat
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-200 text-amber-800">
                  Belum Mencapai Nisab
                </Badge>
              )}

              {/* Zakat Amount */}
              {zakatCalculation.isAboveNisab && (
                <span className="text-sm font-semibold text-green-600">
                  {zakatInfo.zakatAmountText}
                </span>
              )}

              {/* Gold Price Date */}
              {goldPrice?.date && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(goldPrice.date)}
                </span>
              )}

              {/* Chevron */}
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-6 space-y-4">
            {/* Nisab Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-muted-foreground">Nisab</span>
                </div>
                <div className="pl-6">
                  <div className="font-semibold">{zakatInfo.nisabText}</div>
                  <div className="text-sm text-muted-foreground">
                    {zakatInfo.nisabAmountText}
                  </div>
                  {goldPrice?.date && (
                    <div className="text-xs text-muted-foreground">
                      Harga emas {formatDate(goldPrice.date)}: {formatAmountCurrency(goldPrice.rate, baseCurrency)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Status Zakat</span>
                </div>
                <div className="flex items-center gap-2">
                  {zakatCalculation.isAboveNisab ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        Wajib Zakat
                      </Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <Badge variant="outline" className="border-amber-200 text-amber-800">
                        Belum Mencapai Nisab
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Zakat Amount */}
            {zakatCalculation.isAboveNisab && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Jumlah Zakat yang Harus Dibayar</span>
                  </div>
                  <div className="pl-6">
                    <div className="text-xl font-bold text-green-600">
                      {zakatInfo.zakatAmountText}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      2.5% dari total kekayaan
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Information Note */}
            <div className="border-t pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Catatan Penting:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• Zakat mal dihitung berdasarkan total kekayaan yang telah mencapai nisab</li>
                      <li>• Nisab dihitung berdasarkan harga emas {zakatInfo.nisabText}</li>
                      <li>• Zakat wajib dibayar sebesar 2.5% dari total kekayaan</li>
                      <li>• Konsultasikan dengan ustadz/ulama untuk perhitungan yang lebih akurat</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
