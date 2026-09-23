const BASE_PRICE_BY_BRAND = Object.freeze({
    Porsche: 4500,
    Toyota: 720,
    Honda: 700,
    Mazda: 680,
    Hyundai: 650,
    Kia: 620,
    Ford: 850,
    Mercedes: 2800,
    BMW: 2700,
});

const REFERENCE_YEAR = 2026;
const MINIMUM_PRICE = 350;

window.estimateCarPrice = function estimateCarPrice(formData) {
    const basePrice = BASE_PRICE_BY_BRAND[formData.brand] ?? BASE_PRICE_BY_BRAND.Porsche;
    const productionYear = Number.parseInt(formData.model_year, 10) || 2022;
    const mileage = Number.parseInt(formData.mileage_km, 10) || 20000;
    const age = Math.max(0, REFERENCE_YEAR - productionYear);
    const estimatedPrice = basePrice - age * 80 - (mileage / 10000) * 30;
    const price = Math.max(MINIMUM_PRICE, estimatedPrice);

    return {
        price: `${Math.round(price).toLocaleString("vi-VN")} triệu`,
        range: `${Math.round(price * 0.96).toLocaleString("vi-VN")} triệu - ${Math.round(price * 1.04).toLocaleString("vi-VN")} triệu VNĐ`,
    };
};
