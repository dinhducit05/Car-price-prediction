window.carApp = function carApp() {
    return {
        currentTab: "home",
        mobileMenuOpen: false,
        predictedResult: null,
        predictionError: "",
        isLoading: false,
        isLoadingBrands: false,
        isLoadingModels: false,
        brandSuggestions: [],
        modelSuggestions: [],
        formData: {
            brand: "Porsche",
            model: "Cayenne Turbo",
            model_year: 2023,
            mileage_km: 15000,
            fuel_type: "Gasoline",
            transmission: "Automatic",
            engine_size: 4.0,
            body_type: "SUV",
            seats: 5,
            condition: "Used",
        },

        getCarImage() {
            return window.CarImages[this.formData.brand] ?? window.CarImages.Porsche;
        },

        async init() {
            await this.loadBrandSuggestions();
            await this.loadModelSuggestions();
        },

        handleBrandChange() {
            this.formData.model = "";
            this.predictedResult = null;
            this.loadModelSuggestions();
        },

        async loadBrandSuggestions() {
            this.isLoadingBrands = true;

            try {
                const response = await window.fetch("/api/brands");
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Không thể tải danh sách hãng xe.");
                }

                this.brandSuggestions = result.brands;
            } catch (error) {
                this.brandSuggestions = [];
                window.console.error(error);
            } finally {
                this.isLoadingBrands = false;
            }
        },

        async loadModelSuggestions() {
            const selectedBrand = this.formData.brand;
            this.isLoadingModels = true;

            try {
                const response = await window.fetch(`/api/models?brand=${encodeURIComponent(selectedBrand)}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Không thể tải danh sách dòng xe.");
                }

                if (this.formData.brand === selectedBrand) {
                    this.modelSuggestions = result.models;
                }
            } catch (error) {
                this.modelSuggestions = [];
                window.console.error(error);
            } finally {
                if (this.formData.brand === selectedBrand) {
                    this.isLoadingModels = false;
                }
            }
        },

        async submitPrediction() {
            this.isLoading = true;
            this.predictionError = "";
            this.predictedResult = null;

            try {
                const response = await window.fetch("/api/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(this.formData),
                });
                const result = await response.json();

                if (!response.ok) {
                    const details = Array.isArray(result.details) ? ` ${result.details.join("; ")}` : "";
                    throw new Error(`${result.error || "Không thể dự đoán giá xe."}${details}`);
                }

                const price = result.predicted_price_million;
                const lower = price * 0.96;
                const upper = price * 1.04;
                this.predictedResult = {
                    price: `${price.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu`,
                    range: `${lower.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu - ${upper.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu VNĐ`,
                };
            } catch (error) {
                this.predictionError = error.message || "Không thể kết nối tới API dự đoán.";
            } finally {
                this.isLoading = false;
            }
        },
    };
};
