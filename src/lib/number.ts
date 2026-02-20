export const formatPercentage = (value: number) => {
    return value.toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

export const formatNumber = (value: number, maximumFractionDigits: number = 2) => {
    return value.toLocaleString('id-ID', { maximumFractionDigits });
}